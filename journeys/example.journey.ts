import { journey, step, monitor, expect } from '@elastic/synthetics';

journey('Example Application Journey', ({ page, params }) => {
  // Monitor configuration for GitOps deployment
  monitor.use({
    id: 'example-app-monitor',
    name: 'Example Application Health Check',
    schedule: 10, // minutes
    locations: [],
    privateLocations: ['synthetic-monitor-default'],
    tags: ['example', 'health-check', 'gitops'],
    alert: {
      status: {
        enabled: true,
      },
    },
  });

  step('Navigate to application', async () => {
    await page.goto(params.url || 'https://elastic.github.io/synthetics-demo/');
  });

  step('Verify page title', async () => {
    const title = await page.title();
    expect(title).toContain('todos');
  });

  step('Check main heading', async () => {
    const header = await page.locator('h1');
    expect(await header.textContent()).toBe('todos');
  });

  step('Verify input field is present', async () => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    await expect(input).toBeVisible();
  });

  step('Test adding a todo item', async () => {
    const input = page.locator('input[placeholder="What needs to be done?"]');
    await input.fill('Test todo from synthetic monitoring');
    await input.press('Enter');
    
    // Verify the todo was added
    const todoItem = page.locator('text=Test todo from synthetic monitoring');
    await expect(todoItem).toBeVisible();
  });
});
