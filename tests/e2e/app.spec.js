const { test, expect } = require("@playwright/test");

const E2E_EMAIL = process.env.E2E_EMAIL || "";
const E2E_PASSWORD = process.env.E2E_PASSWORD || "";

async function completeOnboardingIfVisible(page) {
  const overlay = page.locator("#onboarding-overlay");
  const visible = await overlay.isVisible();
  if (!visible) {
    return;
  }

  await page.fill("#onboarding-form input[name='market']", "E2E City, ST");
  await page.click("#onboarding-form button[type='submit']");
  await expect(overlay).toHaveClass(/hidden/);
}

test("shows guest mode for signed-out visitors", async ({ page }) => {
  await page.goto("/app");
  await completeOnboardingIfVisible(page);
  await expect(page.locator("h1")).toHaveText("B-Roll Bank");
  await expect(page.locator("#auth-user-email")).toContainText("Guest mode");
  await expect(page.locator("#auth-overlay")).toHaveClass(/hidden/);

  await page.click("#auth-open-btn");
  await expect(page.locator("#auth-overlay")).toBeVisible();
  await expect(page.locator("#sign-in-submit")).toBeVisible();
});

test.describe("authenticated workflow", () => {
  test.skip(!E2E_EMAIL || !E2E_PASSWORD, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated tests.");

  test("signs in, saves clip metadata, and creates a draft", async ({ page }) => {
    const uniqueSuffix = Date.now().toString().slice(-6);
    const locationTag = `E2E Porch ${uniqueSuffix}`;
    const topic = `E2E Topic ${uniqueSuffix}`;

    await page.goto("/app");
    await completeOnboardingIfVisible(page);
    await page.click("#auth-open-btn");

    await page.fill("#sign-in-email", E2E_EMAIL);
    await page.fill("#sign-in-password", E2E_PASSWORD);
    await page.click("[data-testid='sign-in-submit']");

    await expect(page.locator("#auth-overlay")).toHaveClass(/hidden/);
    await expect(page.locator("#auth-user-email")).toContainText(E2E_EMAIL);

    await page.click("button[data-tab='library']");
    await page.selectOption("#clip-category", { index: 1 });
    await page.fill("#clip-form input[name='locationTag']", locationTag);
    await page.fill("#clip-form input[name='outfitTag']", "E2E Fit");
    await page.fill("#clip-form input[name='tags']", "e2e,smoke");
    await page.fill("#clip-form input[name='notes']", "created by playwright");
    await page.click("[data-testid='save-clip-btn']");

    await expect(page.locator("#library-list")).toContainText(locationTag);

    await page.click("button[data-tab='post']");
    await page.fill("#caption-first-form input[name='topic']", topic);
    await page.click("[data-testid='generate-caption-btn']");

    await expect(page.locator("#caption-output")).toContainText(topic);

    await page.click("#caption-output button[data-save-draft='1']");
    await expect(page.locator("#draft-list")).toContainText(topic);
  });
});
