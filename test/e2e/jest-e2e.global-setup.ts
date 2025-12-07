// Global setup for e2e tests - starts the server before all tests
import { startServer } from './jest-e2e.setup';

export default async function globalSetup(): Promise<void> {
  console.log('[E2E Global Setup] Starting server...');
  await startServer();
  console.log('[E2E Global Setup] Server started successfully');
}
