# ✅ Onboarding Checklist

Use this checklist to systematically onboard your services and applications to synthetic monitoring.

## 📋 Pre-Onboarding Assessment

### Service Information Gathering
- [ ] **Service Name**: ________________________________
- [ ] **Team Owner**: ___________________________________
- [ ] **Environment**: Production / Staging / Development
- [ ] **Criticality Level**: Critical / Important / Monitoring
- [ ] **Primary Contact**: _______________________________
- [ ] **Slack Channel**: ________________________________

### Technical Information
- [ ] **Service Type**: Web Application / API / Database / Infrastructure
- [ ] **Primary URL**: ___________________________________
- [ ] **Health Check Endpoint**: _________________________
- [ ] **Authentication Required**: Yes / No
- [ ] **Dependencies**: __________________________________

## 🎯 Endpoint Monitoring Setup

### Step 1: Identify Endpoints
- [ ] **Health Check Endpoints**
  - [ ] Main health endpoint: ____________________________
  - [ ] Database health: _________________________________
  - [ ] External dependencies: ___________________________

- [ ] **Critical API Endpoints**
  - [ ] Authentication endpoint: ____________________________
  - [ ] Core business API: ___________________________________
  - [ ] Payment/transaction API: _____________________________

- [ ] **Infrastructure Components**
  - [ ] Load balancer: _______________________________________
  - [ ] Database server: ____________________________________
  - [ ] Cache server: _______________________________________

### Step 2: Create Monitor Configuration
- [ ] **Copy template**: `cp examples/endpoint-monitoring-template.yaml monitors/[SERVICE_NAME]-monitors.yaml`
- [ ] **Update service name** throughout the file
- [ ] **Update URLs** with actual endpoints
- [ ] **Configure authentication** (if required)
- [ ] **Set monitoring schedules**:
  - [ ] Critical services: 1-5 minutes
  - [ ] Important services: 5-15 minutes
  - [ ] Monitoring services: 15-60 minutes
- [ ] **Configure alerts**:
  - [ ] Enable for production critical services
  - [ ] Disable for staging/development (optional)
- [ ] **Add appropriate tags**:
  - [ ] Service name
  - [ ] Team name
  - [ ] Environment
  - [ ] Criticality level

### Step 3: Validate Configuration
- [ ] **YAML syntax check**: `yamllint monitors/[SERVICE_NAME]-monitors.yaml`
- [ ] **Review with team** for completeness
- [ ] **Test URLs** manually to ensure they're accessible

### Step 4: Deploy Monitors
- [ ] **Create feature branch**: `git checkout -b feature/add-[SERVICE_NAME]-monitoring`
- [ ] **Commit changes**: `git add monitors/ && git commit -m "Add monitoring for [SERVICE_NAME]"`
- [ ] **Push branch**: `git push origin feature/add-[SERVICE_NAME]-monitoring`
- [ ] **Create Pull Request**
- [ ] **Get team review and approval**
- [ ] **Merge to main branch**

### Step 5: Verify Deployment
- [ ] **Check ArgoCD sync**: Monitor shows as synced in ArgoCD dashboard
- [ ] **Verify ConfigMap creation**: `kubectl get configmaps -n elastic-synthetic-monitoring -l service=[SERVICE_NAME]`
- [ ] **Check sync service logs**: `kubectl logs deployment/kibana-sync-service -n elastic-synthetic-monitoring`
- [ ] **Verify in Kibana**: Monitors appear in Uptime dashboard
- [ ] **Wait for first results**: Allow 5-10 minutes for initial data

## 🌐 Journey Testing Setup

### Step 1: Identify User Journeys
- [ ] **Critical User Paths**:
  - [ ] User registration/login: ______________________________
  - [ ] Main business process: _______________________________
  - [ ] Payment/checkout flow: _______________________________
  - [ ] Content creation/editing: ____________________________

- [ ] **Important Features**:
  - [ ] Search functionality: ________________________________
  - [ ] Profile management: __________________________________
  - [ ] Settings/configuration: ______________________________
  - [ ] Data export/import: __________________________________

- [ ] **Monitoring Paths**:
  - [ ] Homepage loading: ____________________________________
  - [ ] Navigation testing: __________________________________
  - [ ] Form submissions: ____________________________________
  - [ ] Mobile responsiveness: _______________________________

### Step 2: Gather Journey Requirements
- [ ] **Test User Credentials**:
  - [ ] Username/Email: ______________________________________
  - [ ] Password: ___________________________________________
  - [ ] Additional test data: ________________________________

- [ ] **Environment URLs**:
  - [ ] Production URL: _____________________________________
  - [ ] Staging URL: _______________________________________
  - [ ] Development URL: ___________________________________

- [ ] **Page Elements** (data-testid attributes preferred):
  - [ ] Login form elements: ________________________________
  - [ ] Navigation elements: ________________________________
  - [ ] Main content areas: _________________________________
  - [ ] Success/error messages: _____________________________

### Step 3: Create Journey Files
- [ ] **Copy template**: `cp examples/journey-testing-template.ts journeys/[SERVICE_NAME]-[JOURNEY_NAME].journey.ts`
- [ ] **Update journey name** and description
- [ ] **Configure monitor settings**:
  - [ ] Set unique monitor ID
  - [ ] Configure schedule (10-30 minutes typical)
  - [ ] Add appropriate tags
  - [ ] Enable/disable alerts based on criticality
