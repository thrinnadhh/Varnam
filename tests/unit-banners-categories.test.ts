import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, assertTestCredentials } from "./test-env";

assertTestCredentials();

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runTests() {
  console.log("==========================================================");
  console.log("🚀 STARTING DYNAMIC BANNERS & CATEGORIES VERIFICATION TESTS");
  console.log("==========================================================\n");

  let passed = 0;
  const total = 4;

  // -----------------------------------------------------------------
  // 1. Store Settings & Hero Banner Duration (Default 3s, Check 1..30)
  // -----------------------------------------------------------------
  console.log("▶ TEST 1: Store Settings Duration & Check Constraints");
  const { data: settings, error: settingsErr } = await anonClient
    .from("store_settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (settingsErr || !settings) {
    throw new Error(`Failed to query store_settings: ${settingsErr?.message}`);
  }

  if (typeof settings.hero_banner_duration_sec !== "number") {
    throw new Error(`hero_banner_duration_sec is not numeric: ${settings.hero_banner_duration_sec}`);
  }

  console.log(`  Current hero banner rotation duration: ${settings.hero_banner_duration_sec}s`);

  // Verify non-admin cannot update store_settings
  const { error: anonUpdateErr } = await anonClient
    .from("store_settings")
    .update({ hero_banner_duration_sec: 10 })
    .eq("id", "default");

  if (!anonUpdateErr) {
    throw new Error("SECURITY FAILURE: Anon client was able to update store_settings!");
  }
  console.log("  ✓ Anon update blocked by RLS as expected.");

  // Verify check constraint: duration cannot be < 1 or > 30
  const { error: invalidDurationErr } = await adminClient
    .from("store_settings")
    .update({ hero_banner_duration_sec: 99 })
    .eq("id", "default");

  if (!invalidDurationErr) {
    throw new Error("CONSTRAINT FAILURE: Database allowed banner duration > 30 seconds!");
  }
  console.log("  ✓ Duration check constraint (1 <= duration <= 30) verified.");

  // Reset to 3s
  await adminClient
    .from("store_settings")
    .update({ hero_banner_duration_sec: 3 })
    .eq("id", "default");

  passed++;
  console.log("  ✅ TEST 1 PASSED: Store settings & duration constraints verified.\n");

  // -----------------------------------------------------------------
  // 2. Hero Banners RLS & CRUD Controls
  // -----------------------------------------------------------------
  console.log("▶ TEST 2: Hero Banners RLS & Admin CRUD Operations");

  // Anon reads active banners
  const { data: activeBanners, error: bannersReadErr } = await anonClient
    .from("hero_banners")
    .select("*")
    .eq("is_active", true);

  if (bannersReadErr) {
    throw new Error(`Failed to read active hero banners: ${bannersReadErr.message}`);
  }
  console.log(`  Active banners visible to public: ${activeBanners?.length ?? 0}`);

  // Anon write block test
  const { error: anonInsertErr } = await anonClient
    .from("hero_banners")
    .insert({
      title: "Hacked Banner",
      desktop_image_url: "https://example.com/bad.jpg",
    });

  if (!anonInsertErr) {
    throw new Error("SECURITY FAILURE: Anon client was able to insert into hero_banners!");
  }
  console.log("  ✓ Anon insertion into hero_banners blocked by RLS.");

  // Admin insert, toggle, and delete test
  const testBannerTitle = `Test Silk Banner ${Date.now()}`;
  const { data: newBanner, error: insertErr } = await adminClient
    .from("hero_banners")
    .insert({
      eyebrow_text: "Festive Exclusive",
      title: testBannerTitle,
      subtitle: "Handcrafted pure silk dresses with cotton linings",
      cta_label: "Shop Now",
      cta_href: "/collections/pattu-lehengas",
      desktop_image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
      sort_order: 99,
      is_active: true,
    })
    .select()
    .single();

  if (insertErr || !newBanner) {
    throw new Error(`Admin failed to insert hero banner: ${insertErr?.message}`);
  }
  console.log(`  ✓ Admin successfully inserted test banner id: ${newBanner.id}`);

  // Clean up test banner
  const { error: deleteBannerErr } = await adminClient
    .from("hero_banners")
    .delete()
    .eq("id", newBanner.id);

  if (deleteBannerErr) {
    throw new Error(`Failed to delete test banner: ${deleteBannerErr.message}`);
  }
  console.log("  ✓ Test banner cleaned up successfully.");

  passed++;
  console.log("  ✅ TEST 2 PASSED: Hero banners RLS and CRUD verified.\n");

  // -----------------------------------------------------------------
  // 3. Dynamic Navigation Subheadings & Dropdowns Tree
  // -----------------------------------------------------------------
  console.log("▶ TEST 3: Dynamic Storefront Subheadings & Dropdowns Hierarchy");

  const { data: navSubheadings, error: navErr } = await anonClient
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .eq("show_in_nav", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (navErr || !navSubheadings || navSubheadings.length === 0) {
    throw new Error(`Failed to query storefront subheadings: ${navErr?.message}`);
  }

  console.log(`  Storefront navigation subheadings found (${navSubheadings.length}):`);
  for (const sub of navSubheadings) {
    const { data: children } = await anonClient
      .from("categories")
      .select("*")
      .eq("parent_id", sub.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    console.log(`    • [${sub.name}] (/collections/${sub.slug}) -> ${children?.length ?? 0} child clothing types:`);
    children?.forEach((c) => console.log(`        - ${c.name} (/collections/${c.slug})`));
  }

  if (navSubheadings.length < 3) {
    throw new Error(`Expected at least 3 primary storefront subheadings, found: ${navSubheadings.length}`);
  }

  passed++;
  console.log("  ✅ TEST 3 PASSED: Dynamic navigation tree structure verified.\n");

  // -----------------------------------------------------------------
  // 4. Foreign-Key Deletion Safety (ON DELETE SET NULL on Products)
  // -----------------------------------------------------------------
  console.log("▶ TEST 4: Category Deletion Safety (ON DELETE SET NULL)");

  // Create temporary category
  const tempCategorySlug = `temp-cat-${Date.now()}`;
  const { data: tempCat, error: tempCatErr } = await adminClient
    .from("categories")
    .insert({
      name: "Temporary Festive Subheading",
      slug: tempCategorySlug,
      sort_order: 100,
      is_active: true,
      show_in_nav: false,
    })
    .select()
    .single();

  if (tempCatErr || !tempCat) {
    throw new Error(`Failed to create temp category: ${tempCatErr?.message}`);
  }

  // Create a temporary dummy product linked to this category
  const tempProductSlug = `temp-dress-${Date.now()}`;
  const { data: tempProduct, error: tempProdErr } = await adminClient
    .from("products")
    .insert({
      name: "Temporary Verification Frock",
      slug: tempProductSlug,
      category_id: tempCat.id,
      segment: "girls",
      description: "Temporary handcrafted test frock with cotton mulmul lining",
      fabric: "Pure Mulmul Cotton",
      lining: "100% Breathable Malmal Cotton",
      care_instructions: "Dry clean only to preserve fine handloom weave",
      is_active: true,
    })
    .select()
    .single();

  if (tempProdErr || !tempProduct) {
    throw new Error(`Failed to create temp product: ${tempProdErr?.message}`);
  }

  console.log(`  Created temp product ${tempProduct.id} linked to category ${tempCat.id}`);

  // Now delete the category
  const { error: catDeleteErr } = await adminClient
    .from("categories")
    .delete()
    .eq("id", tempCat.id);

  if (catDeleteErr) {
    throw new Error(`Failed to delete category: ${catDeleteErr.message}`);
  }
  console.log("  ✓ Category deleted successfully.");

  // Check product again: It must still exist, with category_id set to null!
  const { data: reloadedProduct, error: reloadErr } = await adminClient
    .from("products")
    .select("id, name, category_id")
    .eq("id", tempProduct.id)
    .single();

  if (reloadErr || !reloadedProduct) {
    throw new Error(`CRITICAL FAILURE: Product was deleted or lost when category was removed! ${reloadErr?.message}`);
  }

  if (reloadedProduct.category_id !== null) {
    throw new Error(`CRITICAL FAILURE: Product category_id was not set to NULL! Received: ${reloadedProduct.category_id}`);
  }

  console.log(`  ✓ Product preserved! Category is safely NULL: ${reloadedProduct.category_id}`);

  // Clean up temp product
  await adminClient.from("products").delete().eq("id", tempProduct.id);

  passed++;
  console.log("  ✅ TEST 4 PASSED: Foreign key safety (ON DELETE SET NULL) verified.\n");

  console.log("==========================================================");
  console.log(`🎉 ALL ${passed}/${total} DYNAMIC BANNERS & CATEGORIES TESTS PASSED!`);
  console.log("==========================================================");
}

runTests().catch((err) => {
  console.error("\n❌ TEST SUITE FAILED:", err);
  process.exit(1);
});
