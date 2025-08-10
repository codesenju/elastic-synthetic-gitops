# Elastic Synthetic Monitoring with GitOps

A comprehensive GitOps solution for managing Elastic Synthetic Monitoring with Kubernetes, ArgoCD, and Ansible automation.

## 🚀 Quick Start

**New to synthetic monitoring?** Start here:

- 📖 **[Getting Started Guide](docs/GETTING_STARTED.md)** - 15-minute quick setup
- 🎯 **[Onboarding Guide](docs/ONBOARDING_GUIDE.md)** - Complete step-by-step onboarding
- ✅ **[Onboarding Checklist](docs/ONBOARDING_CHECKLIST.md)** - Systematic onboarding process
- 🎯 **[Common Use Cases](docs/COMMON_USE_CASES.md)** - Ready-to-use examples

## 🎯 Features

- **GitOps Workflow**: Automated deployment and management using ArgoCD
- **Multi-Environment Support**: Development, staging, and production environments
- **Hybrid Monitor Management**: ConfigMap-based lightweight monitors + Kibana API for browser journeys
- **Ansible Automation**: Infrastructure deployment and configuration management
- **CI/CD Pipeline**: Automated validation, testing, and deployment
- **Comprehensive Monitoring**: HTTP, TCP, ICMP, and browser-based synthetic monitoring

## 📋 Prerequisites

- Kubernetes cluster (v1.24+)
- ArgoCD installed and configured
- Elastic Stack (Elasticsearch + Kibana) deployed
- Ansible (v8.0+) for infrastructure automation
- Node.js (v18+) for journey development
- Python (v3.11+) for sync services

## ⚡ 5-Minute Quick Start

### 1. Add Your First Monitor

Create `monitors/my-first-monitor.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-first-monitor
  namespace: elastic-synthetic-monitoring
  labels:
    app: synthetic-monitor
    type: http
data:
  monitors.yaml: |
    monitors:
      - name: "My Website Health Check"
        type: http
        url: "https://your-website.com"
        schedule: { number: "5", unit: "m" }
        enabled: true
        tags: ["website", "health-check"]
        expected_status: [200]
```

### 2. Deploy Monitor

```bash
git add monitors/my-first-monitor.yaml
git commit -m "Add my first monitor"
git push origin main
```

**That's it!** ArgoCD deploys your monitor within 2-3 minutes.

### 3. Add Your First Journey

Create `journeys/my-first-journey.ts`:

```typescript
import { journey, step, monitor, expect } from '@elastic/synthetics';

journey('My Website Journey', ({ page, params }) => {
  monitor.use({
    id: 'my-website-journey',
    schedule: 10,
    privateLocations: ['synthetic-monitor-default'],
  });

  step('Visit homepage', async () => {
    await page.goto('https://your-website.com');
    expect(await page.title()).toContain('Your Website');
  });
});
```

### 4. Deploy Journey

```bash
git add journeys/my-first-journey.ts
git commit -m "Add my first journey"
git push origin main

# Push to Kibana
npm run push:journeys
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Git Repository │    │   ArgoCD         │    │   Kubernetes    │
│                 │    │                  │    │                 │
│ ├── journeys/   │───▶│ ├── Application  │───▶│ ├── Namespace   │
│ ├── monitors/   │    │ ├── AppSet       │    │ ├── ConfigMaps  │
│ ├── manifests/  │    │ └── Sync Policy  │    │ ├── Secrets     │
│ ├── ansible/    │    │                  │    │ ├── DaemonSet   │
│ └── scripts/    │    │                  │    │ └── Deployment  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │ Elastic Stack   │
                                               │                 │
                                               │ ├── Elasticsearch│
                                               │ ├── Kibana      │
                                               │ └── Elastic Agent│
                                               └─────────────────┘
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/your-org/elastic-synthetic-gitops.git
cd elastic-synthetic-gitops

# Install dependencies
npm install
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy and edit configuration files
cp ansible/inventory.ini.example ansible/inventory.ini
cp .env.example .env

# Update with your cluster details
vim ansible/inventory.ini
vim .env
```

### 3. Deploy Infrastructure

```bash
# Deploy ArgoCD application
npm run deploy:argocd

# Deploy synthetic monitoring infrastructure
npm run deploy:monitors
```

### 4. Add Your First Monitor

Create a new HTTP monitor:

```yaml
# monitors/my-app-monitor.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-app-monitors
  namespace: elastic-synthetic-monitoring
  labels:
    app: synthetic-monitor
    type: http
data:
  monitors.yaml: |
    monitors:
      - name: "My App Health Check"
        type: http
        url: "https://myapp.example.com/health"
        schedule:
          number: "5"
          unit: "m"
        enabled: true
        tags: ["myapp", "health"]
```

Commit and push - ArgoCD will automatically deploy!

## 📁 Repository Structure

```
elastic-synthetic-gitops/
├── .github/workflows/          # CI/CD pipelines
├── ansible/                    # Infrastructure automation
│   ├── inventory.ini          # Cluster inventory
│   ├── deploy-argocd.yaml     # ArgoCD deployment
│   └── deploy-synthetic-monitors.yaml
├── journeys/                   # TypeScript browser journeys
│   ├── example.journey.ts
│   ├── advanced-example.journey.ts
│   └── helpers/
├── manifests/                  # Kubernetes manifests
│   ├── argocd-application.yaml
│   ├── namespace.yaml
│   ├── secrets.yaml
│   ├── elastic-agent.yaml
│   └── kibana-sync-service.yaml
├── monitors/                   # Monitor configurations
│   ├── http-monitors.yaml
│   ├── tcp-monitors.yaml
│   └── icmp-monitors.yaml
├── scripts/                    # Automation scripts
│   └── sync-monitors.py
├── docs/                       # Documentation
├── examples/                   # Example configurations
├── tests/                      # Test files
└── tools/                      # Utility tools
```

