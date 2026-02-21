import { test, expect } from "@playwright/test";

test.describe("landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Arizona State University/i);
  });

  test("has visible main content", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("full-page screenshot — desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("landing-desktop.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("full-page screenshot — mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("landing-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("header is visible with nav", async ({ page }) => {
    const header = page.locator("header, [class*='header']");
    await expect(header.first()).toBeVisible();
  });

  test("hero section is visible", async ({ page }) => {
    const hero = page.locator("#hero, .hero, [class*='hero']");
    await expect(hero.first()).toBeVisible();
  });

  test("value section is present", async ({ page }) => {
    await expect(page.locator("#why-this-program")).toBeVisible();
  });

  test("FAQ section is present", async ({ page }) => {
    await expect(page.locator("#faq")).toBeVisible();
  });

  test("testimonial section is present", async ({ page }) => {
    await expect(page.locator("#testimonials")).toBeVisible();
  });

  test("footer is present", async ({ page }) => {
    const footer = page.locator("footer, [class*='footer']");
    await expect(footer.first()).toBeVisible();
  });

  test("anchor navigation works", async ({ page }) => {
    // Wait for header to render with nav links
    const navLink = page.locator('a[href="#faq"]').first();
    if (await navLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await navLink.click();
      await page.waitForTimeout(500);
      const faq = page.locator("#faq");
      await expect(faq).toBeVisible();
    }
  });
});
