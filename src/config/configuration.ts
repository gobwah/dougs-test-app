export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  logLevel: string;
}

const configuration = (): AppConfig => ({
  port: Number.parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  logLevel: process.env.LOG_LEVEL || 'info',
});

export default configuration;
