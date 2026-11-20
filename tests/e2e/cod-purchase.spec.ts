import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

test.describe("Varnam COD Purchase & Order Ownership E2E Flow", () => {
  let customerEmail = "";
  const customerPassword = "CustomerSecurePassword123!";

  test.beforeAll(async () => {
    customerEmail = `parent_${Date.now()}@example.com`;
    const { data: userAuth, error } = await admin.auth.admin.createUser({
      email: customerEmail,
      password: customerPassword,
      email_confirm: true,
      user_metadata: { full_name: "Pooja Sharma", phone: "9876543210" },
    });
    if (error) {
      throw new Error(`Failed to create test customer: ${error.message}`);
    }
  });

  test("Complete Cash on Delivery purchase flow and verify ownership enforcement", async ({
    page,
  }) => {
    // 1. Sign in as test customer
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(customerEmail);
    await page.locator('input[type="password"]').fill(customerPassword);
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Verify redirected to /account
    await expect(page).toHaveURL(/\/account/);
    await expect(page.locator("body")).toContainText("My Orders");

    // 2. Browse PDP and Add to Bag
    await page.goto("/products/aashna-royal-crimson-raw-silk-zari-anarkali-gown");
    await expect(page.locator("h1")).toContainText("Aashna Royal Crimson");

    // Select Size "S"
    const sizeChip = page.getByRole("button", { name: /^S\b/ });
    await expect(sizeChip).toBeVisible();
    await sizeChip.click();

    // Click Add to Bag
    const addBtn = page.getByRole("button", { name: /Add to Bag/i });
    await addBtn.click();
    await expect(page.getByRole("button", { name: /Added/i })).toBeVisible();

    // 3. Proceed to Checkout
    await page.goto("/checkout");
    await expect(page.locator("h1")).toContainText("Secure Checkout");

    // 4. Fill Address
    const nameInput = page.locator('input[placeholder="e.g. Radhika V."]');
    if (await nameInput.isVisible()) {
      await nameInput.fill("Pooja Sharma");
      await page.locator('input[placeholder="9876543210"]').fill("9876543210");
      await page.locator('input[placeholder="e.g. 402, Lotus Towers, 14th Cross"]').fill("402, Lotus Residency, MG Road");
      await page.locator('input[placeholder="560034"]').fill("560001");
      await page.locator('input[placeholder="Bengaluru"]').fill("Bengaluru");
      await page.locator('input[placeholder="Karnataka"]').fill("Karnataka");
    }

    // 5. Select Cash on Delivery
    const codOption = page.locator("label", { hasText: /Cash on Delivery/i });
    await expect(codOption).toBeVisible();
    await codOption.click();

    // 6. Submit Order
    const placeOrderBtn = page.getByRole("button", { name: /Place Cash on Delivery Order/i });
    await expect(placeOrderBtn).toBeVisible();
    await placeOrderBtn.click();

    // 7. Verify navigation to /orders/VRN-...
    await expect(page).toHaveURL(/\/orders\/VRN-/, { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Thank You For Trusting Varnam");
    await expect(page.locator("body")).toContainText("Cash on Delivery");
    await expect(page.locator("body")).toContainText("Aashna Royal Crimson");
    await expect(page.locator("body")).toContainText("402, Lotus Residency");

    // 8. Security Ownership Check:
    // A fresh unauthenticated browser context attempting to view this order must be redirected to login
    const currentOrderUrl = page.url();
    const guestContext = await page.context().browser()!.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto(currentOrderUrl);
    await expect(guestPage).toHaveURL(/\/login\?redirectTo=/);
    await guestContext.close();
  });
});
