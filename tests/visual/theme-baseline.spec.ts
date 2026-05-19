import { test, expect } from '@playwright/test'

test('login page baseline (pre-theme)', async ({ page }) => {
  await page.goto('http://localhost:3000/login')
  await expect(page).toHaveScreenshot('login-baseline.png', { fullPage: true })
})

test('setup page baseline (pre-theme)', async ({ page }) => {
  await page.goto('http://localhost:3000/setup')
  await expect(page).toHaveScreenshot('setup-baseline.png', { fullPage: true })
})