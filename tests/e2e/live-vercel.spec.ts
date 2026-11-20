import { test, expect } from "@playwright/test";

test.describe("Live Vercel Production Deployment Check", () => {
  test("Live site https://varnam-blush.vercel.app loads smoothly without error", async ({
    page,
  }) => {
    await page.goto("https://varnam-blush.vercel.app", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: /Varnam/i }).first()).toBeVisible();
    await expect(page.getByText(/Royal Zari & Handloom Tissue Lehengas/i)).toBeVisible();
  });

  test("Live /login has Cloud Sandbox Notice and 1-Click access works", async ({
    page,
    context,
  }) => {
    await page.goto("https://varnam-blush.vercel.app/login", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /Welcome Back/i })).toBeVisible();

    // Check Cloud Sandbox banner
    await expect(page.getByText(/Interactive Cloud Sandbox Active/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Demo Customer/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Demo Admin/i })).toBeVisible();

    // 1. Click Demo Customer
    await page.getByRole("button", { name: /Demo Customer/i }).click();
    await page.waitForURL("**/account", { timeout: 15000 });
    await expect(page).toHaveURL(/account/);
    await expect(page.getByText(/My Orders/i)).toBeVisible();
    await expect(page.getByText(/VARNAM-2024-8842/i)).toBeVisible();

    // 2. Clear cookies and test Demo Admin
    await context.clearCookies();
    await page.goto("https://varnam-blush.vercel.app/login?role=admin", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Demo Admin/i }).click();
    await page.waitForURL("**/admin", { timeout: 15000 });
    await expect(page).toHaveURL(/admin/);
    await expect(page.getByRole("heading", { name: /Operational Dashboard/i })).toBeVisible();
    await expect(page.getByText(/Paid Revenue/i)).toBeVisible();
  });
});
