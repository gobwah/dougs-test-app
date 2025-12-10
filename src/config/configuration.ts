export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  logLevel: string;
  corsOrigin: string | string[];
  throttleTtl: number;
  throttleLimit: number;
}

const configuration = (): AppConfig => ({
  port: Number.parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : '*',
  throttleTtl: Number.parseInt(process.env.THROTTLE_TTL || '60', 10),
  throttleLimit: Number.parseInt(process.env.THROTTLE_LIMIT || '100', 10),
});

export default configuration;
