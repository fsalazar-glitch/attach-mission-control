import { test, expect } from '@playwright/test'

test.describe('Kanban tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/tasks')
  })

  test('renders kanban column headers', async ({ page }) => {
    await expect(page.getByText(/Inbox/i)).toBeVisible()
    await expect(page.getByText(/In Progress/i)).toBeVisible()
    await expect(page.getByText(/Done/i)).toBeVisible()
  })

  test('search input is visible', async ({ page }) => {
    await expect(page.getByPlaceholder(/Buscar tareas/i)).toBeVisible()
  })

  test('group-by selector is present', async ({ page }) => {
    await expect(page.locator('select').first()).toBeVisible()
  })
})
