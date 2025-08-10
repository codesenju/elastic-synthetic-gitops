import { Page, expect } from '@elastic/synthetics';

/**
 * Common helper functions for synthetic journeys
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Helper function to perform login
 */
export async function loginHelper(page: Page, credentials: LoginCredentials): Promise<void> {
  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const loginButton = page.locator('button[type="submit"]');

  await usernameInput.fill(credentials.username);
  await passwordInput.fill(credentials.password);
  await loginButton.click();

  // Wait for navigation after login
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to wait for an element to be visible
 */
export async function waitForElement(page: Page, selector: string, timeout: number = 5000): Promise<void> {
  await page.waitForSelector(selector, { 
    state: 'visible', 
    timeout 
  });
}

/**
 * Helper function to check if an API endpoint is healthy
 */
export async function checkApiHealth(page: Page, url: string): Promise<boolean> {
  try {
    const response = await page.request.get(url);
    return response.status() === 200;
  } catch (error) {
    console.error(`API health check failed for ${url}:`, error);
    return false;
  }
}

/**
 * Helper function to take a screenshot with a custom name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ 
    path: `screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Helper function to verify page performance metrics
 */
export async function checkPagePerformance(page: Page, maxLoadTime: number = 3000): Promise<void> {
  const navigationStart = await page.evaluate(() => performance.timing.navigationStart);
  const loadComplete = await page.evaluate(() => performance.timing.loadEventEnd);
  const loadTime = loadComplete - navigationStart;

  expect(loadTime).toBeLessThan(maxLoadTime);
  console.log(`Page load time: ${loadTime}ms`);
}

/**
 * Helper function to verify accessibility
 */
export async function checkAccessibility(page: Page): Promise<void> {
  // Check for basic accessibility attributes
  const images = page.locator('img');
  const imageCount = await images.count();
  
  for (let i = 0; i < imageCount; i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');
    if (!alt) {
      console.warn(`Image ${i} is missing alt attribute`);
    }
  }

  // Check for proper heading structure
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBeGreaterThanOrEqual(1);
  expect(h1Count).toBeLessThanOrEqual(1); // Should have exactly one h1
}

/**
 * Helper function to verify responsive design
 */
export async function checkResponsiveDesign(page: Page): Promise<void> {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  
  // Verify mobile navigation is present
  const mobileNav = page.locator('[data-testid="mobile-nav"]');
  if (await mobileNav.count() > 0) {
    await expect(mobileNav).toBeVisible();
  }

  // Test tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);

  // Test desktop viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1000);
}

/**
 * Helper function to verify form validation
 */
export async function testFormValidation(page: Page, formSelector: string): Promise<void> {
  const form = page.locator(formSelector);
  const submitButton = form.locator('button[type="submit"]');
  
  // Try to submit empty form
  await submitButton.click();
  
  // Check for validation messages
  const validationMessages = page.locator('.error-message, .validation-error, [role="alert"]');
  const messageCount = await validationMessages.count();
  
  if (messageCount > 0) {
    console.log(`Found ${messageCount} validation messages`);
  }
}
