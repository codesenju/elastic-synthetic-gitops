// Journey Testing Template
// Copy this template and customize for your website/application

import { journey, step, monitor, expect } from '@elastic/synthetics';
import { loginHelper, waitForElement, takeScreenshot } from './helpers/common-helpers';

// TEMPLATE: Basic Website Journey
journey('YOUR_APP_NAME - Basic User Journey', ({ page, params }) => {
  // Monitor configuration
  monitor.use({
    id: 'your-app-basic-journey',  // Replace with unique ID
    name: 'YOUR_APP_NAME Basic User Journey',  // Replace with descriptive name
    schedule: 15,  // Run every 15 minutes (adjust as needed)
    locations: [],  // Use public locations if available
    privateLocations: ['synthetic-monitor-default'],
    tags: [
      'YOUR_APP_NAME',  // Replace with your app name
      'basic-journey',
      'critical-path',  // or 'important', 'monitoring'
      'YOUR_TEAM_NAME'  // Replace with your team name
    ],
    alert: {
      status: {
        enabled: true,  // Set to false for non-critical journeys
      },
    },
  });

  step('Navigate to homepage', async () => {
    // Replace with your application URL
    const baseUrl = params.baseUrl || 'https://your-app.com';
    await page.goto(baseUrl);
    
    // Verify page loaded correctly
    await expect(page).toHaveTitle(/YOUR_APP_NAME/);  // Replace with expected title
    
    // Check for key elements
    const mainHeading = page.locator('h1');  // Adjust selector as needed
    await expect(mainHeading).toBeVisible();
    
    // Optional: Take screenshot for debugging
    await takeScreenshot(page, 'homepage-loaded');
  });

  step('Verify key page elements', async () => {
    // Replace these selectors with your actual page elements
    const navigation = page.locator('nav');
    const mainContent = page.locator('main');
    const footer = page.locator('footer');
    
    await expect(navigation).toBeVisible();
    await expect(mainContent).toBeVisible();
    await expect(footer).toBeVisible();
    
    // Check for specific functionality
    const searchBox = page.locator('input[type="search"]');  // Adjust as needed
    if (await searchBox.count() > 0) {
      await expect(searchBox).toBeVisible();
    }
  });

  step('Test navigation', async () => {
    // Replace with your actual navigation links
    const aboutLink = page.locator('a[href="/about"]');  // Adjust selector
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      
      // Verify navigation worked
      await expect(page).toHaveURL(/.*about.*/);
      await expect(page.locator('h1')).toBeVisible();
      
      // Navigate back
      await page.goBack();
    }
  });
});

// TEMPLATE: User Authentication Journey
journey('YOUR_APP_NAME - User Login Journey', ({ page, params }) => {
  monitor.use({
    id: 'your-app-login-journey',
    name: 'YOUR_APP_NAME User Login',
    schedule: 10,  // More frequent for critical auth flows
    privateLocations: ['synthetic-monitor-default'],
    tags: ['YOUR_APP_NAME', 'authentication', 'critical-path'],
    alert: { status: { enabled: true } },
  });

  step('Navigate to login page', async () => {
    const loginUrl = params.loginUrl || 'https://your-app.com/login';
    await page.goto(loginUrl);
    
    // Wait for login form to load
    await waitForElement(page, 'form[data-testid="login-form"]');  // Adjust selector
    
    // Verify login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();  // Adjust as needed
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  step('Perform login', async () => {
    // Use test credentials from params
    const testEmail = params.testUser?.email || 'test@example.com';
    const testPassword = params.testUser?.password || 'testpassword123';
    
    await loginHelper(page, {
      username: testEmail,
      password: testPassword
    });
    
    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard.*|.*home.*/);  // Adjust expected URL
    
    // Check for user-specific elements
    const userMenu = page.locator('[data-testid="user-menu"]');  // Adjust selector
    await expect(userMenu).toBeVisible();
  });

  step('Verify dashboard access', async () => {
    // Check for dashboard-specific elements
    const welcomeMessage = page.locator('[data-testid="welcome"]');  // Adjust selector
    const mainContent = page.locator('[data-testid="dashboard-content"]');
    
    if (await welcomeMessage.count() > 0) {
      await expect(welcomeMessage).toBeVisible();
    }
    
    await expect(mainContent).toBeVisible();
  });

  step('Test logout', async () => {
    // Click user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();
    
    // Click logout
    const logoutButton = page.locator('[data-testid="logout"]');  // Adjust selector
    await logoutButton.click();
    
    // Verify logout successful
    await expect(page).toHaveURL(/.*login.*|.*home.*/);  // Adjust expected URL
  });
});

// TEMPLATE: E-commerce/Business Process Journey
journey('YOUR_APP_NAME - Business Process Journey', ({ page, params }) => {
  monitor.use({
    id: 'your-app-business-journey',
    name: 'YOUR_APP_NAME Business Process',
    schedule: 30,  // Less frequent for complex journeys
    privateLocations: ['synthetic-monitor-default'],
    tags: ['YOUR_APP_NAME', 'business-process', 'important'],
    alert: { status: { enabled: true } },
  });

  step('Navigate to main application', async () => {
    await page.goto(params.baseUrl || 'https://your-app.com');
    
    // Wait for application to load
    await page.waitForLoadState('networkidle');
    
    // Verify key elements are present
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
  });

  step('Perform search/filter operation', async () => {
    // Replace with your actual search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');  // Adjust selector
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test query');  // Replace with relevant search term
      await searchInput.press('Enter');
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Verify results are displayed
      const results = page.locator('[data-testid="result-item"]');  // Adjust selector
      expect(await results.count()).toBeGreaterThan(0);
    }
  });

  step('Interact with main feature', async () => {
    // Replace with your main business functionality
    // Examples: Add to cart, create content, submit form, etc.
    
    const actionButton = page.locator('[data-testid="primary-action"]');  // Adjust selector
    
    if (await actionButton.count() > 0) {
      await actionButton.click();
      
      // Wait for action to complete
      await page.waitForSelector('[data-testid="success-message"]', { timeout: 15000 });
      
      // Verify success
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible();
    }
  });

  step('Verify final state', async () => {
    // Verify the business process completed successfully
    // This could be checking for:
    // - Updated UI state
    // - Confirmation messages
    // - New data displayed
    // - Redirect to success page
    
    const confirmationElement = page.locator('[data-testid="confirmation"]');  // Adjust selector
    
    if (await confirmationElement.count() > 0) {
      await expect(confirmationElement).toBeVisible();
      
      // Optional: Verify specific text content
      const confirmationText = await confirmationElement.textContent();
      expect(confirmationText).toContain('success');  // Adjust expected text
    }
  });
});

