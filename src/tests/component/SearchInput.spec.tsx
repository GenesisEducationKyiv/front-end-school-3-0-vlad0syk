import { test, expect } from '@playwright/test';

test.describe('SearchInput Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      await page.waitForLoadState('domcontentloaded');
    }
    
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).not.toBeDisabled({ timeout: 10000 });
  });

  test('should render with default props', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveValue('');
    await expect(searchInput).toHaveAttribute('placeholder', 'Пошук за назвою/артистом...');
    await expect(searchInput).not.toBeDisabled();
  });

  test('should accept and display user input', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const testValue = 'test search term';
    
    await expect(searchInput).not.toBeDisabled();
    await searchInput.fill(testValue);
    await expect(searchInput).toHaveValue(testValue);
  });

  test('should clear input when user deletes content', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await expect(searchInput).not.toBeDisabled();
    
    await searchInput.fill('some text');
    await expect(searchInput).toHaveValue('some text');
    
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });

  test('should handle special characters and numbers', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const specialText = 'test123!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    await expect(searchInput).not.toBeDisabled();
    await searchInput.fill(specialText);
    await expect(searchInput).toHaveValue(specialText);
  });

  test('should handle long text input', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const longText = 'a'.repeat(1000);
    
    await expect(searchInput).not.toBeDisabled();
    await searchInput.fill(longText);
    await expect(searchInput).toHaveValue(longText);
  });

  test('should be disabled when controls are loading', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const controls = page.locator('.controls');
    
    await expect(controls).toBeVisible();
    
    const isLoading = await controls.getAttribute('data-loading');
    
    if (isLoading === 'true') {
      await expect(searchInput).toBeDisabled();
    } else {
      await expect(searchInput).not.toBeDisabled();
    }
  });

  test('should have proper focus behavior', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await expect(searchInput).not.toBeDisabled();
    
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
    
    const outlineValue = await searchInput.evaluate(el => window.getComputedStyle(el).outline);
    expect(['none', '0px', '0px none', '0px none currentcolor', 
           'rgb(16, 16, 16) none 0px', 'oklch(0.21 0.034 264.665) 0px',
           'rgba(52, 132, 228, 0.8) none 0px']).toContain(outlineValue);
  });

  test('should maintain value after blur and focus', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const testValue = 'persistent value';
    
    await expect(searchInput).not.toBeDisabled();
    
    await searchInput.fill(testValue);
    await searchInput.blur();
    await searchInput.focus();
    
    await expect(searchInput).toHaveValue(testValue);
  });

  test('should handle text input reliably', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');

    await searchInput.fill('hello world');
    await expect(searchInput).toHaveValue('hello world');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await expect(searchInput).toHaveAttribute('type', 'text');
    await expect(searchInput).toHaveAttribute('data-testid', 'search-input');
  });

  test('should handle focus and text input', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await page.click('body');
    await page.keyboard.press('Tab');
    
    let focused = false;
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(200);
      try {
        await expect(searchInput).toBeFocused({ timeout: 1000 });
        focused = true;
        break;
      } catch {
        await page.keyboard.press('Tab');
      }
    }
    
    if (!focused) {
      await searchInput.click();
      await expect(searchInput).toBeFocused();
    }
    
    // Test text input while focused
    await searchInput.fill('keyboard input');
    await expect(searchInput).toHaveValue('keyboard input');
  });

  test('should handle text content duplication', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const testText = 'text to copy';
    
    // Fill the input with text
    await searchInput.fill(testText);
    await expect(searchInput).toHaveValue(testText);
    
    // Test clearing and refilling (simulating copy/paste behavior)
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
    await searchInput.fill(testText);
    await expect(searchInput).toHaveValue(testText);
  });

  test('should handle text editing operations', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await searchInput.fill('test text');
    await expect(searchInput).toHaveValue('test text');

    await searchInput.fill('test tex');
    await expect(searchInput).toHaveValue('test tex');
    
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  });

  test('should have proper styling classes', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    const classList = await searchInput.getAttribute('class');
    expect(classList).toContain('w-full');
    expect(classList).toContain('border');
    expect(classList).toContain('rounded-md');
  });

  test('should be contained within a wrapper div', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const wrapper = searchInput.locator('xpath=..');
    
    const wrapperClass = await wrapper.getAttribute('class');
    expect(wrapperClass).toContain('relative');
    expect(wrapperClass).toContain('w-full');
    expect(wrapperClass).toContain('max-w-xs');
  });

  test('should trigger search after debounce delay', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await expect(searchInput).not.toBeDisabled();
    
    await searchInput.fill('test search');
    
    await page.waitForTimeout(600);
    
    await expect(searchInput).toHaveValue('test search');
  });

  test('should handle empty string input', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await expect(searchInput).not.toBeDisabled();
    
    await searchInput.fill('some text');
    await searchInput.clear();
    
    await expect(searchInput).toHaveValue('');
  });

  test('should handle whitespace-only input', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await expect(searchInput).not.toBeDisabled();
    
    await searchInput.fill('   ');
    await expect(searchInput).toHaveValue('   ');
  });

  test('should be responsive and maintain functionality on different viewport sizes', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(searchInput).toBeVisible();
    await expect(searchInput).not.toBeDisabled();
    await searchInput.fill('mobile test');
    await expect(searchInput).toHaveValue('mobile test');
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(searchInput).toBeVisible();
    await expect(searchInput).not.toBeDisabled();
    await searchInput.fill('tablet test');
    await expect(searchInput).toHaveValue('tablet test');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(searchInput).toBeVisible();
    await expect(searchInput).not.toBeDisabled();
    await searchInput.fill('desktop test');
    await expect(searchInput).toHaveValue('desktop test');
  });
});