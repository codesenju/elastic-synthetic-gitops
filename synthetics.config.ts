import type { SyntheticsConfig } from '@elastic/synthetics';

export default env => {
  const config: SyntheticsConfig = {
    params: {
      url: 'https://elastic.github.io/synthetics-demo/',
    },
    playwrightOptions: {
      ignoreHTTPSErrors: false,
    },
    /**
     * Configure global monitor settings
     */
    monitor: {
      schedule: 10,
      locations: [],
      privateLocations: ['synthetic-monitor-default'],
    },
    /**
     * Project monitors settings
     */
    project: {
      id: 'elastic-synthetic-gitops',
      url: 'https://kibana.example.com/',
      space: 'default',
    },
  };
  
  // Environment-specific overrides
  if (env === 'production') {
    config.monitor.schedule = 5; // More frequent monitoring in production
    config.params.url = process.env.PRODUCTION_URL || config.params.url;
  } else if (env === 'staging') {
    config.monitor.schedule = 15;
    config.params.url = process.env.STAGING_URL || config.params.url;
  }
  
  return config;
};
