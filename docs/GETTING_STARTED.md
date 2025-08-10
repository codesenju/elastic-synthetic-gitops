# 🚀 Getting Started - Complete Setup Guide

Get up and running with Elastic Synthetic Monitoring on your new Kubernetes cluster in 30 minutes!

## 🎯 Quick Overview

This guide covers the complete setup process from a fresh Kubernetes cluster to fully operational synthetic monitoring, following the established patterns from the kubelab repository:
- **📊 Elastic Stack Integration**: Connect to your Elasticsearch and Kibana
- **🤖 Fleet Server Setup**: Configure Fleet management infrastructure
- **🔑 API Key Creation**: Create proper Fleet management API keys
- **📍 Private Location Setup**: Configure `synthetic-monitor-default` location
- **🚢 Ansible Automation**: Deploy using established kubelab patterns

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Kubernetes cluster** (v1.24+) up and running
- [ ] **kubectl** configured and connected to your cluster
- [ ] **ArgoCD** installed on your cluster
- [ ] **Elastic Stack** deployed with:
  - [ ] **Elasticsearch URL**: `https://elasticsearch.example.com:9200`
  - [ ] **Kibana URL**: `https://kibana.example.com`
  - [ ] **Fleet Server URL**: `https://fleet.example.com:443`
- [ ] **Ansible** (v8.0+) with kubernetes collection
- [ ] **Node.js** (v18+) and **npm** installed locally
- [ ] **Python** (v3.11+) and **pip** installed locally

## 🏗️ Step 1: Repository Setup and Configuration

### Clone and Configure Repository

```bash
# Clone the repository
git clone https://github.com/your-org/elastic-synthetic-gitops.git
cd elastic-synthetic-gitops

# Install dependencies
npm install
pip install -r requirements.txt

# Install Ansible Kubernetes collection
ansible-galaxy collection install kubernetes.core
```

### Configure Ansible Environment

Following the kubelab pattern, create your Ansible configuration:

```bash
# Copy inventory template
cp ansible/inventory.ini.example ansible/inventory.ini

# Edit inventory with your cluster details
vim ansible/inventory.ini
```

**Update `ansible/inventory.ini`:**
```ini
[control-plane]
k8s-control-plane-1 ansible_host=192.168.0.41
k8s-control-plane-2 ansible_host=192.168.0.42
k8s-control-plane-3 ansible_host=192.168.0.43

[workers]
k8s-worker-1 ansible_host=192.168.0.51
k8s-worker-2 ansible_host=192.168.0.52
k8s-worker-3 ansible_host=192.168.0.53

[all:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=./kubelab.pem
```

### Configure Ansible Variables

Create the secrets file following kubelab patterns:

```bash
# Create group_vars directory structure
mkdir -p ansible/group_vars/all

# Create secrets file (encrypted with ansible-vault)
ansible-vault create ansible/group_vars/all/secrets.yaml
```

**Add these variables to `secrets.yaml`:**
```yaml
# Elasticsearch Configuration
elastic_endpoint: "https://elasticsearch.example.com:9200"
elasticsearch_password: "your-elasticsearch-password"

# Kibana Configuration  
kibana_url: "https://kibana.example.com"

# Fleet Server Configuration
fleet_server_default_url: "https://fleet.example.com:443"
fleet_server_es_host: "https://elasticsearch.example.com:9200"

# Fleet Manager API Key (will be created in next step)
fleet_manager_api_key: ""  # Leave empty, will be populated

# Git Configuration
gitea_instance_url: "https://git.example.com"
```

## 🔑 Step 2: Create Fleet Manager API Key

Following the kubelab documentation pattern, create the Fleet Manager API key with proper privileges.

### Method 1: Using Kibana Dashboard (Recommended)

1. Navigate to **Stack Management** → **API Keys**
2. Click **Create API Key**
3. Set name: `fleet-manager`
4. Under **Role descriptors**, add:

```json
{
  "fleet_admin": {
    "cluster": ["manage", "manage_api_key", "manage_service_account"],
    "indices": [
      {
        "names": [".fleet*", ".kibana*", "logs-*", "metrics-*"],
        "privileges": ["all"],
        "allow_restricted_indices": true
      }
    ],
    "applications": [
      {
        "application": "kibana-.kibana",
        "privileges": ["all"],
        "resources": ["*"]
      }
    ]
  }
}
```

5. Click **Create API Key**
6. Copy the **Encoded** value

### Method 2: Using cURL

