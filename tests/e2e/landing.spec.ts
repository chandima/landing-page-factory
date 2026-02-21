import { test, expect } from "@playwright/test";

test.describe("landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Landing Page/i);
  });

  test("has visible main content", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("full-page screenshot", async ({ page }) => {
    // Wait for all images and fonts to load
    await page.waitForLoadState("networkidle");
    // Small extra wait for RDS component animations/transitions
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("landing-full.png", {
      fullPage: true,
      // First run creates baseline; subsequent runs compare.
      // Increase threshold if RDS components have minor render variance.
      maxDiffPixelRatio: 0.01,
    });
  });

  test("hero section is visible", async ({ page }) => {
    const hero = page.locator(".hero, [class*='hero'], section:first-of-type");
    await expect(hero.first()).toBeVisible();
  });

  test("FAQ section is present", async ({ page }) => {
    await expect(page.getByText("FAQ")).toBeVisible();
  });

  test("footer is present", async ({ page }) => {
    const footer = page.locator("footer, [class*='footer']");
    await expect(footer.first()).toBeVisible();
  });
});
