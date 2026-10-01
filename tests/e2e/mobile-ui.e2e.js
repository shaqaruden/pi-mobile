import { expect, test } from "@playwright/test";

// Exercise workspace fixtures without invoking a real biometric ceremony.
test.beforeEach(async ({ page }) => {
  await page.route("**/app/core/faceid.js", route => route.fulfill({
    contentType: "application/javascript",
    body: "export function installFaceIdGuard() { return { start() {} }; }",
  }));
});

for (const width of [320, 390, 740, 1200]) {
  test(`workspace reflows at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/?replay=tools");
    await page.waitForFunction(() => document.documentElement.dataset.replayDone === "1");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const composer = await page.locator("#inp").boundingBox();
    expect(composer.y + composer.height).toBeLessThanOrEqual(844);
    expect((await page.locator("#kb-enter").boundingBox()).height).toBeGreaterThanOrEqual(44);
    if (width <= 740) {
      await page.getByRole("button", { name: "Open sessions" }).click();
      await expect(page.getByRole("button", { name: "Close sessions" })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.locator("#kb-menu")).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#kb-menu")).toBeFocused();
    }
    await page.locator("#btn-thinking").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#btn-thinking")).toBeFocused();
  });
}