- [ ] **Update page selectors** to match your application
- [ ] **Configure test data** and credentials
- [ ] **Add proper wait conditions** for dynamic content
- [ ] **Include verification steps** for each action

### Step 4: Test Journey Locally
- [ ] **Install dependencies**: `npm install`
- [ ] **Syntax check**: `npx tsc --noEmit`
- [ ] **Dry run test**: `npx @elastic/synthetics --dry-run journeys/[SERVICE_NAME]-[JOURNEY_NAME].journey.ts`
- [ ] **Full local test** (optional): `npx @elastic/synthetics journeys/[SERVICE_NAME]-[JOURNEY_NAME].journey.ts`
- [ ] **Fix any errors** found during testing

### Step 5: Deploy Journey
- [ ] **Create feature branch**: `git checkout -b feature/add-[SERVICE_NAME]-journey`
- [ ] **Commit changes**: `git add journeys/ && git commit -m "Add [JOURNEY_NAME] journey for [SERVICE_NAME]"`
- [ ] **Push branch**: `git push origin feature/add-[SERVICE_NAME]-journey`
- [ ] **Create Pull Request**
- [ ] **Get team review and approval**
- [ ] **Merge to main branch**
- [ ] **Push to Kibana**: `npm run push:journeys`

### Step 6: Verify Journey Deployment
- [ ] **Check Kibana Uptime**: Journey appears in monitor list
- [ ] **Wait for first run**: Allow 10-15 minutes for initial execution
- [ ] **Review results**: Check for successful execution and screenshots
- [ ] **Verify alerts** (if enabled): Ensure alert configuration is working
- [ ] **Test failure scenarios**: Temporarily break something to verify alerting

## 🔧 Post-Deployment Configuration

### Alerting Setup
- [ ] **Configure notification channels**:
  - [ ] Slack integration: ___________________________________
  - [ ] Email notifications: ________________________________
  - [ ] PagerDuty/incident management: ______________________

- [ ] **Set alert thresholds**:
  - [ ] Failure count before alerting: ______________________
  - [ ] Response time thresholds: ____________________________
  - [ ] Availability percentage thresholds: __________________

### Dashboard Creation
- [ ] **Create team dashboard** in Kibana
- [ ] **Add key metrics** for your services
- [ ] **Set up visualizations** for trends and patterns
- [ ] **Share dashboard** with team members

### Documentation
- [ ] **Update team documentation** with monitoring details
- [ ] **Document test credentials** and data (securely)
- [ ] **Create runbook** for common issues
- [ ] **Share knowledge** with team members

## 📊 Monitoring and Maintenance

### Regular Reviews
- [ ] **Weekly**: Review monitor results and trends
- [ ] **Monthly**: Assess monitor effectiveness and coverage
- [ ] **Quarterly**: Update monitors based on application changes

### Maintenance Tasks
- [ ] **Update test credentials** when they change
- [ ] **Modify monitors** when endpoints change
- [ ] **Add new monitors** for new features
- [ ] **Remove obsolete monitors** for deprecated features

### Performance Optimization
- [ ] **Adjust monitoring frequencies** based on usage patterns
- [ ] **Optimize journey performance** to reduce execution time
- [ ] **Review alert noise** and adjust thresholds
- [ ] **Update selectors** when UI changes

## 🚨 Troubleshooting Checklist

### Monitor Not Working
- [ ] **Check ConfigMap exists**: `kubectl get configmaps -n elastic-synthetic-monitoring`
- [ ] **Verify sync service**: `kubectl logs deployment/kibana-sync-service -n elastic-synthetic-monitoring`
- [ ] **Check YAML syntax**: `yamllint monitors/your-monitor.yaml`
- [ ] **Verify URLs are accessible** from monitoring location
- [ ] **Check authentication** if required

### Journey Failing
- [ ] **Review error messages** in Kibana
- [ ] **Check screenshots** for visual debugging
- [ ] **Test selectors** are still valid
- [ ] **Verify test data** is still valid
- [ ] **Check for application changes** that might affect the journey
- [ ] **Test locally** with same parameters

### No Data Appearing
- [ ] **Check ArgoCD sync status**
- [ ] **Verify Elastic Agent is running**: `kubectl get daemonset elastic-agent-synthetics -n elastic-synthetic-monitoring`
- [ ] **Check Elasticsearch connectivity**
- [ ] **Verify Kibana configuration**
- [ ] **Check for network issues**

## ✅ Sign-off

### Team Review
- [ ] **Technical review completed** by: ______________________ Date: __________
- [ ] **Business review completed** by: ______________________ Date: __________
- [ ] **Security review completed** by: ______________________ Date: __________

### Go-Live Approval
- [ ] **All monitors deployed and working**
- [ ] **Alerts configured and tested**
- [ ] **Team trained on monitoring dashboard**
- [ ] **Documentation updated**
- [ ] **Runbooks created**

**Service officially onboarded**: _________________ Date: __________

**Onboarded by**: ________________________________

**Next review scheduled**: _______________________

---

## 📞 Support Contacts

- **Platform Team**: devops-team@company.com
- **Slack Channel**: #devops-monitoring
- **Documentation**: [Link to internal docs]
- **Emergency Contact**: [On-call rotation]

**Congratulations! Your service is now monitored! 🎉**
