import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "http://127.0.0.1:54321";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runTests() {
  console.log("==================================================");
  console.log("🚀 STARTING VARNAM PRECONDITION VERIFICATION TESTS");
  console.log("==================================================\n");

  let passedCount = 0;
  const totalTests = 6;

  // -----------------------------------------------------------------
  // 1. Role Self-Escalation Guard Test
  // -----------------------------------------------------------------
  console.log("▶ TEST 1: Role Self-Escalation Guard");
  const testCustomerEmail = `customer_${Date.now()}@example.com`;
  const { data: userAuth, error: authErr } = await adminClient.auth.admin.createUser({
    email: testCustomerEmail,
    password: "Password123!",
    email_confirm: true,
    user_metadata: { full_name: "Customer One", phone: "+919876543210" },
  });

  if (authErr || !userAuth.user) {
    throw new Error(`Failed to create test user: ${authErr?.message}`);
  }
  const customerId = userAuth.user.id;

  // Sign in as customer to get customer auth context
  const customerClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data: sessionData, error: loginErr } = await customerClient.auth.signInWithPassword({
    email: testCustomerEmail,
    password: "Password123!",
  });

  if (loginErr) {
    throw new Error(`Failed to sign in as test user: ${loginErr.message}`);
  }

  // Attempt role self-escalation
  const { data: escalateData, error: escalateErr } = await customerClient
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", customerId);

  if (escalateErr && escalateErr.message.includes("Only an administrator can modify user roles")) {
    console.log("  ✅ PASS: Role self-escalation blocked by trigger with message:", escalateErr.message);
    passedCount++;
  } else {
    console.error("  ❌ FAIL: Self-escalation was not blocked!", escalateData, escalateErr);
  }

  // -----------------------------------------------------------------
  // 2. Anonymous Catalog Visibility (Only Active in Active Categories)
  // -----------------------------------------------------------------
  console.log("\n▶ TEST 2: Anonymous Catalog Visibility & RLS Isolation");
  // Setup: 1 active category, 1 inactive category
  const { data: activeCat } = await adminClient
    .from("categories")
    .insert({
      name: "Active Festive Category",
      slug: `active-cat-${Date.now()}`,
      segment: "all",
      is_active: true,
    })
    .select()
    .single();

  const { data: inactiveCat } = await adminClient
    .from("categories")
    .insert({
      name: "Inactive Archival Category",
      slug: `inactive-cat-${Date.now()}`,
      segment: "all",
      is_active: false,
    })
    .select()
    .single();

  // 1 active product in active cat, 1 inactive product in active cat, 1 active product in inactive cat
  const { data: activeProd } = await adminClient
    .from("products")
    .insert({
      category_id: activeCat!.id,
      segment: "girls",
      name: "Public Festive Dress",
      slug: `public-dress-${Date.now()}`,
      description: "Beautiful festive dress",
      fabric: "Pure Chanderi Silk",
      lining: "100% Breathable Cotton",
      care_instructions: "Dry clean only",
      is_active: true,
    })
    .select()
    .single();

  const { data: inactiveProd } = await adminClient
    .from("products")
    .insert({
      category_id: activeCat!.id,
      segment: "girls",
      name: "Draft Unreleased Dress",
      slug: `draft-dress-${Date.now()}`,
      description: "Not ready for public",
      fabric: "Cotton",
      lining: "Cotton",
      care_instructions: "Wash normal",
      is_active: false,
    })
    .select()
    .single();

  const { data: prodInInactiveCat } = await adminClient
    .from("products")
    .insert({
      category_id: inactiveCat!.id,
      segment: "girls",
      name: "Dress in Inactive Category",
      slug: `inactive-cat-dress-${Date.now()}`,
      description: "Category is inactive",
      fabric: "Cotton",
      lining: "Cotton",
      care_instructions: "Wash normal",
      is_active: true,
    })
    .select()
    .single();

  // Query as Anonymous
  const { data: anonProducts } = await anonClient.from("products").select("id, name");
  const anonProductIds = (anonProducts || []).map((p) => p.id);

  const seesActiveOnly =
    anonProductIds.includes(activeProd!.id) &&
    !anonProductIds.includes(inactiveProd!.id) &&
    !anonProductIds.includes(prodInInactiveCat!.id);

  // Check that anon CANNOT read customer profiles or orders
  const { data: anonOrders, error: anonOrdersErr } = await anonClient.from("orders").select("id");
  const { data: anonProfiles, error: anonProfilesErr } = await anonClient.from("profiles").select("id");

  const ordersProtected = (!anonOrders || anonOrders.length === 0) || anonOrdersErr !== null;
  const profilesProtected = (!anonProfiles || anonProfiles.length === 0) || anonProfilesErr !== null;

  if (seesActiveOnly && ordersProtected && profilesProtected) {
    console.log("  ✅ PASS: Anonymous users see only active products in active categories.");
    console.log("  ✅ PASS: Anonymous users cannot read orders or customer profiles (RLS enforced).");
    passedCount++;
  } else {
    console.error("  ❌ FAIL: Anon visibility leak!", {
      anonProductIds,
      activeProdId: activeProd?.id,
      inactiveProdId: inactiveProd?.id,
      anonOrders,
      anonProfiles,
    });
  }

  // -----------------------------------------------------------------
  // 3. Concurrent Last-Unit Orders (No Overselling)
  // -----------------------------------------------------------------
  console.log("\n▶ TEST 3: Concurrent Last-Unit Checkout & Row Locking");
  // Setup a variant with stock = 1
  const { data: limitedVariant } = await adminClient
    .from("product_variants")
    .insert({
      product_id: activeProd!.id,
      size_group: "kids",
      size_name: "4-5Y",
      size_age: "4-5Y",
      color_name: "Ruby Rose",
      color_hex: "#881337",
      sku: `SKU-LASTUNIT-${Date.now()}`,
      price: 249900,
      mrp: 349900,
      stock: 1, // Only 1 in stock!
      is_active: true,
    })
    .select()
    .single();

  // Create second customer for concurrency test
  const { data: userAuth2 } = await adminClient.auth.admin.createUser({
    email: `customer2_${Date.now()}@example.com`,
    password: "Password123!",
    email_confirm: true,
    user_metadata: { full_name: "Customer Two" },
  });

  const customerClient2 = createClient(SUPABASE_URL, ANON_KEY);
  await customerClient2.auth.signInWithPassword({
    email: userAuth2.user!.email!,
    password: "Password123!",
  });

  const shippingAddr = {
    name: "Priya Sharma",
    phone: "+919876543210",
    address_line1: "Flat 402, Lotus Palms",
    city: "Bengaluru",
    state: "Karnataka",
    postal_code: "560038",
  };

  const orderPayload = [
    {
      variant_id: limitedVariant!.id,
      quantity: 1,
    },
  ];

  // Fire both checkout requests simultaneously using Promise.all!
  console.log("  ⚡ Firing two concurrent checkouts for variant with stock = 1...");
  const [res1, res2] = await Promise.allSettled([
    customerClient.rpc("create_order_atomic", {
      p_items: orderPayload,
      p_shipping_address: shippingAddr,
      p_payment_method: "cod",
    }),
    customerClient2.rpc("create_order_atomic", {
      p_items: orderPayload,
      p_shipping_address: shippingAddr,
      p_payment_method: "cod",
    }),
  ]);

  let successfulOrder: any = null;
  let failedOrderError: any = null;

  if (res1.status === "fulfilled" && !res1.value.error) {
    successfulOrder = res1.value.data;
  } else {
    failedOrderError = (res1 as any).value?.error || (res1 as any).reason;
  }

  if (res2.status === "fulfilled" && !res2.value.error) {
    if (successfulOrder) {
      console.error("  ❌ CRITICAL FAILURE: BOTH concurrent checkouts succeeded! Overselling occurred!");
    } else {
      successfulOrder = res2.value.data;
    }
  } else {
    failedOrderError = (res2 as any).value?.error || (res2 as any).reason;
  }

  // Check remaining stock
  const { data: updatedVariant } = await adminClient
    .from("product_variants")
    .select("stock")
    .eq("id", limitedVariant!.id)
    .single();

  if (
    successfulOrder &&
    failedOrderError &&
    failedOrderError.message.includes("Insufficient stock") &&
    updatedVariant?.stock === 0
  ) {
    console.log("  ✅ PASS: Concurrency race won by exactly 1 customer!");
    console.log(`     Successful Order: ${successfulOrder.order_number}`);
    console.log(`     Rejected Order Error: "${failedOrderError.message}"`);
    console.log(`     Final Stock in DB: ${updatedVariant.stock}`);
    passedCount++;
  } else {
    console.error("  ❌ FAIL: Concurrency outcome unexpected:", {
      successfulOrder,
      failedOrderError,
      stock: updatedVariant?.stock,
    });
  }

  // -----------------------------------------------------------------
  // 4. Idempotent Restock on Cancellation
  // -----------------------------------------------------------------
  console.log("\n▶ TEST 4: Idempotent Stock Restoration on Cancellation");
  const orderId = successfulOrder.order_id;

  // Cancel the order
  await adminClient
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  const { data: restockedVariant1 } = await adminClient
    .from("product_variants")
    .select("stock")
    .eq("id", limitedVariant!.id)
    .single();

  // Cancel again to test idempotency (should NOT restock twice)
  await adminClient
    .from("orders")
    .update({ status: "cancelled", notes: "Second cancellation test" })
    .eq("id", orderId);

  const { data: restockedVariant2 } = await adminClient
    .from("product_variants")
    .select("stock")
    .eq("id", limitedVariant!.id)
    .single();

  if (restockedVariant1?.stock === 1 && restockedVariant2?.stock === 1) {
    console.log("  ✅ PASS: Order cancellation restored stock to 1.");
    console.log("  ✅ PASS: Idempotency verified — second cancellation kept stock at 1 (no double-restock).");
    passedCount++;
  } else {
    console.error("  ❌ FAIL: Stock restock issue:", {
      afterFirstCancel: restockedVariant1?.stock,
      afterSecondCancel: restockedVariant2?.stock,
    });
  }

  // -----------------------------------------------------------------
  // 5. Block Cancelling Shipped / Delivered Orders
  // -----------------------------------------------------------------
  console.log("\n▶ TEST 5: Block Cancellation of Shipped/Delivered Orders");
  // Place another order and transition to 'shipped'
  const { data: order3Data } = await customerClient.rpc("create_order_atomic", {
    p_items: orderPayload,
    p_shipping_address: shippingAddr,
    p_payment_method: "cod",
  });

  const order3Id = order3Data.order_id;

  // Admin marks order as shipped
  await adminClient
    .from("orders")
    .update({ status: "shipped", tracking_number: "DEL123456" })
    .eq("id", order3Id);

  // Now attempt to cancel shipped order
  const { error: cancelShippedErr } = await adminClient
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", order3Id);

  if (cancelShippedErr && cancelShippedErr.message.includes("order is already shipped")) {
    console.log("  ✅ PASS: Cancelling shipped order is blocked with error:", cancelShippedErr.message);
    passedCount++;
  } else {
    console.error("  ❌ FAIL: Cancelling shipped order was not blocked!", cancelShippedErr);
  }

  // -----------------------------------------------------------------
  // 6. Multi-Segment Catalog, Sizing & Model Fit Disclosures
  // -----------------------------------------------------------------
  console.log("\n▶ TEST 6: Multi-Segment Sizing (Women, Teens, Girls) & Fit Disclosures");
  const { data: womenProd } = await adminClient
    .from("products")
    .insert({
      category_id: activeCat!.id,
      segment: "women",
      name: "Test Royal Crimson Silk Anarkali",
      slug: `test-anarkali-${Date.now()}`,
      description: "Handcrafted pure silk anarkali",
      fabric: "Pure Raw Silk",
      lining: "100% Breathable Malmal Cotton",
      care_instructions: "Dry clean only",
      model_height: "5'8\" (173 cm)",
      model_size_worn: "Size S",
      is_active: true,
    })
    .select()
    .single();

  const { data: womenVariant, error: wVarErr } = await adminClient
    .from("product_variants")
    .insert({
      product_id: womenProd!.id,
      size_group: "women",
      size_name: "S",
      size_age: "S",
      bust_inches: 34,
      bust_cm: 86,
      waist_inches: 28,
      waist_cm: 71,
      hip_inches: 38,
      hip_cm: 97,
      length_inches: 54,
      length_cm: 137,
      color_name: "Royal Crimson",
      color_hex: "#881337",
      sku: `SKU-WOMEN-S-${Date.now()}`,
      price: 349900,
      mrp: 499900,
      stock: 10,
      is_active: true,
    })
    .select()
    .single();

  if (
    womenProd?.segment === "women" &&
    womenProd?.model_height === "5'8\" (173 cm)" &&
    womenVariant?.size_group === "women" &&
    womenVariant?.bust_inches === 34 &&
    womenVariant?.hip_inches === 38
  ) {
    console.log("  ✅ PASS: Multi-segment Women's product verified with bust/hip measurements & model fit.");
    passedCount++;
  } else {
    console.error("  ❌ FAIL: Women's multi-segment product failed validation:", {
      womenProd,
      womenVariant,
      wVarErr,
    });
  }

  console.log("\n==================================================");
  console.log(`🏁 TEST RESULTS: ${passedCount}/${totalTests} TESTS PASSED CLEANLY!`);
  console.log("==================================================\n");

  if (passedCount !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution aborted with error:", err);
  process.exit(1);
});
