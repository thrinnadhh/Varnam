import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/db/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");

    // 1. Mandatory Header Checks
    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: "Missing webhook signature or timestamp" },
        { status: 400 }
      );
    }

    // 2. Millisecond Timestamp Drift Check (≤ 5 minutes)
    const timestampMs = parseInt(timestamp, 10);
    if (isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > 300000) {
      console.warn("Cashfree webhook timestamp expired or drifted:", { timestamp, now: Date.now() });
      return NextResponse.json(
        { error: "Webhook timestamp expired" },
        { status: 400 }
      );
    }

    // 3. HMAC-SHA256 Signature Verification
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(timestamp + rawBody)
        .digest("base64");

      const sigBuf = Buffer.from(signature);
      const expectedBuf = Buffer.from(expectedSignature);

      const isValid =
        sigBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(sigBuf, expectedBuf);

      if (!isValid) {
        console.error("Cashfree webhook signature mismatch");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    } else {
      console.warn("CASHFREE_WEBHOOK_SECRET not set; running in development bypass mode");
    }

    // 4. Parse Payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.type; // e.g. "PAYMENT_SUCCESS_WEBHOOK"
    const orderNumber = payload.data?.order?.order_id;
    const paymentData = payload.data?.payment;

    if (!orderNumber || !paymentData) {
      return NextResponse.json({ received: true, ignored: "Incomplete event payload" });
    }

    console.log(`Processing Cashfree webhook event: ${eventType} for order: ${orderNumber}`);

    const gatewayPaymentId = String(paymentData.cf_payment_id);
    const paymentStatus = paymentData.payment_status; // "SUCCESS", "FAILED"

    // 5. Convert Decimal Rupee Amount to Paise with Math.round
    const rawAmountRupees = Number(payload.data?.order?.order_amount ?? paymentData.payment_amount);
    const amountPaise = Math.round(rawAmountRupees * 100);

    const supabase = createAdminSupabaseClient();

    // 6. Fetch Order from Database
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, status, total_amount, payment_status, notes")
      .eq("order_number", orderNumber)
      .single();

    if (orderErr || !order) {
      console.error("Order not found for Cashfree webhook:", orderNumber);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 7. Amount Reconciliation Check
    if (amountPaise !== order.total_amount) {
      console.error("CRITICAL: Payment amount mismatch!", {
        orderNumber,
        expectedPaise: order.total_amount,
        webhookPaise: amountPaise,
      });

      await supabase.from("payments").insert({
        order_id: order.id,
        gateway: "cashfree",
        gateway_order_id: orderNumber,
        gateway_payment_id: gatewayPaymentId,
        payment_status: "flagged_amount_mismatch",
        refund_status: "refund_required",
        amount: amountPaise,
        raw_response: payload,
      });

      return NextResponse.json(
        { error: "Amount discrepancy flagged" },
        { status: 400 }
      );
    }

    // 8. Idempotent Payment Insertion
    const { error: paymentInsertErr } = await supabase.from("payments").insert({
      order_id: order.id,
      gateway: "cashfree",
      gateway_order_id: orderNumber,
      gateway_payment_id: gatewayPaymentId,
      payment_status: paymentStatus === "SUCCESS" ? "paid" : "failed",
      amount: amountPaise,
      raw_response: payload,
    });

    if (paymentInsertErr) {
      // If duplicate key on (gateway, gateway_payment_id), it is already processed
      if (paymentInsertErr.code === "23505") {
        console.log("Idempotent webhook repeat handled for payment:", gatewayPaymentId);
        return NextResponse.json({ success: true, duplicate: true });
      }
      console.error("Payment insert error:", paymentInsertErr);
    }

    // 9. Late Payment & Order Status Transition
    if (paymentStatus === "SUCCESS") {
      if (order.status === "cancelled") {
        // Late payment after timeout/cancellation: DO NOT unsell or confirm order!
        // Database trigger tr_handle_late_payment already sets refund_status = 'refund_required'.
        console.warn("Late payment received for cancelled order:", orderNumber);
      } else if (order.status === "pending") {
        // Normal checkout completion: transition to confirmed & paid
        await supabase
          .from("orders")
          .update({
            status: "confirmed",
            payment_status: "paid",
          })
          .eq("id", order.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Cashfree webhook processing failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
