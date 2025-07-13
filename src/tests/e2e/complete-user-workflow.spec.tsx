import { test, expect } from '@playwright/test';

test.describe('Complete User Workflow - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('http://localhost:3001/', { timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      test.skip(true, 'Development server is not running. Please start it with "npm run dev"');
    }
  });

  test('should handle search and filtering workflow', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('search test');
    await page.waitForTimeout(600);

    const genreFilter = page.getByTestId('filter-genre');
    const genreOptions = await genreFilter.locator('option').count();
    if (genreOptions > 1) {
      await genreFilter.selectOption('Pop');
    }

    const artistFilter = page.getByTestId('filter-artist');
    await artistFilter.fill('artist filter');
    await page.waitForTimeout(600);

    const sortSelect = page.locator('select').filter({ hasText: 'Назва (А-Я)' });
    await sortSelect.selectOption('artist_asc');

    const clearFiltersButton = page.getByRole('button', { name: 'Очистити фільтри' });
    await expect(clearFiltersButton).toBeVisible({ timeout: 5000 });

    await clearFiltersButton.click();
    await page.waitForTimeout(2000);

    await expect(clearFiltersButton).not.toBeVisible({ timeout: 5000 });
    
    await expect(genreFilter).toHaveValue('');
    await expect(artistFilter).toHaveValue('');
  });

  test('should handle pagination workflow', async ({ page }) => {
    for (let i = 1; i <= 3; i++) {
      const createButton = page.getByTestId('create-track-button');
      await createButton.click();

      const titleInput = page.getByLabel('Назва треку');
      const artistInput = page.getByLabel('Виконавець');

      await titleInput.fill(`Pagination Test Track ${i}`);
      await artistInput.fill(`Pagination Test Artist ${i}`);
      
      // Select genre using the multi-select buttons
      const genreSelector = page.getByTestId('genre-selector');
      const rockGenreButton = genreSelector.locator('button', { hasText: 'Rock' });
      if (await rockGenreButton.isVisible()) {
        await rockGenreButton.click();
      }

      const submitButton = page.getByTestId('submit-button');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      const modalTitle = page.getByRole('heading', { name: 'Створити новий трек' });
      await expect(modalTitle).not.toBeVisible({ timeout: 10000 });
      
      await page.waitForTimeout(1000);
      await page.waitForTimeout(1000);
    }

    const pagination = page.getByTestId('pagination');
    
    if (await pagination.isVisible()) {
      const nextButton = page.getByTestId('pagination-next');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
        
        const prevButton = page.getByTestId('pagination-prev');
        if (await prevButton.isEnabled()) {
          await prevButton.click();
          await page.waitForTimeout(500);
        }
      }
    }

    const trackItems = page.locator('[data-testid*="track-item"]').filter({ hasText: 'Pagination Test Track' });
    const count = await trackItems.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const trackItem = trackItems.nth(i);
        const checkbox = trackItem.locator('input[type="checkbox"]');
        if (await checkbox.isVisible()) {
          await checkbox.check();
          await page.waitForTimeout(100);
        }
      }

      const bulkDeleteButton = page.getByTestId('bulk-delete-button');
      if (await bulkDeleteButton.isVisible()) {
        await expect(bulkDeleteButton).toBeVisible({ timeout: 5000 });
        await bulkDeleteButton.click();

        const confirmButton = page.getByTestId('confirm-button');
        await confirmButton.click();

        await page.waitForTimeout(1000);
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    const createButton = page.getByTestId('create-track-button');
    await createButton.click();

    const submitButton = page.getByTestId('submit-button');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await page.waitForTimeout(1000);

    const modal = page.getByRole('dialog');
    if (await modal.isVisible()) {
      const closeButton = page.getByRole('button', { name: 'Скасувати' }).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }

    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('!@#$%^&*()');
    await page.waitForTimeout(600);

    await expect(searchInput).toHaveValue('!@#$%^&*()');
  });

  test('should handle responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('mobile test');
    await expect(searchInput).toHaveValue('mobile test');

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(searchInput).toBeVisible();
    await searchInput.clear();
    await searchInput.fill('tablet test');
    await expect(searchInput).toHaveValue('tablet test');

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(searchInput).toBeVisible();
    await searchInput.clear();
    await searchInput.fill('desktop test');
    await expect(searchInput).toHaveValue('desktop test');
  });

  test('should handle accessibility features', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeFocused();

    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toHaveText('My tracks');

    const createButton = page.getByTestId('create-track-button');
    await createButton.click();

    const titleLabel = page.getByLabel('Назва треку');
    await expect(titleLabel).toBeVisible();

    const artistLabel = page.getByLabel('Виконавець');
    await expect(artistLabel).toBeVisible();

    const closeButton = page.getByRole('button', { name: 'Скасувати' }).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  });

  test('should handle file upload workflow', async ({ page }) => {
    const createButton = page.getByTestId('create-track-button');
    await createButton.click();

    const titleInput = page.getByLabel('Назва треку');
    const artistInput = page.getByLabel('Виконавець');

    await titleInput.fill('Upload Test Track');
    await artistInput.fill('Upload Test Artist');
    
    // Select genre using the multi-select buttons
    const genreSelector = page.getByTestId('genre-selector');
    const rockGenreButton = genreSelector.locator('button', { hasText: 'Rock' });
    if (await rockGenreButton.isVisible()) {
      await rockGenreButton.click();
    }

    const submitButton = page.getByTestId('submit-button');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const modalTitle = page.getByRole('heading', { name: 'Створити новий трек' });
    await expect(modalTitle).not.toBeVisible({ timeout: 10000 });
    
    // Wait for the track to be created and appear in the list
    await page.waitForTimeout(3000);

    const trackItem = page.locator('[data-testid*="track-item"]').filter({ hasText: 'Upload Test Track' }).first();
    await expect(trackItem).toBeVisible({ timeout: 15000 });

    const uploadButton = trackItem.locator('[data-testid*="upload"]');
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
      
      const fileInput = trackItem.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        await expect(fileInput).toBeVisible();
      }
    }

    const checkbox = trackItem.locator('input[type="checkbox"]');
    await checkbox.check();

    const bulkDeleteButton = page.getByTestId('bulk-delete-button');
    await expect(bulkDeleteButton).toBeVisible({ timeout: 5000 });
    await bulkDeleteButton.click();

    const confirmButton = page.getByTestId('confirm-button');
    await confirmButton.click();

    await page.waitForTimeout(1000);
  });

  test('should handle audio player controls', async ({ page }) => {

    const createButton = page.getByTestId('create-track-button');
    await createButton.click();

    const titleInput = page.getByLabel('Назва треку');
    const artistInput = page.getByLabel('Виконавець');

    await titleInput.fill('Audio Test Track');
    await artistInput.fill('Audio Test Artist');
    
    // Select genre using the multi-select buttons
    const genreSelector = page.getByTestId('genre-selector');
    const rockGenreButton = genreSelector.locator('button', { hasText: 'Rock' });
    if (await rockGenreButton.isVisible()) {
      await rockGenreButton.click();
    }

    const submitButton = page.getByTestId('submit-button');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const modalTitle = page.getByRole('heading', { name: 'Створити новий трек' });
    await expect(modalTitle).not.toBeVisible({ timeout: 10000 });
    
    // Wait for the track to be created and appear in the list
    await page.waitForTimeout(3000);

    const trackItem = page.locator('[data-testid*="track-item"]').filter({ hasText: 'Audio Test Track' }).first();
    await expect(trackItem).toBeVisible({ timeout: 15000 });

    const playButton = trackItem.locator('[data-testid*="play-button"]');
    if (await playButton.isVisible()) {
      await playButton.click();
      
      const pauseButton = trackItem.locator('[data-testid*="pause-button"]');
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
      }
    }

    const checkbox = trackItem.locator('input[type="checkbox"]');
    await checkbox.check();

    const bulkDeleteButton = page.getByTestId('bulk-delete-button');
    await expect(bulkDeleteButton).toBeVisible({ timeout: 5000 });
    await bulkDeleteButton.click();

    const confirmButton = page.getByTestId('confirm-button');
    await confirmButton.click();

    await page.waitForTimeout(1000);
  });
}); 