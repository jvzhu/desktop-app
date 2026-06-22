import { test, expect } from '@playwright/test';

test('renders desktop shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Desktop App')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
});
