import configuration from '../../../src/config/configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default values when no environment variables are set', () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.API_PREFIX;
    delete process.env.LOG_LEVEL;

    const config = configuration();

    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('development');
    expect(config.apiPrefix).toBe('api');
    expect(config.logLevel).toBe('info');
  });

  it('should use PORT environment variable', () => {
    process.env.PORT = '8080';

    const config = configuration();

    expect(config.port).toBe(8080);
  });

  it('should use NODE_ENV environment variable', () => {
    process.env.NODE_ENV = 'production';

    const config = configuration();

    expect(config.nodeEnv).toBe('production');
  });

  it('should use API_PREFIX environment variable', () => {
    process.env.API_PREFIX = 'v1';

    const config = configuration();

    expect(config.apiPrefix).toBe('v1');
  });

  it('should use LOG_LEVEL environment variable', () => {
    process.env.LOG_LEVEL = 'debug';

    const config = configuration();

    expect(config.logLevel).toBe('debug');
  });

  it('should parse PORT as integer', () => {
    process.env.PORT = '3001';

    const config = configuration();

    expect(config.port).toBe(3001);
    expect(typeof config.port).toBe('number');
  });

  it('should handle all environment variables together', () => {
    process.env.PORT = '5000';
    process.env.NODE_ENV = 'staging';
    process.env.API_PREFIX = 'api/v2';
    process.env.LOG_LEVEL = 'warn';

    const config = configuration();

    expect(config.port).toBe(5000);
    expect(config.nodeEnv).toBe('staging');
    expect(config.apiPrefix).toBe('api/v2');
    expect(config.logLevel).toBe('warn');
  });
});
