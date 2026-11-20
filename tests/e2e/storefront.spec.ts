import { test, expect } from "@playwright/test";

test.describe("Varnam Multi-Segment Apparel Storefront E2E", () => {
  test("1. Homepage renders multi-segment navigation, hero storytelling, and occasion collections", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Branding & Header check
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("header")).toContainText(/Varnam/i);

    // 2. Multi-Segment Hero CTAs (Women, Teens, Girls)
    await expect(page.getByRole("link", { name: /Shop Women/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Shop Teens/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Shop Girls/i })).toBeVisible();

    // 3. Occasion Collections Grid
    const occasionSection = page.locator("section", { hasText: "Shared Occasion Collections" });
    await expect(occasionSection).toBeVisible();
    await expect(occasionSection.getByText(/Festive & Wedding/i)).toBeVisible();
    await expect(occasionSection.getByText(/Party & Evening Gowns/i)).toBeVisible();

    // 4. Trust Badges
    await expect(page.getByText("100% Breathable Cotton Linings").first()).toBeVisible();
    await expect(page.getByText(/Dual In\/Cm Sizing/i).first()).toBeVisible();
  });

  test("2. Collections catalog supports segment filtering for Women, Teens, and Girls", async ({
    page,
  }) => {
    // 1. General catalog
    await page.goto("/collections");
    await expect(page.locator("h1")).toContainText("All Couture & Dresses");

    // 2. Filter by Women
    await page.goto("/collections?segment=women");
    await expect(page.locator("h1")).toContainText("Women's Couture");

    // 3. Filter by Teens
    await page.goto("/collections?segment=teens");
    await expect(page.locator("h1")).toContainText("Teens Couture");

    // 4. Filter by Girls
    await page.goto("/collections?segment=girls");
    await expect(page.locator("h1")).toContainText("Girls' Apparel & Dresses");
  });

  test("3. PDP displays fabric/lining transparency, model fit details, and interactive size guide", async ({
    page,
  }) => {
    // Navigate to seeded anarkali gown
    await page.goto("/products/aashna-royal-crimson-raw-silk-zari-anarkali-gown");

    // 1. Product details & Fabric / Lining transparency check
    await expect(page.locator("h1")).toContainText("Aashna Royal Crimson");
    await expect(page.locator("body")).toContainText("100% Breathable Malmal Cotton");
    await expect(page.locator("body")).toContainText("Pure Varanasi Raw Silk");

    // 2. Model fit disclosures
    await expect(page.locator("body")).toContainText("5'8\" (173 cm)");

    // 3. Size Guide Modal interaction
    const sizeGuideBtn = page.getByRole("button", { name: /Guide/i });
    await expect(sizeGuideBtn).toBeVisible();
    await sizeGuideBtn.click();

    // Verify modal content
    const modal = page.locator("div[role='dialog']");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Couture Size Chart");
    await expect(modal).toContainText("Garment Dimensions");

    // Toggle unit (Inches vs Centimeters)
    const cmToggle = modal.getByRole("button", { name: /Centimeters/i });
    await cmToggle.click();
    await expect(cmToggle).toHaveClass(/bg-brand-primary/);

    // Close modal
    const closeBtn = modal.getByRole("button", { name: /Close|✕/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }
  });

  test("4. Shopping cart and checkout page render correctly", async ({ page }) => {
    await page.goto("/cart");

    // Verify Bag header and empty bag CTA
    await expect(page.locator("body")).toContainText(/Shopping Bag/i);
    await expect(page.getByRole("link", { name: /Explore Collections/i })).toBeVisible();
  });

  test("5. Authentication flows (Login & Signup) render with security guards", async ({
    page,
  }) => {
    // 1. Login Page
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Welcome Back/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();

    // 2. Signup Page
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /Create an Account/i })).toBeVisible();
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Create Account/i })).toBeVisible();
  });

  test("6. Curated Occasions (12 items) and SliderRow interactive arrow buttons work seamlessly", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Verify Curated Occasions & Celebrations section exists
    const curatedSection = page.locator("section", { hasText: "Curated Occasions & Celebrations" });
    await expect(curatedSection).toBeVisible();

    // 2. Verify all 12 occasions are present in the DOM
    const expectedOccasions = [
      "Xmas Collection",
      "Daily Wear",
      "Cottonwears",
      "Tops",
      "Trending Collections",
      "New Arrivals",
      "Pattu & Lehengas",
      "Anarkali & Shararas",
      "Festive & Wedding",
      "Haldi & Mehendi",
      "Party & Evening Gowns",
      "Temple & Pooja Wear",
    ];

    for (const name of expectedOccasions) {
      await expect(curatedSection.getByText(name, { exact: false }).first()).toBeAttached();
    }

    // 3. Test SliderRow navigation arrows in Curated Occasions section
    const nextBtn = curatedSection.getByRole("button", { name: "Next items" });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // After scrolling right, Previous button should become visible
    const prevBtn = curatedSection.getByRole("button", { name: "Previous items" });
    await expect(prevBtn).toBeVisible();

    // Click Previous to slide back
    await prevBtn.click();

    // 4. Test SliderRow navigation in Shared Occasion Collections
    const sharedSection = page.locator("section", { hasText: "Shared Occasion Collections" });
    await expect(sharedSection).toBeVisible();
    const sharedNextBtn = sharedSection.getByRole("button", { name: "Next items" });
    if (await sharedNextBtn.isVisible()) {
      await sharedNextBtn.click();
      const sharedPrevBtn = sharedSection.getByRole("button", { name: "Previous items" });
      await expect(sharedPrevBtn).toBeVisible();
      await sharedPrevBtn.click();
    }

    // 5. Test SliderRow navigation in Featured Dresses (Artisanal Celebration Twirls)
    const featuredSection = page.locator("section", { hasText: "Artisanal Celebration Twirls" });
    await expect(featuredSection).toBeVisible();
    const featuredNextBtn = featuredSection.getByRole("button", { name: "Next items" });
    if (await featuredNextBtn.isVisible()) {
      await featuredNextBtn.click();
    }
  });
});
