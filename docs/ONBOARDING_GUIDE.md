# 🚀 Onboarding Guide - Elastic Synthetic Monitoring

Welcome to the Elastic Synthetic Monitoring platform! This guide will help you onboard your endpoints and websites for comprehensive monitoring.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start Checklist](#quick-start-checklist)
3. [Onboarding Endpoints for Monitoring](#onboarding-endpoints)
4. [Onboarding Websites for Journey Testing](#onboarding-websites)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)
7. [Support](#support)

## 🔧 Prerequisites

Before you begin, ensure you have:

- [ ] Access to this Git repository
- [ ] Basic understanding of YAML configuration
- [ ] Knowledge of your application endpoints and URLs
- [ ] Understanding of your application's critical user journeys
- [ ] Access to staging/production environments

## ✅ Quick Start Checklist

### For DevOps/Platform Teams
- [ ] Repository access configured
- [ ] Development environment set up
- [ ] Understanding of GitOps workflow
- [ ] Access to Kubernetes cluster and ArgoCD

### For Development Teams
- [ ] List of critical endpoints to monitor
- [ ] List of important user journeys
- [ ] Test credentials for non-production environments
- [ ] Understanding of application architecture

### For QA Teams
- [ ] Critical user flows documented
- [ ] Test data and scenarios prepared
- [ ] Understanding of expected application behavior

---

## 🎯 Onboarding Endpoints for Monitoring

### Step 1: Identify Your Endpoints

Create a list of endpoints you want to monitor:

```
✅ Health Check Endpoints
- API health endpoints (/health, /status, /ping)
- Database connectivity checks
- External service dependencies

✅ Critical API Endpoints
- Authentication endpoints
- Core business logic APIs
- Payment processing endpoints
- User management APIs

✅ Infrastructure Components
- Load balancers
- CDN endpoints
- DNS servers
- Database servers
```

### Step 2: Choose Monitor Types

| Monitor Type | Use Case | Example |
|--------------|----------|---------|
| **HTTP** | Web APIs, health checks, webhooks | `GET /api/health` |
| **TCP** | Database connections, message queues | `db.example.com:5432` |
| **ICMP** | Server connectivity, network health | `ping server.example.com` |

### Step 3: Create Your First HTTP Monitor

1. **Navigate to the monitors directory:**
   ```bash
   cd monitors/
   ```

2. **Create a new monitor configuration file:**
   ```bash
   # Create file for your service
   touch my-service-monitors.yaml
   ```

3. **Add your monitor configuration:**
   ```yaml
   # monitors/my-service-monitors.yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: my-service-monitors
     namespace: elastic-synthetic-monitoring
     labels:
       app: synthetic-monitor
       type: http
       service: my-service
   data:
     monitors.yaml: |
       monitors:
         - name: "My Service Health Check"
           type: http
           url: "https://api.myservice.com/health"
           method: GET
           schedule:
             number: "5"
             unit: "m"
           timeout: "10s"
           enabled: true
           tags:
             - "my-service"
             - "health-check"
             - "critical"
           private_locations:
             - "synthetic-monitor-default"
           expected_status: [200]
           expected_body_positive:
             - "healthy"
             - "ok"
           alert:
             status:
               enabled: true
   ```

### Step 4: Add Authentication (if needed)

For endpoints requiring authentication:

```yaml
monitors:
  - name: "Authenticated API Check"
    type: http
    url: "https://api.myservice.com/protected"
    method: GET
    headers:
      Authorization: "Bearer ${API_TOKEN}"
      Content-Type: "application/json"
    # ... rest of configuration
```

### Step 5: Configure TCP Monitoring

For database or service connectivity:

```yaml
# monitors/my-database-monitors.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-database-monitors
  namespace: elastic-synthetic-monitoring
  labels:
    app: synthetic-monitor
    type: tcp
data:
  monitors.yaml: |
    monitors:
      - name: "PostgreSQL Connection Check"
        type: tcp
        hosts:
          - "db.myservice.com:5432"
        schedule:
          number: "2"
          unit: "m"
        timeout: "5s"
        enabled: true
        tags:
          - "database"
          - "postgresql"
          - "critical"
        private_locations:
          - "synthetic-monitor-default"
        alert:
          status:
            enabled: true
```

### Step 6: Deploy Your Monitors

1. **Commit your changes:**
   ```bash
   git add monitors/my-service-monitors.yaml
   git commit -m "Add monitoring for My Service API"
   ```

2. **Create a Pull Request:**
   ```bash
   git push origin feature/add-my-service-monitoring
   # Create PR in GitHub/GitLab
   ```

3. **After PR approval and merge:**
   - ArgoCD will automatically sync the changes
   - Monitors will be active within 2-3 minutes
   - Check Kibana for monitor results

---

## 🌐 Onboarding Websites for Journey Testing

### Step 1: Identify Critical User Journeys

Document your most important user flows:

```
✅ Authentication Flows
- User login/logout
- Password reset
- Account registration

✅ Core Business Flows
- Purchase/checkout process
- Content creation/editing
- Search functionality
- Profile management

✅ Critical Pages
- Homepage loading
- Dashboard access
- Key landing pages
- Mobile responsiveness
```

### Step 2: Plan Your Journey

Before writing code, plan your journey:

1. **Define the user flow:**
   ```
   Journey: "E-commerce Checkout Process"
   Steps:
   1. Navigate to homepage
   2. Search for product
   3. Add product to cart
   4. Proceed to checkout
   5. Fill shipping information
   6. Complete payment (test mode)
   7. Verify order confirmation
   ```

2. **Identify test data needed:**
   - Test user credentials
   - Test payment information
   - Sample product IDs
   - Expected page elements

### Step 3: Create Your First Journey

1. **Navigate to journeys directory:**
   ```bash
   cd journeys/
   ```

2. **Create a new journey file:**
   ```bash
   touch my-app-checkout.journey.ts
   ```

3. **Write your journey:**
   ```typescript
   // journeys/my-app-checkout.journey.ts
   import { journey, step, monitor, expect } from '@elastic/synthetics';

   journey('E-commerce Checkout Journey', ({ page, params }) => {
     // Configure monitor settings
     monitor.use({
       id: 'ecommerce-checkout',
       name: 'E-commerce Checkout Process',
       schedule: 15, // Run every 15 minutes
       locations: [],
       privateLocations: ['synthetic-monitor-default'],
       tags: ['ecommerce', 'checkout', 'critical-path'],
       alert: {
         status: {
           enabled: true,
         },
       },
     });

     step('Navigate to homepage', async () => {
       await page.goto(params.baseUrl || 'https://mystore.com');
       
       // Verify page loaded correctly
       await expect(page.locator('h1')).toBeVisible();
       const title = await page.title();
       expect(title).toContain('My Store');
     });

     step('Search for product', async () => {
       const searchBox = page.locator('input[name="search"]');
       await searchBox.fill('laptop');
       await searchBox.press('Enter');
       
       // Wait for search results
       await page.waitForSelector('[data-testid="product-list"]');
       
       // Verify results are displayed
       const products = page.locator('[data-testid="product-item"]');
       expect(await products.count()).toBeGreaterThan(0);
     });

     step('Add product to cart', async () => {
       // Click on first product
       await page.locator('[data-testid="product-item"]').first().click();
       
       // Add to cart
       await page.locator('button[data-testid="add-to-cart"]').click();
       
       // Verify cart updated
       const cartCount = page.locator('[data-testid="cart-count"]');
       await expect(cartCount).toHaveText('1');
     });

     step('Proceed to checkout', async () => {
       await page.locator('[data-testid="cart-icon"]').click();
       await page.locator('button[data-testid="checkout-button"]').click();
       
       // Verify on checkout page
       await expect(page.locator('h2')).toContainText('Checkout');
     });

     step('Fill shipping information', async () => {
       await page.locator('input[name="firstName"]').fill('Test');
       await page.locator('input[name="lastName"]').fill('User');
       await page.locator('input[name="email"]').fill('test@example.com');
       await page.locator('input[name="address"]').fill('123 Test St');
       await page.locator('input[name="city"]').fill('Test City');
       await page.locator('select[name="state"]').selectOption('CA');
       await page.locator('input[name="zipCode"]').fill('12345');
     });

     step('Complete payment (test mode)', async () => {
       // Fill test payment information
       await page.locator('input[name="cardNumber"]').fill('4242424242424242');
       await page.locator('input[name="expiryDate"]').fill('12/25');
       await page.locator('input[name="cvv"]').fill('123');
       
       // Submit order
       await page.locator('button[data-testid="place-order"]').click();
     });

     step('Verify order confirmation', async () => {
       // Wait for confirmation page
       await page.waitForSelector('[data-testid="order-confirmation"]');
       
       // Verify success message
       const confirmationMessage = page.locator('[data-testid="success-message"]');
       await expect(confirmationMessage).toBeVisible();
       
       // Verify order number is displayed
       const orderNumber = page.locator('[data-testid="order-number"]');
       await expect(orderNumber).toBeVisible();
       
       console.log('Order completed successfully!');
     });
   });
   ```

### Step 4: Create Helper Functions (Optional)

For reusable functionality, create helpers:

```typescript
// journeys/helpers/ecommerce-helpers.ts
import { Page, expect } from '@elastic/synthetics';

export async function loginUser(page: Page, email: string, password: string) {
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  
  // Wait for login to complete
  await page.waitForSelector('[data-testid="user-menu"]');
}

export async function addProductToCart(page: Page, productName: string) {
  // Search for product
  await page.locator('input[name="search"]').fill(productName);
  await page.locator('input[name="search"]').press('Enter');
  
  // Add first result to cart
  await page.locator('[data-testid="product-item"]').first().click();
  await page.locator('button[data-testid="add-to-cart"]').click();
}
```

### Step 5: Configure Journey Parameters

Create environment-specific parameters:

```typescript
// In your synthetics.config.ts
export default env => {
  const config: SyntheticsConfig = {
    params: {
      baseUrl: env === 'production' 
        ? 'https://mystore.com' 
        : 'https://staging.mystore.com',
      testUser: {
        email: 'test@example.com',
        password: 'testpassword123'
      },
      // Add other environment-specific params
    },
    // ... rest of config
  };
  return config;
};
```

### Step 6: Test and Deploy Your Journey

1. **Test locally:**
   ```bash
   # Validate journey syntax
   npx @elastic/synthetics --dry-run journeys/my-app-checkout.journey.ts
   
   # Run journey locally (optional)
   npx @elastic/synthetics journeys/my-app-checkout.journey.ts
   ```

2. **Commit and deploy:**
   ```bash
   git add journeys/my-app-checkout.journey.ts
   git commit -m "Add e-commerce checkout journey"
   git push origin feature/add-checkout-journey
   ```

3. **Push to Kibana:**
   ```bash
   # After PR is merged
   npm run push:journeys
   ```

---

## 🎯 Best Practices

### Monitor Configuration

#### ✅ DO:
- Use descriptive monitor names
- Add relevant tags for filtering
- Set appropriate timeouts
- Configure alerts for critical monitors
- Use environment-specific URLs
- Group related monitors in the same ConfigMap

#### ❌ DON'T:
- Use hardcoded credentials in configurations
- Set overly aggressive monitoring intervals
- Monitor non-critical endpoints too frequently
- Forget to add proper error handling

### Journey Development

#### ✅ DO:
- Write clear, descriptive step names
- Add proper wait conditions
- Use data-testid attributes for reliable selectors
- Include verification steps
- Handle dynamic content appropriately
- Use helper functions for common actions

#### ❌ DON'T:
- Rely on brittle CSS selectors
- Skip error handling
- Create overly long journeys
- Use production data in tests
- Ignore page load times

### Naming Conventions

```
Monitor Names: "[Service] [Type] Check"
Examples:
- "User API Health Check"
- "Payment Service Database Connection"
- "CDN Performance Check"

Journey Names: "[Feature] [Action] Journey"
Examples:
- "User Login Journey"
- "E-commerce Checkout Journey"
- "Content Creation Journey"

Tags: Use consistent, searchable tags
Examples:
- Service: "user-service", "payment-api"
- Environment: "production", "staging"
- Priority: "critical", "important", "nice-to-have"
- Type: "health-check", "business-flow", "performance"
```

---

## 🔍 Troubleshooting

### Common Issues

#### Monitor Not Appearing in Kibana
```bash
# Check if ConfigMap was created
kubectl get configmaps -n elastic-synthetic-monitoring -l app=synthetic-monitor

# Check sync service logs
kubectl logs deployment/kibana-sync-service -n elastic-synthetic-monitoring

# Verify monitor configuration
kubectl describe configmap your-monitor-name -n elastic-synthetic-monitoring
```

#### Journey Failing
```bash
# Check journey syntax
npx @elastic/synthetics --dry-run journeys/your-journey.ts

# Run journey locally for debugging
npx @elastic/synthetics journeys/your-journey.ts --params '{"baseUrl":"https://staging.example.com"}'

# Check Kibana for detailed error logs and screenshots
```

#### ArgoCD Not Syncing
```bash
# Check application status
kubectl get applications -n argocd

# Force sync
argocd app sync elastic-synthetic-monitoring

# Check for configuration errors
kubectl describe application elastic-synthetic-monitoring -n argocd
```

### Getting Help

1. **Check the logs:**
   ```bash
   # Sync service logs
   kubectl logs -f deployment/kibana-sync-service -n elastic-synthetic-monitoring
   
   # Elastic Agent logs
   kubectl logs daemonset/elastic-agent-synthetics -n elastic-synthetic-monitoring
   ```

2. **Validate configurations:**
   ```bash
   # YAML validation
   yamllint monitors/your-monitor.yaml
   
   # Journey validation
   npx @elastic/synthetics --dry-run
   ```

3. **Check Kibana:**
   - Navigate to Observability → Uptime
   - Check for error messages and screenshots
   - Review monitor configuration

---

## 📞 Support

### Documentation
- [Main README](../README.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)

### Getting Help
- **Slack**: #devops-monitoring
- **Email**: devops-team@company.com
- **Issues**: Create an issue in this repository

### Training Resources
- [Elastic Synthetics Documentation](https://www.elastic.co/guide/en/observability/current/synthetics.html)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Internal Training Videos](https://company.com/training/synthetic-monitoring)

---

## 🎉 Next Steps

After completing this onboarding:

1. **Review your monitors** in Kibana dashboard
2. **Set up alerting** for critical failures
3. **Create dashboards** for your team
4. **Schedule regular reviews** of monitor effectiveness
5. **Contribute improvements** back to this repository

Welcome to proactive monitoring! 🚀
