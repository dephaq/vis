import { expect, test } from "@playwright/test";

test("serves manifest and service worker shell", async ({ page, request }) => {
  await page.goto("/");

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);

  const worker = await request.get("/sw.js");
  expect(worker.ok()).toBeTruthy();
  expect(await worker.text()).toContain("viz-mvp-shell");
});