```bash
curl -X POST "https://elasticsearch.example.com:9200/_security/api_key" \
  -u "elastic:your-password" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "fleet-manager",
    "role_descriptors": {
      "fleet_admin": {
        "cluster": ["manage", "manage_api_key", "manage_service_account"],
        "indices": [
          {
            "names": [".fleet*", ".kibana*", "logs-*", "metrics-*"],
            "privileges": ["all"],
            "allow_restricted_indices": true
          }
        ],
        "applications": [
          {
            "application": "kibana-.kibana",
            "privileges": ["all"],
            "resources": ["*"]
          }
        ]
      }
    }
  }'
```

### Update Secrets with API Key

```bash
# Edit the secrets file
ansible-vault edit ansible/group_vars/all/secrets.yaml

# Add the API key
fleet_manager_api_key: "YOUR_ENCODED_API_KEY_HERE"
```

## 🚢 Step 3: Deploy Fleet Server Infrastructure

Following the kubelab pattern, deploy the Fleet Server first:

### Create Fleet Server Playbook

Create `ansible/deploy-fleet-server.yaml`:

```yaml
- name: Deploy Elastic Fleet Server Infrastructure
  hosts: localhost
  connection: local
  gather_facts: true
  vars_files:
    - group_vars/all/secrets.yaml
  
  tasks:
    - name: Deploy Fleet Server using kubelab pattern
      include_tasks: tasks/elastic-fleet.yaml
```

### Deploy Fleet Server

```bash
cd ansible/

# Deploy Fleet Server infrastructure
ansible-playbook deploy-fleet-server.yaml --ask-vault-pass

# Verify deployment
kubectl get pods -n elastic-system | grep fleet
kubectl get applications -n argocd | grep elastic-fleet
```

This will:
1. **Create Fleet Server policy** (`fleet-server-policy-default`)
2. **Add Fleet Server integration** to the policy
3. **Create Fleet Server host** configuration
4. **Generate service token** for Fleet Server authentication
5. **Create Kubernetes secret** (`fleet-server-config`)
6. **Deploy ArgoCD application** for Fleet Server

## 📍 Step 4: Deploy Synthetic Monitor Infrastructure

Now deploy the synthetic monitoring infrastructure following the same pattern:

### Create Synthetic Monitor Playbook

Create `ansible/deploy-synthetic-monitor.yaml`:

```yaml
- name: Deploy Elastic Synthetic Monitor Infrastructure  
  hosts: localhost
  connection: local
  gather_facts: true
  vars_files:
    - group_vars/all/secrets.yaml
    
  tasks:
    - name: Deploy Synthetic Monitor using kubelab pattern
      include_tasks: tasks/elastic-synthetic-monitor.yaml
```

### Deploy Synthetic Monitor

```bash
# Deploy Synthetic Monitor infrastructure
ansible-playbook deploy-synthetic-monitor.yaml --ask-vault-pass

# Verify deployment
kubectl get pods -n elastic-system | grep synthetic
kubectl get applications -n argocd | grep synthetic-monitor
```

This will:
1. **Create agent policy** (`synthetic-monitor-policy-default`) with no integrations
2. **Create private location** (`synthetic-monitor-default`) linked to the policy
3. **Generate enrollment token** for agent enrollment
4. **Create Kubernetes secret** (`synthetic-monitor-config`)
5. **Deploy ArgoCD application** for Synthetic Monitor agents

## 🔍 Step 5: Verify Infrastructure Deployment

### Check Fleet Server Status

```bash
# Check Fleet Server pods
kubectl get pods -n elastic-system -l app=elastic-fleet

# Check Fleet Server logs
kubectl logs -n elastic-system -l app=elastic-fleet

# Verify Fleet Server in Kibana
# Go to Fleet -> Agents -> Fleet Server hosts
```

### Check Synthetic Monitor Agent Status

```bash
# Check Synthetic Monitor pods  
kubectl get pods -n elastic-system -l app=elastic-synthetic-monitor

# Check agent enrollment status
kubectl logs -n elastic-system -l app=elastic-synthetic-monitor

# Verify agents in Kibana
# Go to Fleet -> Agents (should show enrolled agents)
```

### Verify Private Location

```bash
# Check private location in Kibana
# Go to Observability -> Uptime -> Settings -> Private Locations
# You should see "synthetic-monitor-default" listed as available
```

### Check ArgoCD Applications

```bash
# Check ArgoCD application status
kubectl get applications -n argocd

# Check sync status
argocd app get elastic-fleet
argocd app get elastic-synthetic-monitor
```

## 📊 Step 6: Create Your First Monitor

