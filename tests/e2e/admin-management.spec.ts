import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

test.describe("Varnam Admin Product & Order Management E2E Flow", () => {
  let adminEmail = "";
  const adminPassword = "AdminSecurePassword123!";

  test.beforeAll(async () => {
    adminEmail = `admin_${Date.now()}@varnam.com`;
    const { data: userAuth, error } = await admin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Lead Merchant Admin" },
    });
    if (error) {
      throw new Error(`Failed to create admin user: ${error.message}`);
    }

    // Explicitly grant admin role via service_role client
    const { error: roleErr } = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userAuth.user!.id);
    if (roleErr) {
      throw new Error(`Failed to set admin role: ${roleErr.message}`);
    }
  });

  test("Admin dashboard metrics, product publishing with measurement drafts, and order fulfillment", async ({
    page,
  }) => {
    // 1. Sign in as Admin directly to /admin
    await page.goto("/login?redirectTo=/admin");
    await page.locator('input[type="email"]').fill(adminEmail);
    await page.locator('input[type="password"]').fill(adminPassword);
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Verify redirected to /admin
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Operational Dashboard");
    await expect(page.getByText("Paid Revenue")).toBeVisible();
    await expect(page.getByText("Total Orders")).toBeVisible();

    // 2. Navigate to /admin/products
    await page.goto("/admin/products");
    await expect(page.locator("h1")).toContainText("Catalog & Inventory Management");

    // Click "Add New Dress"
    const addDressBtn = page.getByRole("button", { name: /Add New Dress/i });
    await expect(addDressBtn).toBeVisible();
    await addDressBtn.click();

    // Ensure categories have loaded and select category
    const categorySelect = page.locator('select').nth(1);
    await expect(categorySelect.locator('option')).not.toHaveCount(0);
    const categoryValue = await categorySelect.locator('option').first().getAttribute('value');
    if (categoryValue) {
      await categorySelect.selectOption(categoryValue);
    }

    // Fill Product Details Form
    const uniqueSlug = `festive-twirl-${Date.now()}`;
    await page.locator('input[placeholder="e.g. Aashna Royal Crimson Silk Anarkali"]').fill("Aashna Golden Zari Twirl Frock");
    await page.locator('input[placeholder="aashna-royal-crimson-anarkali"]').fill(uniqueSlug);
    await page.locator('textarea[placeholder="Exquisite handcrafted dress with shimmering border and comfortable silhouette."]').fill(
      "Artisanal golden twirl dress crafted from handloom tissue silk with breathable malmal lining."
    );
    await page.locator('input[placeholder="e.g. Pure Chanderi Silk"]').fill("Handloom Chanderi Silk");
    await page.locator('input[placeholder="e.g. 100% Breathable Malmal Cotton"]').fill("100% Breathable Malmal Cotton");

    // Verify Draft Measurement Table is shown
    await expect(page.getByText("Auto-Generated Measurements Draft")).toBeVisible();

    // Confirm Draft Checkbox
    const confirmCheckbox = page.locator('#confirmDraft');
    await expect(confirmCheckbox).toBeVisible();
    await confirmCheckbox.check();

    // Submit Product Creation
    const submitBtn = page.getByRole("button", { name: /Save Product & Variants/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify success feedback message
    await expect(page.getByText("Couture dress and confirmed variant measurements created successfully!")).toBeVisible();

    // 3. Navigate to /admin/orders
    await page.goto("/admin/orders");
    await expect(page.locator("h1")).toContainText("Order Fulfillment Management");

    // Look for an order update button
    const updateBtn = page.getByRole("button", { name: /Update/i }).first();
    if (await updateBtn.isVisible()) {
      await updateBtn.click();

      // Modal opens
      await expect(page.getByText("Fulfillment Update")).toBeVisible();

      // Change status to shipped
      await page.locator("select").first().selectOption("shipped");
      await page.locator('input[placeholder="e.g. BLD12345678"]').fill("BD-9876543210");

      // Save update
      const saveBtn = page.getByRole("button", { name: /Save Changes/i });
      await saveBtn.click();
    }
  });
});
