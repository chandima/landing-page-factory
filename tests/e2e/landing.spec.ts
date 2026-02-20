import { test, expect } from "@playwright/test";

test("landing page renders core sections", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Landing Page/i);
  await expect(page.getByRole("main")).toBeVisible();
  // Minimal sanity checks; add pixel/axe checks as you mature the workflow.
  await expect(page.getByText("FAQ")).toBeVisible();
});