## 🔧 Configuration

### Environment Variables

```bash
# Elasticsearch Configuration
ELASTICSEARCH_URL=https://elasticsearch.example.com:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-password

# Kibana Configuration
KIBANA_URL=https://kibana.example.com
KIBANA_API_KEY=your-api-key
KIBANA_SPACE=default

# Sync Service Configuration
SYNC_MODE=continuous
SYNC_INTERVAL=60
LOG_LEVEL=INFO
```

### Monitor Types

#### HTTP Monitors
```yaml
monitors:
  - name: "API Health Check"
    type: http
    url: "https://api.example.com/health"
    method: GET
    schedule: { number: "5", unit: "m" }
    expected_status: [200]
    timeout: "10s"
```

#### TCP Monitors
```yaml
monitors:
  - name: "Database Connection"
    type: tcp
    hosts: ["db.example.com:5432"]
    schedule: { number: "10", unit: "m" }
    timeout: "5s"
```

#### ICMP Monitors
```yaml
monitors:
  - name: "Server Ping"
    type: icmp
    hosts: ["server.example.com"]
    schedule: { number: "2", unit: "m" }
    timeout: "3s"
```

#### Browser Journeys
```typescript
import { journey, step, monitor, expect } from '@elastic/synthetics';

journey('My App Journey', ({ page, params }) => {
  monitor.use({
    id: 'my-app-journey',
    schedule: 10,
    locations: [],
    privateLocations: ['synthetic-monitor-default'],
  });

  step('Navigate to app', async () => {
    await page.goto(params.url);
  });

  step('Check title', async () => {
    expect(await page.title()).toContain('My App');
  });
});
```

## 🔄 GitOps Workflow

### 1. Development Workflow

```bash
# Create feature branch
git checkout -b feature/new-monitor

# Add/modify monitors or journeys
vim monitors/new-monitor.yaml
vim journeys/new-journey.ts

# Validate changes
npm run validate:journeys
npm run validate:manifests

# Commit and push
git add .
git commit -m "Add new monitor for payment service"
git push origin feature/new-monitor

# Create pull request
```

### 2. Automated Deployment

1. **PR Creation**: Triggers validation pipeline
2. **PR Merge**: Deploys to staging environment
3. **Main Branch**: Deploys to production via ArgoCD
4. **ArgoCD Sync**: Automatically applies changes to cluster
5. **Monitor Sync**: Kibana sync service updates monitors

### 3. Rollback Process

```bash
# Rollback via ArgoCD
argocd app rollback elastic-synthetic-monitoring

# Or rollback via Git
git revert <commit-hash>
git push origin main
```

## 📊 Monitoring and Observability

### ArgoCD Dashboard
- Application health status
- Sync status and history
- Resource deployment status

### Kibana Dashboards
- Synthetic monitor results
- Performance metrics
- Alert configurations
- Journey screenshots and videos

### Kubernetes Monitoring
```bash
# Check ArgoCD application status
kubectl get applications -n argocd

# Check synthetic monitoring pods
kubectl get pods -n elastic-synthetic-monitoring

# View sync service logs
kubectl logs -f deployment/kibana-sync-service -n elastic-synthetic-monitoring

# Check Elastic Agent status
kubectl get daemonset elastic-agent-synthetics -n elastic-synthetic-monitoring
```

## 🚨 Troubleshooting

### Common Issues

#### ArgoCD Application Not Syncing
```bash
# Check application status
kubectl describe application elastic-synthetic-monitoring -n argocd

# Force sync
argocd app sync elastic-synthetic-monitoring
```

#### Monitors Not Appearing in Kibana
```bash
# Check sync service logs
kubectl logs deployment/kibana-sync-service -n elastic-synthetic-monitoring

# Verify ConfigMaps
kubectl get configmaps -n elastic-synthetic-monitoring -l app=synthetic-monitor

# Test Kibana connectivity
kubectl exec -it deployment/kibana-sync-service -n elastic-synthetic-monitoring -- \
  curl -k $KIBANA_URL/api/status
```

#### Elastic Agent Issues
```bash
# Check DaemonSet status
kubectl get daemonset elastic-agent-synthetics -n elastic-synthetic-monitoring

# View agent logs
kubectl logs daemonset/elastic-agent-synthetics -n elastic-synthetic-monitoring

# Check node scheduling
kubectl describe daemonset elastic-agent-synthetics -n elastic-synthetic-monitoring
```

### Debug Commands

```bash
# Validate journey syntax
npx @elastic/synthetics --dry-run journeys/

# Test monitor configuration
python scripts/sync-monitors.py --dry-run

# Check Kubernetes resources
kubectl get all -n elastic-synthetic-monitoring

# Verify secrets
kubectl get secrets -n elastic-synthetic-monitoring
```

## 🔐 Security

### Secret Management
- Use Kubernetes secrets for sensitive data
- Consider external secret management (e.g., HashiCorp Vault)
- Rotate API keys regularly

### RBAC Configuration
- Minimal required permissions for service accounts
- Separate roles for different components
- Regular permission audits

### Network Security
- Use TLS for all communications
- Network policies for pod-to-pod communication
- Secure ingress configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices for journeys
- Use YAML lint for configuration files
- Add documentation for new features
- Include tests for Python scripts

## 📚 Additional Resources

- [Elastic Synthetics Documentation](https://www.elastic.co/guide/en/observability/current/synthetics.html)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Ansible Documentation](https://docs.ansible.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the DevOps team
- Check the troubleshooting section above

---

**Happy Monitoring! 🎯**
