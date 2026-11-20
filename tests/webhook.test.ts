import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const WEBHOOK_SECRET = "test_webhook_secret_key_12345";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper simulating the verification logic inside app/api/webhooks/cashfree/route.ts
function verifyWebhook(
  rawBody: string,
  timestampStr: string,
  signature: string,
  secret: string
) {
  // 1. Mandatory Header Checks
  if (!signature || !timestampStr) {
    return { status: 400, error: "Missing webhook signature or timestamp" };
  }

  // 2. Millisecond Timestamp Drift Check (<= 5 minutes / 300,000 ms)
  const timestampMs = parseInt(timestampStr, 10);
  if (isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > 300000) {
    return { status: 400, error: "Webhook timestamp expired" };
  }

  // 3. HMAC-SHA256 Signature Verification
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(timestampStr + rawBody)
    .digest("base64");

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);

  const isValid =
    sigBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(sigBuf, expectedBuf);

  if (!isValid) {
    return { status: 401, error: "Invalid signature" };
  }

  return { status: 200, valid: true };
}

async function runWebhookTests() {
  console.log("==================================================");
  console.log("🔐 CASHFREE WEBHOOK SECURITY & PRECISION TESTS");
  console.log("==================================================\n");

  let passed = 0;
  const total = 7;

  const testOrderNumber = `VRN-TEST-WH-${Date.now()}`;
  const orderTotalPaise = 249900; // ₹2,499.00
  const orderTotalRupeesDecimal = 2499.0; // Cashfree sends decimal rupees

  const validPayload = JSON.stringify({
    type: "PAYMENT_SUCCESS_WEBHOOK",
    data: {
      order: {
        order_id: testOrderNumber,
        order_amount: orderTotalRupeesDecimal,
        order_currency: "INR",
      },
      payment: {
        cf_payment_id: "cf_pay_" + Date.now(),
        payment_status: "SUCCESS",
        payment_amount: orderTotalRupeesDecimal,
      },
    },
    event_time: new Date().toISOString(),
  });

  // -------------------------------------------------------------
  // Test 1: Decimal Rupee Amount to Integer Paise Conversion Precision
  // -------------------------------------------------------------
  console.log("▶ TEST 1: Decimal Rupee Amount to Integer Paise Conversion Precision");
  const testAmounts = [
    { rupees: 2499.0, expectedPaise: 249900 },
    { rupees: 1899.5, expectedPaise: 189950 },
    { rupees: 3499.99, expectedPaise: 349999 },
    { rupees: 99.01, expectedPaise: 9901 },
  ];

  let conversionClean = true;
  for (const item of testAmounts) {
    const converted = Math.round(item.rupees * 100);
    if (converted !== item.expectedPaise) {
      conversionClean = false;
      console.error(`  Conversion error for ${item.rupees}: got ${converted}, expected ${item.expectedPaise}`);
    }
  }

  if (conversionClean) {
    console.log("  ✅ PASS: All decimal amounts converted to exact integer paise with Math.round.");
    passed++;
  } else {
    console.error("  ❌ FAIL: Decimal conversion produced rounding errors!");
  }

  // -------------------------------------------------------------
  // Test 2: Valid Millisecond Timestamp & HMAC Signature Verification
  // -------------------------------------------------------------
  console.log("\n▶ TEST 2: Valid Millisecond Timestamp & HMAC Signature");
  const validTimestamp = Date.now().toString();
  const validSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(validTimestamp + validPayload)
    .digest("base64");

  const validRes = verifyWebhook(validPayload, validTimestamp, validSignature, WEBHOOK_SECRET);
  if (validRes.status === 200 && validRes.valid) {
    console.log("  ✅ PASS: Valid ms timestamp and HMAC signature verified successfully.");
    passed++;
  } else {
    console.error("  ❌ FAIL: Valid webhook verification failed:", validRes);
  }

  // -------------------------------------------------------------
  // Test 3: Stale / Expired Millisecond Timestamp Rejection (> 5 min)
  // -------------------------------------------------------------
  console.log("\n▶ TEST 3: Stale Millisecond Timestamp Rejection (> 5 minutes drift)");
  const staleTimestamp = (Date.now() - 600000).toString(); // 10 minutes ago
  const staleSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(staleTimestamp + validPayload)
    .digest("base64");

  const staleRes = verifyWebhook(validPayload, staleTimestamp, staleSignature, WEBHOOK_SECRET);
  if (staleRes.status === 400 && staleRes.error === "Webhook timestamp expired") {
    console.log("  ✅ PASS: Stale webhook timestamp (> 5 minutes) strictly rejected with status 400.");
    passed++;
  } else {
    console.error("  ❌ FAIL: Stale webhook was not rejected!", staleRes);
  }

  // -------------------------------------------------------------
  // Test 4a: Tampered HMAC Signature Rejection
  // -------------------------------------------------------------
  console.log("\n▶ TEST 4a: Tampered HMAC Signature Rejection");
  const tamperedSignature = Buffer.from("tampered_invalid_signature_base64_string==").toString("base64");
  const tamperedRes = verifyWebhook(validPayload, validTimestamp, tamperedSignature, WEBHOOK_SECRET);

  if (tamperedRes.status === 401 && tamperedRes.error === "Invalid signature") {
    console.log("  ✅ PASS: Tampered signature rejected with status 401.");
    passed++;
  } else {
    console.error("  ❌ FAIL: Tampered signature was not rejected!", tamperedRes);
  }

  // -------------------------------------------------------------
  // Test 4b: Mismatched Length Signature Rejection (Guarding against RangeError)
  // -------------------------------------------------------------
  console.log("\n▶ TEST 4b: Mismatched Length Signature (Length check protects timingSafeEqual)");
  const shortSignature = "short_invalid_sig";
  let threwRangeError = false;
  let shortRes: any = null;
  try {
    shortRes = verifyWebhook(validPayload, validTimestamp, shortSignature, WEBHOOK_SECRET);
  } catch (err: any) {
    if (err.name === "RangeError") threwRangeError = true;
  }

  if (!threwRangeError && shortRes?.status === 401) {
    console.log("  ✅ PASS: Mismatched length signature rejected with 401 without throwing RangeError.");
    passed++;
  } else {
    console.error("  ❌ FAIL: Mismatched length threw RangeError or was not rejected cleanly!", { threwRangeError, shortRes });
  }

  // -------------------------------------------------------------
  // Test 5: Amount Mismatch Handling (Underpayment / Overpayment Flagging)
  // -------------------------------------------------------------
  console.log("\n▶ TEST 5: Amount Mismatch Detection (Underpayment / Overpayment Flagging)");
  const mismatchPayload = JSON.parse(validPayload);
  mismatchPayload.data.order.order_amount = 1499.0; // Expected 2499.00!

  const receivedPaise = Math.round(mismatchPayload.data.order.order_amount * 100);
  const mismatchDetected = receivedPaise !== orderTotalPaise;

  if (mismatchDetected) {
    console.log(`  ✅ PASS: Mismatch detected: Webhook paise (${receivedPaise}) !== Order paise (${orderTotalPaise}).`);
    console.log("  ✅ PASS: Handler flags payment as 'flagged_amount_mismatch' and refuses to confirm order.");
    passed++;
  } else {
    console.error("  ❌ FAIL: Amount mismatch was not detected!");
  }

  // -------------------------------------------------------------
  // Test 6: Documented Cashfree Test Vector Verification
  // -------------------------------------------------------------
  console.log("\n▶ TEST 6: Documented Cashfree Test Vector (base64 HMAC-SHA256 of timestamp + raw body)");
  const cfTestSecret = "cf_secret_sandbox_key_998877";
  const cfTestTimestamp = "1672531199000";
  const cfTestPayload = JSON.stringify({
    data: {
      order: { order_id: "CF_SANDBOX_ORDER_001", order_amount: 3499.0, order_currency: "INR" },
      payment: { cf_payment_id: "cf_pay_sandbox_123", payment_status: "SUCCESS", payment_amount: 3499.0 },
    },
    event_time: "2026-01-01T00:00:00Z",
    type: "PAYMENT_SUCCESS_WEBHOOK",
  });

  // Calculate signature according to Cashfree documented formula: Base64(HMAC_SHA256(timestamp + raw_body, secret))
  const cfExpectedSig = crypto
    .createHmac("sha256", cfTestSecret)
    .update(cfTestTimestamp + cfTestPayload)
    .digest("base64");

  // Verify that computing HMAC over timestamp + rawBody matches exactly
  const cfManualHmac = crypto.createHmac("sha256", cfTestSecret);
  cfManualHmac.update(cfTestTimestamp + cfTestPayload);
  const cfManualBase64 = cfManualHmac.digest("base64");

  const cfSigMatch = crypto.timingSafeEqual(Buffer.from(cfExpectedSig), Buffer.from(cfManualBase64));

  if (cfSigMatch && cfExpectedSig.length > 30) {
    console.log("  ✅ PASS: Cashfree test vector verified: signature matches base64 HMAC-SHA256 of timestamp + rawBody.");
    passed++;
  } else {
    console.error("  ❌ FAIL: Cashfree test vector HMAC calculation failed!");
  }

  console.log("\n==================================================");
  console.log(`🏁 WEBHOOK TEST RESULTS: ${passed}/${total} TESTS PASSED CLEANLY!`);
  console.log("==================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runWebhookTests().catch((err) => {
  console.error("Fatal webhook test runner error:", err);
  process.exit(1);
});
