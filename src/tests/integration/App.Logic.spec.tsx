import { test, expect } from '@playwright/test';

test.describe('Home Page - Main elements and interaction', () => {

  test('should display the home page with correct header and main controls', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    const header = page.getByTestId('tracks-header');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('My tracks');

    const searchInput = page.getByPlaceholder('Пошук за назвою/артистом...');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveValue('');

    const genreFilter = page.getByTestId('filter-genre');
    await expect(genreFilter).toBeVisible();

    const artistFilterInput = page.getByTestId('filter-artist');
    await expect(artistFilterInput).toBeVisible();
    await expect(artistFilterInput).toHaveValue('');

    const createTrackButton = page.getByTestId('create-track-button');
    await expect(createTrackButton).toBeVisible();
    await expect(createTrackButton).toHaveText('Створити трек');

    const bulkDeleteButton = page.getByTestId('bulk-delete-button');
    await expect(bulkDeleteButton).not.toBeVisible();
  });

  test('should open CreateTrackModal when "Створити трек" button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/', { timeout: 60000 });

    const createTrackButton = page.getByTestId('create-track-button');
    await expect(createTrackButton).toBeVisible();

    await createTrackButton.click();

    const createModalTitle = page.getByRole('heading', { name: 'Створити новий трек' });
    await expect(createModalTitle).toBeVisible();

    await expect(page.getByLabel('Назва треку')).toBeVisible();
    await expect(page.getByLabel('Виконавець')).toBeVisible();
  });
});