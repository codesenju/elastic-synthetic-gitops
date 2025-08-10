#!/bin/bash

# Fleet Enrollment Setup Script
# This script helps set up Fleet enrollment for synthetic monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${SCRIPT_DIR}/../config"

echo -e "${BLUE}🚀 Fleet Enrollment Setup for Synthetic Monitoring${NC}"
echo "=================================================="

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}📋 Checking prerequisites...${NC}"
    
    # Check if required tools are installed
    local missing_tools=()
    
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_tools+=("jq")
    fi
    
    if ! command -v kubectl &> /dev/null; then
        missing_tools+=("kubectl")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required tools: ${missing_tools[*]}${NC}"
        echo "Please install the missing tools and try again."
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Get configuration from user
get_configuration() {
    echo -e "${BLUE}🔧 Configuration Setup${NC}"
    
    # Get Kibana URL
    if [ -z "$KIBANA_URL" ]; then
        read -p "Enter your Kibana URL (e.g., https://kibana.your-domain.com): " KIBANA_URL
    fi
    
    # Get Kibana API Key
    if [ -z "$KIBANA_API_KEY" ]; then
        echo "To create a Kibana API Key:"
        echo "1. Go to Kibana -> Stack Management -> API Keys"
        echo "2. Create a new API key with 'Fleet' and 'Synthetics' privileges"
        echo ""
        read -p "Enter your Kibana API Key: " KIBANA_API_KEY
    fi
    
    # Get Kibana Space (optional)
    if [ -z "$KIBANA_SPACE" ]; then
        read -p "Enter Kibana Space (default: default): " KIBANA_SPACE
        KIBANA_SPACE=${KIBANA_SPACE:-default}
    fi
    
    # Get private location name
    if [ -z "$PRIVATE_LOCATION_NAME" ]; then
        read -p "Enter private location name (default: synthetic-monitor-default): " PRIVATE_LOCATION_NAME
        PRIVATE_LOCATION_NAME=${PRIVATE_LOCATION_NAME:-synthetic-monitor-default}
    fi
    
    # Get geographic location (optional)
    if [ -z "$GEO_LAT" ]; then
        read -p "Enter latitude for your location (default: 37.7749): " GEO_LAT
        GEO_LAT=${GEO_LAT:-37.7749}
    fi
    
    if [ -z "$GEO_LON" ]; then
        read -p "Enter longitude for your location (default: -122.4194): " GEO_LON
        GEO_LON=${GEO_LON:--122.4194}
    fi
    
    echo -e "${GREEN}✅ Configuration collected${NC}"
}

