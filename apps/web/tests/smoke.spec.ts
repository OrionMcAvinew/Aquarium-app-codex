import { expect, test } from '@playwright/test';

test('dashboard renders with telemetry card and risk section', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Operations Dashboard')).toBeVisible();
  await expect(page.getByText('Realtime Telemetry')).toBeVisible();
  await expect(page.getByText('Risk Explanations')).toBeVisible();
});

test('navigation shows key pages', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Notifications' }).click();
  await expect(page.getByText('Notifications Center')).toBeVisible();
  await page.getByRole('link', { name: 'Organizations' }).click();
  await expect(page.getByText('Organizations & RBAC')).toBeVisible();
});