// TEMPLATE: API Integration Journey
journey('YOUR_APP_NAME - API Integration Journey', ({ page, params }) => {
  monitor.use({
    id: 'your-app-api-journey',
    name: 'YOUR_APP_NAME API Integration',
    schedule: 20,
    privateLocations: ['synthetic-monitor-default'],
    tags: ['YOUR_APP_NAME', 'api-integration', 'monitoring'],
    alert: { status: { enabled: true } },
  });

  step('Test API health endpoint', async () => {
    const apiHealthUrl = params.apiHealthUrl || 'https://api.your-app.com/health';
    
    // Make API request
    const response = await page.request.get(apiHealthUrl, {
      headers: {
        'Authorization': `Bearer ${params.apiToken}`,  // If authentication required
        'Content-Type': 'application/json'
      }
    });
    
    // Verify response
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody.status).toBe('healthy');  // Adjust based on your API response
  });

  step('Test main API functionality', async () => {
    const apiUrl = params.apiUrl || 'https://api.your-app.com/v1/data';
    
    // Test GET request
    const getResponse = await page.request.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${params.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    expect(getResponse.status()).toBe(200);
    
    const data = await getResponse.json();
    expect(data).toHaveProperty('data');  // Adjust based on your API response structure
    
    // Optional: Test POST request
    const postResponse = await page.request.post(apiUrl, {
      headers: {
        'Authorization': `Bearer ${params.apiToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        test: 'data'  // Replace with appropriate test data
      }
    });
    
    expect([200, 201, 202]).toContain(postResponse.status());
  });

  step('Verify API response in UI', async () => {
    // Navigate to page that uses the API
    await page.goto(params.baseUrl || 'https://your-app.com/dashboard');
    
    // Wait for API data to load in UI
    await page.waitForSelector('[data-testid="api-data"]', { timeout: 15000 });
    
    // Verify data is displayed correctly
    const dataElement = page.locator('[data-testid="api-data"]');
    await expect(dataElement).toBeVisible();
    
    // Optional: Verify specific data content
    const dataText = await dataElement.textContent();
    expect(dataText).toBeTruthy();
  });
});

/*
CUSTOMIZATION CHECKLIST:

1. Replace ALL instances of:
   - YOUR_APP_NAME with your actual application name
   - YOUR_TEAM_NAME with your team name
   - URLs with your actual application URLs
   - Selectors with your actual page element selectors
   - API endpoints with your actual API URLs

2. Update monitor configurations:
   - Set appropriate schedules based on criticality
   - Configure alerts (enable for critical, disable for non-critical)
   - Add relevant tags for filtering and organization
   - Set unique monitor IDs

3. Customize selectors:
   - Use data-testid attributes for reliable element selection
   - Update CSS selectors to match your application
   - Add proper wait conditions for dynamic content

4. Configure test data:
   - Set up test user credentials
   - Configure API tokens and keys
   - Add environment-specific URLs and parameters

5. Add error handling:
   - Include proper wait conditions
   - Add timeout configurations
   - Handle optional elements gracefully

6. Optimize for your use case:
   - Focus on critical user paths
   - Include business-specific validations
   - Add performance checks if needed
   - Include accessibility checks if required

7. Environment configuration:
   - Set up different parameters for staging/production
   - Configure appropriate monitoring frequencies
   - Adjust alert settings per environment

TESTING YOUR JOURNEY:
1. Test locally: npx @elastic/synthetics --dry-run journeys/your-journey.ts
2. Run with params: npx @elastic/synthetics journeys/your-journey.ts --params '{"baseUrl":"https://staging.example.com"}'
3. Check for syntax errors: npx tsc --noEmit
4. Deploy and monitor in Kibana
*/