# Test Kibana connectivity
test_kibana_connectivity() {
    echo -e "${BLUE}🔗 Testing Kibana connectivity...${NC}"
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: ApiKey ${KIBANA_API_KEY}" \
        -H "kbn-xsrf: true" \
        "${KIBANA_URL}/api/status")
    
    if [ "$status_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Kibana connectivity successful${NC}"
    else
        echo -e "${RED}❌ Failed to connect to Kibana (HTTP $status_code)${NC}"
        echo "Please check your Kibana URL and API key."
        exit 1
    fi
}

# Create Fleet policy
create_fleet_policy() {
    echo -e "${BLUE}📋 Creating Fleet policy...${NC}"
    
    local policy_name="synthetic-monitor-default-policy"
    local policy_data=$(cat <<EOF
{
  "name": "${policy_name}",
  "description": "Policy for synthetic monitoring private location",
  "namespace": "default",
  "monitoring_enabled": ["logs", "metrics"]
}
EOF
)
    
    local response
    response=$(curl -s -X POST \
        -H "Authorization: ApiKey ${KIBANA_API_KEY}" \
        -H "kbn-xsrf: true" \
        -H "Content-Type: application/json" \
        -d "$policy_data" \
        "${KIBANA_URL}/s/${KIBANA_SPACE}/api/fleet/agent_policies")
    
    if echo "$response" | jq -e '.item.id' > /dev/null 2>&1; then
        POLICY_ID=$(echo "$response" | jq -r '.item.id')
        echo -e "${GREEN}✅ Fleet policy created: ${POLICY_ID}${NC}"
    else
        echo -e "${RED}❌ Failed to create Fleet policy${NC}"
        echo "Response: $response"
        exit 1
    fi
}

# Add synthetics integration to policy
add_synthetics_integration() {
    echo -e "${BLUE}🔌 Adding synthetics integration...${NC}"
    
    local integration_data=$(cat <<EOF
{
  "name": "synthetics-1",
  "description": "Synthetics integration for private location",
  "namespace": "default",
  "policy_id": "${POLICY_ID}",
  "package": {
    "name": "synthetics",
    "version": "1.0.0"
  },
  "inputs": [
    {
      "type": "synthetics/http",
      "enabled": true,
      "streams": [
        {
          "enabled": true,
          "data_stream": {
            "type": "synthetics",
            "dataset": "http"
          }
        }
      ]
    },
    {
      "type": "synthetics/tcp",
      "enabled": true,
      "streams": [
        {
          "enabled": true,
          "data_stream": {
            "type": "synthetics",
            "dataset": "tcp"
          }
        }
      ]
    },
    {
      "type": "synthetics/icmp",
      "enabled": true,
      "streams": [
        {
          "enabled": true,
          "data_stream": {
            "type": "synthetics",
            "dataset": "icmp"
          }
        }
      ]
    },
    {
      "type": "synthetics/browser",
      "enabled": true,
      "streams": [
        {
          "enabled": true,
          "data_stream": {
            "type": "synthetics",
            "dataset": "browser"
          }
        }
      ]
    }
  ]
}
EOF
)
    
    local response
    response=$(curl -s -X POST \
        -H "Authorization: ApiKey ${KIBANA_API_KEY}" \
        -H "kbn-xsrf: true" \
        -H "Content-Type: application/json" \
        -d "$integration_data" \
        "${KIBANA_URL}/s/${KIBANA_SPACE}/api/fleet/package_policies")
    
    if echo "$response" | jq -e '.item.id' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Synthetics integration added${NC}"
    else
        echo -e "${RED}❌ Failed to add synthetics integration${NC}"
        echo "Response: $response"
        exit 1
    fi
}

# Create private location
create_private_location() {
    echo -e "${BLUE}📍 Creating private location...${NC}"
    
    local location_data=$(cat <<EOF
{
  "label": "${PRIVATE_LOCATION_NAME}",
  "agentPolicyId": "${POLICY_ID}",
  "geo": {
    "lat": ${GEO_LAT},
    "lon": ${GEO_LON}
  },
  "tags": ["kubernetes", "private", "default"]
}
EOF
)
    
    local response
    response=$(curl -s -X POST \
        -H "Authorization: ApiKey ${KIBANA_API_KEY}" \
        -H "kbn-xsrf: true" \
        -H "Content-Type: application/json" \
        -d "$location_data" \
        "${KIBANA_URL}/s/${KIBANA_SPACE}/api/synthetics/private_locations")
    
    if echo "$response" | jq -e '.label' > /dev/null 2>&1; then
        LOCATION_ID=$(echo "$response" | jq -r '.id // "N/A"')
        echo -e "${GREEN}✅ Private location created: ${PRIVATE_LOCATION_NAME}${NC}"
    else
        echo -e "${RED}❌ Failed to create private location${NC}"
        echo "Response: $response"
        exit 1
    fi
}

# Get enrollment token
get_enrollment_token() {
    echo -e "${BLUE}🎫 Getting enrollment token...${NC}"
    
    local response
    response=$(curl -s -X POST \
        -H "Authorization: ApiKey ${KIBANA_API_KEY}" \
        -H "kbn-xsrf: true" \
        -H "Content-Type: application/json" \
        -d "{\"policy_id\": \"${POLICY_ID}\"}" \
        "${KIBANA_URL}/s/${KIBANA_SPACE}/api/fleet/enrollment_api_keys")
    
    if echo "$response" | jq -e '.item.api_key' > /dev/null 2>&1; then
        ENROLLMENT_TOKEN=$(echo "$response" | jq -r '.item.api_key')
        echo -e "${GREEN}✅ Enrollment token obtained${NC}"
    else
        echo -e "${RED}❌ Failed to get enrollment token${NC}"
        echo "Response: $response"
        exit 1
    fi
}

# Update Kubernetes secrets
update_k8s_secrets() {
    echo -e "${BLUE}🔐 Updating Kubernetes secrets...${NC}"
    
    # Create the secrets manifest
    cat > "${CONFIG_DIR}/secrets-updated.yaml" <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: elasticsearch-credentials
  namespace: elastic-synthetic-monitoring
  labels:
    app.kubernetes.io/name: elasticsearch-credentials
    app.kubernetes.io/component: credentials
  annotations:
    argocd.argoproj.io/sync-wave: "1"
type: Opaque
stringData:
  elasticsearch-password: "${ELASTICSEARCH_PASSWORD:-changeme}"
  kibana-api-key: "${KIBANA_API_KEY}"
  fleet-api-key: "${KIBANA_API_KEY}"
  elasticsearch-username: "elastic"
  elasticsearch-url: "${ELASTICSEARCH_URL:-${KIBANA_URL/kibana/elasticsearch}:9200}"
  kibana-url: "${KIBANA_URL}"
  fleet-url: "${KIBANA_URL}"
  fleet-enrollment-token: "${ENROLLMENT_TOKEN}"
  fleet-policy-id: "${POLICY_ID}"
  private-location-name: "${PRIVATE_LOCATION_NAME}"
EOF
    
    echo -e "${GREEN}✅ Secrets configuration created: ${CONFIG_DIR}/secrets-updated.yaml${NC}"
    echo -e "${YELLOW}⚠️  Please review and apply this configuration to your cluster${NC}"
}

# Generate summary
generate_summary() {
    echo ""
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo "=================================="
    echo ""
    echo -e "${BLUE}Configuration Summary:${NC}"
    echo "- Kibana URL: ${KIBANA_URL}"
    echo "- Kibana Space: ${KIBANA_SPACE}"
    echo "- Private Location: ${PRIVATE_LOCATION_NAME}"
    echo "- Fleet Policy ID: ${POLICY_ID}"
    echo "- Location ID: ${LOCATION_ID}"
    echo "- Geographic Location: ${GEO_LAT}, ${GEO_LON}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Apply the updated secrets to your cluster:"
    echo "   kubectl apply -f ${CONFIG_DIR}/secrets-updated.yaml"
    echo ""
    echo "2. Deploy the Elastic Agent DaemonSet:"
    echo "   kubectl apply -f manifests/elastic-agent.yaml"
    echo ""
    echo "3. Verify agent enrollment in Kibana:"
    echo "   Go to Fleet -> Agents and check for healthy agents"
    echo ""
    echo "4. Verify private location availability:"
    echo "   Go to Observability -> Uptime -> Settings -> Private Locations"
    echo ""
    echo "5. Start creating synthetic monitors using the private location:"
    echo "   Use '${PRIVATE_LOCATION_NAME}' in your monitor configurations"
    echo ""
    echo -e "${GREEN}Your synthetic monitoring setup is ready! 🚀${NC}"
}

# Main execution
main() {
    check_prerequisites
    get_configuration
    test_kibana_connectivity
    create_fleet_policy
    add_synthetics_integration
    create_private_location
    get_enrollment_token
    
    # Create config directory if it doesn't exist
    mkdir -p "${CONFIG_DIR}"
    
    update_k8s_secrets
    generate_summary
}

# Run main function
main "$@"
