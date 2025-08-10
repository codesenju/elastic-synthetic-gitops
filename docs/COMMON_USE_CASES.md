# 🎯 Common Use Cases - Synthetic Monitoring

This guide provides ready-to-use configurations for the most common monitoring scenarios.

## 📋 Table of Contents

1. [API Monitoring](#api-monitoring)
2. [Website Monitoring](#website-monitoring)
3. [Database Monitoring](#database-monitoring)
4. [Authentication Flows](#authentication-flows)
5. [E-commerce Journeys](#e-commerce-journeys)
6. [SaaS Application Monitoring](#saas-application-monitoring)
7. [Infrastructure Monitoring](#infrastructure-monitoring)
8. [Third-Party Dependencies](#third-party-dependencies)

---

## 🔌 API Monitoring

### REST API Health Check
```yaml
monitors:
  - name: "User API Health Check"
    type: http
    url: "https://api.example.com/v1/health"
    method: GET
    schedule: { number: "5", unit: "m" }
    timeout: "10s"
    expected_status: [200]
    expected_body_positive: ["healthy", "ok"]
    tags: ["api", "health-check", "critical"]
```

### Authenticated API Endpoint
```yaml
monitors:
  - name: "Protected API Endpoint"
    type: http
    url: "https://api.example.com/v1/users/profile"
    method: GET
    headers:
      Authorization: "Bearer ${API_TOKEN}"
      Content-Type: "application/json"
    schedule: { number: "10", unit: "m" }
    expected_status: [200]
    expected_body_positive: ["user", "profile"]
    tags: ["api", "authenticated", "important"]
```

### GraphQL API Monitoring
```yaml
monitors:
  - name: "GraphQL API Check"
    type: http
    url: "https://api.example.com/graphql"
    method: POST
    headers:
      Content-Type: "application/json"
      Authorization: "Bearer ${GRAPHQL_TOKEN}"
    body: |
      {
        "query": "query { health { status version } }"
      }
    schedule: { number: "5", unit: "m" }
    expected_status: [200]
    expected_body_positive: ["data", "health"]
    tags: ["graphql", "api", "critical"]
```

### Webhook Endpoint Testing
```yaml
monitors:
  - name: "Webhook Endpoint"
    type: http
    url: "https://api.example.com/webhooks/test"
    method: POST
    headers:
      Content-Type: "application/json"
      X-Webhook-Secret: "${WEBHOOK_SECRET}"
    body: |
      {
        "event": "test",
        "timestamp": "2024-01-01T00:00:00Z",
        "data": { "test": true }
      }
    schedule: { number: "15", unit: "m" }
    expected_status: [200, 202]
    tags: ["webhook", "integration", "important"]
```

---

## 🌐 Website Monitoring

### Homepage Monitoring
```typescript
journey('Homepage Performance Check', ({ page, params }) => {
  monitor.use({
    id: 'homepage-check',
    schedule: 5,
    tags: ['homepage', 'performance', 'critical'],
  });

  step('Load homepage', async () => {
    await page.goto(params.baseUrl);
    
    // Check page loads within 3 seconds
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    // Verify key elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  step('Check critical links', async () => {
    const links = ['About', 'Contact', 'Products', 'Login'];
    
    for (const linkText of links) {
      const link = page.locator(`a:has-text("${linkText}")`);
      if (await link.count() > 0) {
        await expect(link).toBeVisible();
      }
    }
  });
});
```

### Search Functionality
```typescript
journey('Search Functionality Test', ({ page, params }) => {
  monitor.use({
    id: 'search-functionality',
    schedule: 15,
    tags: ['search', 'functionality', 'important'],
  });

  step('Navigate to site', async () => {
    await page.goto(params.baseUrl);
  });

  step('Perform search', async () => {
    const searchBox = page.locator('input[type="search"], input[placeholder*="Search"]');
    await searchBox.fill('test query');
    await searchBox.press('Enter');
    
    // Wait for results
    await page.waitForSelector('[data-testid="search-results"], .search-results', { timeout: 10000 });
    
    // Verify results are displayed
    const results = page.locator('[data-testid="search-result"], .search-result');
    expect(await results.count()).toBeGreaterThan(0);
  });
});
```

### Contact Form Submission
```typescript
journey('Contact Form Submission', ({ page, params }) => {
  monitor.use({
    id: 'contact-form',
    schedule: 30,
    tags: ['contact-form', 'lead-generation', 'important'],
  });

  step('Navigate to contact page', async () => {
    await page.goto(`${params.baseUrl}/contact`);
    await expect(page.locator('form')).toBeVisible();
  });

  step('Fill and submit form', async () => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message from synthetic monitoring.');
    
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('.success-message, [data-testid="success"]')).toBeVisible();
  });
});
```

---

## 🗄️ Database Monitoring

### PostgreSQL Connection
```yaml
monitors:
  - name: "PostgreSQL Database Connection"
    type: tcp
    hosts: ["db.example.com:5432"]
    schedule: { number: "2", unit: "m" }
    timeout: "10s"
    tags: ["database", "postgresql", "critical"]
```

### MySQL Connection with Health Check
```yaml
monitors:
  - name: "MySQL Connection Check"
    type: tcp
    hosts: ["mysql.example.com:3306"]
    schedule: { number: "5", unit: "m" }
    timeout: "8s"
    send_string: ""
    receive_string: ""
    tags: ["database", "mysql", "critical"]
```

### Redis Cache Monitoring
```yaml
monitors:
  - name: "Redis Cache Check"
    type: tcp
    hosts: ["redis.example.com:6379"]
    schedule: { number: "3", unit: "m" }
    timeout: "5s"
    send_string: "PING\r\n"
    receive_string: "PONG"
    tags: ["cache", "redis", "critical"]
```

### MongoDB Connection
```yaml
monitors:
  - name: "MongoDB Connection"
    type: tcp
    hosts: ["mongo.example.com:27017"]
    schedule: { number: "5", unit: "m" }
    timeout: "10s"
    tags: ["database", "mongodb", "important"]
```

---

## 🔐 Authentication Flows

### Basic Login Flow
```typescript
journey('User Login Flow', ({ page, params }) => {
  monitor.use({
    id: 'user-login',
    schedule: 10,
    tags: ['authentication', 'login', 'critical'],
  });

  step('Navigate to login', async () => {
    await page.goto(`${params.baseUrl}/login`);
    await expect(page.locator('form')).toBeVisible();
  });

  step('Login user', async () => {
    await page.fill('input[name="email"]', params.testUser.email);
    await page.fill('input[name="password"]', params.testUser.password);
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page).toHaveURL(/dashboard|home|profile/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  step('Verify user session', async () => {
    // Check user-specific content
    const userInfo = page.locator('[data-testid="user-info"]');
    if (await userInfo.count() > 0) {
      await expect(userInfo).toBeVisible();
    }
    
    // Verify protected content is accessible
    const protectedContent = page.locator('[data-testid="protected-content"]');
    if (await protectedContent.count() > 0) {
      await expect(protectedContent).toBeVisible();
    }
  });

  step('Logout user', async () => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout"]');
    
    // Verify logout
    await expect(page).toHaveURL(/login|home/);
  });
});
```

### OAuth/SSO Flow
```typescript
journey('OAuth Login Flow', ({ page, params }) => {
  monitor.use({
    id: 'oauth-login',
    schedule: 15,
    tags: ['oauth', 'sso', 'authentication', 'important'],
  });

  step('Initiate OAuth flow', async () => {
    await page.goto(`${params.baseUrl}/login`);
    await page.click('button:has-text("Login with Google")');
    
    // Wait for OAuth provider page
    await page.waitForURL(/accounts\.google\.com|oauth\.provider\.com/);
  });

  step('Complete OAuth authentication', async () => {
    // Fill OAuth provider credentials
    await page.fill('input[type="email"]', params.oauthUser.email);
    await page.click('button:has-text("Next")');
    
    await page.fill('input[type="password"]', params.oauthUser.password);
    await page.click('button:has-text("Sign in")');
    
    // Handle consent screen if present
    const consentButton = page.locator('button:has-text("Allow"), button:has-text("Authorize")');
    if (await consentButton.count() > 0) {
      await consentButton.click();
    }
  });

  step('Verify successful OAuth login', async () => {
    // Should be redirected back to application
    await expect(page).toHaveURL(new RegExp(params.baseUrl));
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });
});
```

### Password Reset Flow
```typescript
journey('Password Reset Flow', ({ page, params }) => {
  monitor.use({
    id: 'password-reset',
    schedule: 60,
    tags: ['password-reset', 'authentication', 'monitoring'],
  });

  step('Navigate to password reset', async () => {
    await page.goto(`${params.baseUrl}/login`);
    await page.click('a:has-text("Forgot Password")');
    
    await expect(page.locator('form')).toBeVisible();
  });

  step('Submit password reset request', async () => {
    await page.fill('input[name="email"]', params.testUser.email);
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();
    expect(await page.locator('.success-message').textContent()).toContain('email');
  });
});
```

---

## 🛒 E-commerce Journeys

### Product Search and View
```typescript
journey('Product Search and View', ({ page, params }) => {
  monitor.use({
    id: 'product-search',
    schedule: 15,
    tags: ['ecommerce', 'product-search', 'important'],
  });

  step('Search for product', async () => {
    await page.goto(params.baseUrl);
    
    const searchBox = page.locator('input[name="search"]');
    await searchBox.fill('laptop');
    await searchBox.press('Enter');
    
    await page.waitForSelector('[data-testid="product-list"]');
    
    const products = page.locator('[data-testid="product-item"]');
    expect(await products.count()).toBeGreaterThan(0);
  });

  step('View product details', async () => {
    await page.click('[data-testid="product-item"]');
    
    // Verify product page elements
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart"]')).toBeVisible();
  });
});
```

### Shopping Cart Flow
```typescript
journey('Shopping Cart Flow', ({ page, params }) => {
  monitor.use({
    id: 'shopping-cart',
    schedule: 20,
    tags: ['ecommerce', 'cart', 'critical'],
  });

  step('Add product to cart', async () => {
    await page.goto(`${params.baseUrl}/products/test-product`);
    await page.click('[data-testid="add-to-cart"]');
    
    // Verify cart updated
    const cartCount = page.locator('[data-testid="cart-count"]');
    await expect(cartCount).toHaveText('1');
  });

  step('View cart', async () => {
    await page.click('[data-testid="cart-icon"]');
    
    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
  });

  step('Update cart quantity', async () => {
    const quantityInput = page.locator('[data-testid="quantity-input"]');
    await quantityInput.fill('2');
    await page.click('[data-testid="update-cart"]');
    
    // Verify quantity updated
    await expect(quantityInput).toHaveValue('2');
  });
});
```

### Checkout Process (Test Mode)
```typescript
journey('Checkout Process', ({ page, params }) => {
  monitor.use({
    id: 'checkout-process',
    schedule: 30,
    tags: ['ecommerce', 'checkout', 'critical'],
  });

  step('Proceed to checkout', async () => {
    // Assume cart has items
    await page.goto(`${params.baseUrl}/cart`);
    await page.click('[data-testid="checkout-button"]');
    
    await expect(page.locator('h2:has-text("Checkout")')).toBeVisible();
  });

  step('Fill shipping information', async () => {
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.selectOption('select[name="state"]', 'CA');
    await page.fill('input[name="zipCode"]', '12345');
  });

  step('Fill payment information (test)', async () => {
    // Use test credit card numbers
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="expiryDate"]', '12/25');
    await page.fill('input[name="cvv"]', '123');
    await page.fill('input[name="cardName"]', 'Test User');
  });

  step('Complete order', async () => {
    await page.click('[data-testid="place-order"]');
    
    // Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });
});
```

---

## 💼 SaaS Application Monitoring

### Dashboard Access
```typescript
journey('SaaS Dashboard Access', ({ page, params }) => {
  monitor.use({
    id: 'saas-dashboard',
    schedule: 10,
    tags: ['saas', 'dashboard', 'critical'],
  });

  step('Login to application', async () => {
    await page.goto(`${params.baseUrl}/login`);
    await page.fill('input[name="email"]', params.testUser.email);
    await page.fill('input[name="password"]', params.testUser.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/dashboard/);
  });

  step('Verify dashboard elements', async () => {
    // Check for key dashboard components
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Check for data loading
    const dataElements = page.locator('[data-testid="dashboard-widget"]');
    expect(await dataElements.count()).toBeGreaterThan(0);
  });

  step('Test navigation', async () => {
    const navItems = ['Analytics', 'Reports', 'Settings'];
    
    for (const item of navItems) {
      const navLink = page.locator(`nav a:has-text("${item}")`);
      if (await navLink.count() > 0) {
        await navLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page.locator('main')).toBeVisible();
      }
    }
  });
});
```

### Data Export Functionality
```typescript
journey('Data Export Test', ({ page, params }) => {
  monitor.use({
    id: 'data-export',
    schedule: 60,
    tags: ['saas', 'export', 'important'],
  });

  step('Navigate to export page', async () => {
    await page.goto(`${params.baseUrl}/dashboard`);
    await page.click('a:has-text("Export")');
    
    await expect(page.locator('h1:has-text("Export")')).toBeVisible();
  });

  step('Configure export', async () => {
    await page.selectOption('select[name="format"]', 'csv');
    await page.selectOption('select[name="dateRange"]', 'last30days');
    await page.check('input[name="includeHeaders"]');
  });

  step('Initiate export', async () => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Data")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
```

---

## 🏗️ Infrastructure Monitoring

### Load Balancer Health
```yaml
monitors:
  - name: "Load Balancer Health"
    type: http
    url: "https://lb.example.com/health"
    method: GET
    schedule: { number: "1", unit: "m" }
    timeout: "5s"
    expected_status: [200]
    tags: ["infrastructure", "load-balancer", "critical"]
```

### CDN Performance
```yaml
monitors:
  - name: "CDN Asset Loading"
    type: http
    url: "https://cdn.example.com/assets/main.css"
    method: GET
    schedule: { number: "5", unit: "m" }
    timeout: "3s"
    expected_status: [200]
    expected_headers:
      cache-control: "max-age"
    tags: ["cdn", "assets", "performance"]
```

### DNS Resolution
```yaml
monitors:
  - name: "DNS Server Check"
    type: icmp
    hosts: ["8.8.8.8", "1.1.1.1"]
    schedule: { number: "5", unit: "m" }
    timeout: "3s"
    tags: ["dns", "infrastructure", "important"]
```

---

## 🔗 Third-Party Dependencies

### Payment Gateway
```yaml
monitors:
  - name: "Payment Gateway Health"
    type: http
    url: "https://api.stripe.com/v1/charges"
    method: GET
    headers:
      Authorization: "Bearer ${STRIPE_TEST_KEY}"
    schedule: { number: "10", unit: "m" }
    expected_status: [401]  # Expected without proper auth
    tags: ["payment", "stripe", "critical"]
```

### Email Service
```yaml
monitors:
  - name: "Email Service API"
    type: http
    url: "https://api.sendgrid.com/v3/mail/send"
    method: POST
    headers:
      Authorization: "Bearer ${SENDGRID_API_KEY}"
      Content-Type: "application/json"
    body: |
      {
        "personalizations": [{"to": [{"email": "test@example.com"}]}],
        "from": {"email": "noreply@example.com"},
        "subject": "Test",
        "content": [{"type": "text/plain", "value": "Test"}]
      }
    schedule: { number: "30", unit: "m" }
    expected_status: [202]
    tags: ["email", "sendgrid", "important"]
```

### Social Media API
```yaml
monitors:
  - name: "Twitter API Health"
    type: http
    url: "https://api.twitter.com/2/tweets/search/recent"
    method: GET
    headers:
      Authorization: "Bearer ${TWITTER_BEARER_TOKEN}"
    schedule: { number: "15", unit: "m" }
    expected_status: [400]  # Expected without query params
    tags: ["social", "twitter", "monitoring"]
```

---

## 🎯 Best Practices Summary

### Monitor Frequency Guidelines
- **Critical services**: 1-5 minutes
- **Important services**: 5-15 minutes
- **Monitoring services**: 15-60 minutes
- **Third-party dependencies**: 10-30 minutes

### Tagging Strategy
- **Service name**: For filtering by service
- **Component type**: api, database, frontend, etc.
- **Criticality**: critical, important, monitoring
- **Team**: For ownership and notifications
- **Environment**: production, staging, development

### Alert Configuration
- **Enable alerts** for critical production services
- **Disable alerts** for staging/development (optional)
- **Set appropriate thresholds** to avoid noise
- **Configure notification channels** per team

### Journey Best Practices
- **Use data-testid attributes** for reliable selectors
- **Include proper wait conditions** for dynamic content
- **Test with realistic user flows** and data
- **Keep journeys focused** on critical paths
- **Include verification steps** for each action

---

Need help with a specific use case not covered here? Check the [full onboarding guide](ONBOARDING_GUIDE.md) or reach out to the team!
