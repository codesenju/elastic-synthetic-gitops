#!/usr/bin/env python3
"""
Kibana Synthetic Monitor Sync Script
Syncs synthetic monitors and journeys from Kubernetes ConfigMaps to Kibana
"""

import os
import sys
import json
import yaml
import time
import logging
import requests
from typing import Dict, List, Optional, Any
from kubernetes import client, config
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class KibanaSyncService:
    def __init__(self):
        self.kibana_url = os.getenv('KIBANA_URL', 'https://kibana.example.com')
        self.api_key = os.getenv('KIBANA_API_KEY')
        self.namespace = os.getenv('NAMESPACE', 'elastic-synthetic-monitoring')
        self.space = os.getenv('KIBANA_SPACE', 'default')
        
        # Initialize Kubernetes client
        try:
            config.load_incluster_config()
        except:
            config.load_kube_config()
        
        self.k8s_client = client.CoreV1Api()
        
        # Setup session with authentication
        self.session = requests.Session()
        if self.api_key:
            self.session.headers.update({
                'Authorization': f'ApiKey {self.api_key}',
                'kbn-xsrf': 'true',
                'Content-Type': 'application/json'
            })
        else:
            logger.warning("No Kibana API key provided")

    def get_configmaps(self, label_selector: str = None) -> List[Dict]:
        """Get ConfigMaps from Kubernetes"""
        try:
            if label_selector:
                configmaps = self.k8s_client.list_namespaced_config_map(
                    namespace=self.namespace,
                    label_selector=label_selector
                )
            else:
                configmaps = self.k8s_client.list_namespaced_config_map(
                    namespace=self.namespace
                )
            return configmaps.items
        except Exception as e:
            logger.error(f"Failed to get ConfigMaps: {e}")
            return []

    def parse_monitor_config(self, configmap_data: Dict[str, str]) -> List[Dict]:
        """Parse monitor configuration from ConfigMap data"""
        monitors = []
        
        for key, value in configmap_data.items():
            if key.endswith('.yaml') or key.endswith('.yml'):
                try:
                    config_data = yaml.safe_load(value)
                    if isinstance(config_data, dict) and 'monitors' in config_data:
                        monitors.extend(config_data['monitors'])
                    elif isinstance(config_data, list):
                        monitors.extend(config_data)
                    elif isinstance(config_data, dict) and 'type' in config_data:
                        monitors.append(config_data)
                except yaml.YAMLError as e:
                    logger.error(f"Failed to parse YAML from {key}: {e}")
            elif key.endswith('.json'):
                try:
                    config_data = json.loads(value)
                    if isinstance(config_data, list):
                        monitors.extend(config_data)
                    elif isinstance(config_data, dict):
                        monitors.append(config_data)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON from {key}: {e}")
        
        return monitors

    def create_http_monitor(self, monitor_config: Dict) -> Dict:
        """Create HTTP monitor configuration for Kibana"""
        return {
            'type': 'http',
            'name': monitor_config.get('name', 'HTTP Monitor'),
            'schedule': monitor_config.get('schedule', {'number': '10', 'unit': 'm'}),
            'locations': monitor_config.get('locations', []),
            'private_locations': monitor_config.get('private_locations', ['synthetic-monitor-default']),
            'enabled': monitor_config.get('enabled', True),
            'tags': monitor_config.get('tags', []),
            'alert': monitor_config.get('alert', {'status': {'enabled': True}}),
            'config': {
                'request': {
                    'url': monitor_config.get('url', ''),
                    'method': monitor_config.get('method', 'GET'),
                    'headers': monitor_config.get('headers', {}),
                    'body': monitor_config.get('body', ''),
                },
                'response': {
                    'include_headers': monitor_config.get('include_headers', True),
                    'include_body': monitor_config.get('include_body', 'on_error'),
                    'include_body_max_bytes': monitor_config.get('include_body_max_bytes', 1024)
                },
                'check': {
                    'request': {
                        'method': monitor_config.get('method', 'GET'),
                        'url': monitor_config.get('url', ''),
                        'headers': monitor_config.get('headers', {}),
                        'body': monitor_config.get('body', '')
                    },
                    'response': {
                        'status': monitor_config.get('expected_status', [200]),
                        'headers': monitor_config.get('expected_headers', {}),
                        'body': {
                            'positive': monitor_config.get('expected_body_positive', []),
                            'negative': monitor_config.get('expected_body_negative', [])
                        }
                    }
                },
                'timeout': monitor_config.get('timeout', '16s'),
                'max_redirects': monitor_config.get('max_redirects', 3)
            }
        }

    def create_tcp_monitor(self, monitor_config: Dict) -> Dict:
        """Create TCP monitor configuration for Kibana"""
        return {
            'type': 'tcp',
            'name': monitor_config.get('name', 'TCP Monitor'),
            'schedule': monitor_config.get('schedule', {'number': '10', 'unit': 'm'}),
            'locations': monitor_config.get('locations', []),
            'private_locations': monitor_config.get('private_locations', ['synthetic-monitor-default']),
            'enabled': monitor_config.get('enabled', True),
            'tags': monitor_config.get('tags', []),
            'alert': monitor_config.get('alert', {'status': {'enabled': True}}),
            'config': {
                'hosts': monitor_config.get('hosts', []),
                'timeout': monitor_config.get('timeout', '16s'),
                'proxy_url': monitor_config.get('proxy_url', ''),
                'proxy_use_local_resolver': monitor_config.get('proxy_use_local_resolver', False),
                'check': {
                    'send': monitor_config.get('send_string', ''),
                    'receive': monitor_config.get('receive_string', '')
                }
            }
        }

    def create_icmp_monitor(self, monitor_config: Dict) -> Dict:
        """Create ICMP monitor configuration for Kibana"""
        return {
            'type': 'icmp',
            'name': monitor_config.get('name', 'ICMP Monitor'),
            'schedule': monitor_config.get('schedule', {'number': '10', 'unit': 'm'}),
            'locations': monitor_config.get('locations', []),
            'private_locations': monitor_config.get('private_locations', ['synthetic-monitor-default']),
            'enabled': monitor_config.get('enabled', True),
            'tags': monitor_config.get('tags', []),
            'alert': monitor_config.get('alert', {'status': {'enabled': True}}),
            'config': {
                'hosts': monitor_config.get('hosts', []),
                'timeout': monitor_config.get('timeout', '16s'),
                'wait': monitor_config.get('wait', '1s')
            }
        }

    def create_browser_monitor(self, monitor_config: Dict) -> Dict:
        """Create browser monitor configuration for Kibana"""
        return {
            'type': 'browser',
            'name': monitor_config.get('name', 'Browser Monitor'),
            'schedule': monitor_config.get('schedule', {'number': '10', 'unit': 'm'}),
            'locations': monitor_config.get('locations', []),
            'private_locations': monitor_config.get('private_locations', ['synthetic-monitor-default']),
            'enabled': monitor_config.get('enabled', True),
            'tags': monitor_config.get('tags', []),
            'alert': monitor_config.get('alert', {'status': {'enabled': True}}),
            'config': {
                'source': {
                    'inline': {
                        'script': monitor_config.get('script', ''),
                    }
                },
                'params': monitor_config.get('params', {}),
                'playwright_options': monitor_config.get('playwright_options', {}),
                'screenshots': monitor_config.get('screenshots', 'on'),
                'synthetics_args': monitor_config.get('synthetics_args', []),
                'filter_journeys': monitor_config.get('filter_journeys', {}),
                'ignore_https_errors': monitor_config.get('ignore_https_errors', False),
                'throttling': monitor_config.get('throttling', {
                    'download': 5,
                    'upload': 3,
                    'latency': 20
                })
            }
        }

    def get_existing_monitors(self) -> Dict[str, Dict]:
        """Get existing monitors from Kibana"""
        try:
            url = f"{self.kibana_url}/s/{self.space}/api/synthetics/monitors"
            response = self.session.get(url)
            response.raise_for_status()
            
            monitors = {}
            for monitor in response.json().get('monitors', []):
                monitors[monitor['name']] = monitor
            
            return monitors
        except Exception as e:
            logger.error(f"Failed to get existing monitors: {e}")
            return {}

    def create_monitor(self, monitor_config: Dict) -> bool:
        """Create a monitor in Kibana"""
        try:
            url = f"{self.kibana_url}/s/{self.space}/api/synthetics/monitors"
            response = self.session.post(url, json=monitor_config)
            response.raise_for_status()
            
            logger.info(f"Created monitor: {monitor_config['name']}")
            return True
        except Exception as e:
            logger.error(f"Failed to create monitor {monitor_config['name']}: {e}")
            return False

    def update_monitor(self, monitor_id: str, monitor_config: Dict) -> bool:
        """Update a monitor in Kibana"""
        try:
            url = f"{self.kibana_url}/s/{self.space}/api/synthetics/monitors/{monitor_id}"
            response = self.session.put(url, json=monitor_config)
            response.raise_for_status()
            
            logger.info(f"Updated monitor: {monitor_config['name']}")
            return True
        except Exception as e:
            logger.error(f"Failed to update monitor {monitor_config['name']}: {e}")
            return False

    def delete_monitor(self, monitor_id: str, monitor_name: str) -> bool:
        """Delete a monitor from Kibana"""
        try:
            url = f"{self.kibana_url}/s/{self.space}/api/synthetics/monitors/{monitor_id}"
            response = self.session.delete(url)
            response.raise_for_status()
            
            logger.info(f"Deleted monitor: {monitor_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete monitor {monitor_name}: {e}")
            return False

    def sync_monitors(self):
        """Main sync function"""
        logger.info("Starting monitor sync...")
        
        # Get monitor configurations from ConfigMaps
        configmaps = self.get_configmaps(label_selector="app=synthetic-monitor")
        
        desired_monitors = []
        for cm in configmaps:
            if cm.data:
                monitors = self.parse_monitor_config(cm.data)
                desired_monitors.extend(monitors)
        
        # Get existing monitors from Kibana
        existing_monitors = self.get_existing_monitors()
        
        # Process each desired monitor
        for monitor_config in desired_monitors:
            monitor_type = monitor_config.get('type', 'http')
            monitor_name = monitor_config.get('name', f'Monitor-{int(time.time())}')
            
            # Create appropriate monitor configuration
            if monitor_type == 'http':
                kibana_config = self.create_http_monitor(monitor_config)
            elif monitor_type == 'tcp':
                kibana_config = self.create_tcp_monitor(monitor_config)
            elif monitor_type == 'icmp':
                kibana_config = self.create_icmp_monitor(monitor_config)
            elif monitor_type == 'browser':
                kibana_config = self.create_browser_monitor(monitor_config)
            else:
                logger.warning(f"Unknown monitor type: {monitor_type}")
                continue
            
            # Check if monitor exists
            if monitor_name in existing_monitors:
                # Update existing monitor
                monitor_id = existing_monitors[monitor_name]['id']
                self.update_monitor(monitor_id, kibana_config)
            else:
                # Create new monitor
                self.create_monitor(kibana_config)
        
        # Clean up monitors that no longer exist in ConfigMaps
        desired_names = {m.get('name') for m in desired_monitors}
        for name, monitor in existing_monitors.items():
            if name not in desired_names:
                self.delete_monitor(monitor['id'], name)
        
        logger.info("Monitor sync completed")

    def run_continuous(self, interval: int = 60):
        """Run sync continuously"""
        logger.info(f"Starting continuous sync with {interval}s interval...")
        
        while True:
            try:
                self.sync_monitors()
            except Exception as e:
                logger.error(f"Sync failed: {e}")
            
            time.sleep(interval)

def main():
    sync_service = KibanaSyncService()
    
    # Check if running in continuous mode
    if os.getenv('SYNC_MODE', 'once') == 'continuous':
        interval = int(os.getenv('SYNC_INTERVAL', '60'))
        sync_service.run_continuous(interval)
    else:
        sync_service.sync_monitors()

if __name__ == '__main__':
    main()
