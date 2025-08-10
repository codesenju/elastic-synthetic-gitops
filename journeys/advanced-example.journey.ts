import { journey, step, monitor, expect } from '@elastic/synthetics';
import { loginHelper, waitForElement } from './helpers/common-helpers';

journey('Advanced Application Journey', ({ page, params }) => {
  monitor.use({
    id: 'advanced-app-monitor',
    name: 'Advanced Application E2E Test',
    schedule: 15,
    locations: [],
    privateLocations: ['synthetic-monitor-default'],
    tags: ['advanced', 'e2e', 'critical-path'],
    alert: {
      status: {
        enabled: true,
      },
    },
  });

  step('Navigate to login page', async () => {
    await page.goto(params.loginUrl || 'https://example.com/login');
    await waitForElement(page, 'input[name="username"]', 5000);
  });

  step('Perform login', async () => {
    await loginHelper(page, {
      username: params.username || 'testuser',
      password: params.password || 'testpass'
    });
  });

  step('Verify dashboard access', async () => {
    await expect(page).toHaveURL(/.*dashboard.*/);
    const welcomeMessage = page.locator('[data-testid="welcome-message"]');
    await expect(welcomeMessage).toBeVisible();
  });

  step('Check critical metrics are displayed', async () => {
    const metricsContainer = page.locator('[data-testid="metrics-container"]');
    await expect(metricsContainer).toBeVisible();
    
    // Check for specific metric cards
    const cpuMetric = page.locator('[data-testid="cpu-metric"]');
    const memoryMetric = page.locator('[data-testid="memory-metric"]');
    const diskMetric = page.locator('[data-testid="disk-metric"]');
    
    await expect(cpuMetric).toBeVisible();
    await expect(memoryMetric).toBeVisible();
    await expect(diskMetric).toBeVisible();
  });

  step('Test search functionality', async () => {
    const searchInput = page.locator('input[placeholder="Search..."]');
    await searchInput.fill('test query');
    await searchInput.press('Enter');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
    
    const results = page.locator('[data-testid="search-result-item"]');
    const resultCount = await results.count();
    expect(resultCount).toBeGreaterThan(0);
  });

  step('Verify API health endpoint', async () => {
    const response = await page.request.get(params.apiHealthUrl || 'https://api.example.com/health');
    expect(response.status()).toBe(200);
    
    const healthData = await response.json();
    expect(healthData.status).toBe('healthy');
  });

  step('Test logout functionality', async () => {
    const logoutButton = page.locator('[data-testid="logout-button"]');
    await logoutButton.click();
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login.*/);
  });
});
