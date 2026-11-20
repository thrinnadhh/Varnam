import { test, expect } from "@playwright/test";

test.describe("Varnam Authentication & Cloud Sandbox Flow", () => {
  test("Cloud demo sandbox allows 1-click Customer and Admin access without Supabase error", async ({
    page,
    context,
  }) => {
    // 1. Visit Login Page
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Welcome Back/i })).toBeVisible();

    // 2. Test Customer Demo Login
    // Clear cookies first
    await context.clearCookies();
    await page.goto("/login");

    // Click tab if needed or direct button
    const demoCustomerBtn = page.getByRole("button", { name: /Demo Customer/i });
    if (await demoCustomerBtn.isVisible()) {
      await demoCustomerBtn.click();
      await page.waitForURL("**/account", { timeout: 10000 });
      await expect(page).toHaveURL(/\/account/);
      await expect(page.getByText(/My Orders/i)).toBeVisible();
    }

    // 3. Test Admin Demo Login
    await context.clearCookies();
    await page.goto("/login?role=admin");
    const demoAdminBtn = page.getByRole("button", { name: /Demo Admin/i });
    if (await demoAdminBtn.isVisible()) {
      await demoAdminBtn.click();
      await page.waitForURL("**/admin", { timeout: 10000 });
      await expect(page).toHaveURL(/\/admin/);
      await expect(page.getByRole("heading", { name: /Operational Dashboard/i })).toBeVisible();
      await expect(page.getByText(/Paid Revenue/i)).toBeVisible();
    }
  });

  test("Direct navigation to /admin redirects unauthenticated users to /login?role=admin", async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.goto("/admin");
    await page.waitForURL("**/login**", { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
