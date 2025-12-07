// Global teardown for e2e tests
// This ensures the server is stopped even if tests fail
import { stopServer } from './jest-e2e.setup';

export default async function globalTeardown(): Promise<void> {
  console.log('[E2E Global Teardown] Stopping server...');
  await stopServer();
  console.log('[E2E Global Teardown] Server stopped');
}