Now that the infrastructure is deployed, create your first synthetic monitor using the established private location.

### HTTP Monitor Example

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
    service: my-website
    managed-by: gitops
data:
  monitors.yaml: |
    monitors:
      - name: "My Website Health Check"
        type: http
        url: "https://your-website.com"
        method: GET
        schedule:
          number: "5"
          unit: "m"
        timeout: "10s"
        enabled: true
        tags:
          - "website"
          - "health-check"
          - "critical"
          - "ansible-managed"
        private_locations:
          - "synthetic-monitor-default"  # Uses your deployed private location
        expected_status: [200]
        expected_body_positive:
          - "Welcome"
        alert:
          status:
            enabled: true
```

### Deploy Monitor via GitOps

```bash
# Add the monitor to git
git add monitors/my-first-monitor.yaml
git commit -m "Add first synthetic monitor for website health check"
git push origin main

# ArgoCD will automatically sync within 2-3 minutes
# Check sync status
argocd app sync elastic-synthetic-monitoring
```

## 🌐 Step 7: Create Your First Journey

Create a browser journey using the deployed private location:

### Basic Journey Example

Create `journeys/my-first-journey.ts`:

```typescript
import { journey, step, monitor, expect } from '@elastic/synthetics';

journey('My Website User Journey', ({ page, params }) => {
  // Configure monitor to use the deployed private location
  monitor.use({
    id: 'my-website-journey',
    name: 'My Website User Journey',
    schedule: 10, // Run every 10 minutes
    locations: [], // No public locations
    privateLocations: ['synthetic-monitor-default'], // Uses deployed private location
    tags: ['website', 'user-journey', 'critical', 'ansible-managed'],
    alert: {
      status: {
        enabled: true,
      },
    },
  });

  step('Visit homepage', async () => {
    const baseUrl = params.baseUrl || 'https://your-website.com';
    await page.goto(baseUrl);
    
    // Verify page loaded
    expect(await page.title()).toContain('Your Website');
    
    // Check for key elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  step('Test navigation', async () => {
    // Test a navigation link
    const aboutLink = page.locator('a[href*="about"]');
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  step('Verify page performance', async () => {
    // Check page load time
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Expect page to load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
```

### Configure Synthetics for Your Environment

Update `synthetics.config.ts`:

```typescript
import type { SyntheticsConfig } from '@elastic/synthetics';

export default env => {
  const config: SyntheticsConfig = {
    params: {
      baseUrl: env === 'production' 
        ? 'https://your-production-site.com' 
        : 'https://your-staging-site.com',
    },
    playwrightOptions: {
      ignoreHTTPSErrors: false,
    },
    monitor: {
      schedule: 10,
      locations: [], // No public locations
      privateLocations: ['synthetic-monitor-default'], // Uses deployed private location
    },
    project: {
      id: 'elastic-synthetic-gitops',
      url: 'https://kibana.example.com/', // Your Kibana URL
      space: 'default',
    },
  };
  
  return config;
};
```

### Deploy Journey

```bash
# Test the journey locally first
npx @elastic/synthetics --dry-run journeys/my-first-journey.ts

# If successful, commit and deploy
git add journeys/my-first-journey.ts synthetics.config.ts
git commit -m "Add first user journey with deployed private location"
git push origin main

# Push journey to Kibana using the deployed private location
npm run push:journeys
```

## 📊 Step 8: Verify Everything is Working

### Check Monitor Results in Kibana

1. **Navigate to Kibana**: `https://kibana.example.com`
2. **Go to Observability** → **Uptime**
3. **Verify your monitors** are listed and running
4. **Check monitor results** and screenshots (for journeys)
5. **Verify private location** shows as "synthetic-monitor-default"

### Check Fleet Management

1. **Go to Fleet** → **Agents**
2. **Verify agents are enrolled** and showing as "Healthy"
3. **Check agent policies**:
   - `fleet-server-policy-default` (with Fleet Server integration)
   - `synthetic-monitor-policy-default` (no integrations, used by private location)

### Monitor Infrastructure Health

```bash
# Check all synthetic monitoring components
kubectl get pods -n elastic-system

# Check ArgoCD sync status
kubectl get applications -n argocd

# Check secrets are created
kubectl get secrets -n elastic-system | grep -E "(fleet-server-config|synthetic-monitor-config)"

# Check logs for any issues
kubectl logs -n elastic-system -l app=elastic-synthetic-monitor --tail=50
```

This completes the basic setup following the kubelab patterns. Continue reading for troubleshooting and advanced configuration options.
