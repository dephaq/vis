import { expect, test } from "@playwright/test";

test("creates a project and opens the project workspace", async ({ page }, testInfo) => {
  const projectName = `Кухня-гостиная-столовая ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/projects");

  await page.getByLabel("Project name").fill(projectName);
  await page.getByRole("button", { name: "Create project" }).click();
  await page.waitForURL(/\/projects\/[^/]+$/);

  await expect(page.getByRole("heading", { name: projectName })).toBeVisible();
  await expect(page.getByText("Upload files")).toBeVisible();
  await expect(page.getByText("Prompt editor")).toBeVisible();
});
