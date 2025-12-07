import { spawn, ChildProcess } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

const PROJECT_ROOT = process.cwd();
const SERVER_PORT = process.env.E2E_PORT || '3001';
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

let serverProcess: ChildProcess | null = null;

async function waitForServer(url: string, maxAttempts = 60): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404 || response.status === 400) {
        // Server is up (any HTTP response means server is responding)
        return;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not start within ${maxAttempts * 500}ms`);
}

async function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const mainPath = path.join(PROJECT_ROOT, 'dist', 'src', 'main.js');
    const buildAlreadyExists = fs.existsSync(mainPath);
    const shouldBuild =
      !buildAlreadyExists || process.env.E2E_FORCE_BUILD === 'true';

    // Build the project only if needed
    if (shouldBuild) {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
        shell: false,
      });

      buildProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Build failed with code ${code}`));
          return;
        }

        // Verify the build output exists
        if (!fs.existsSync(mainPath)) {
          reject(new Error(`Build output not found at ${mainPath}`));
          return;
        }

        startServerProcess(mainPath, resolve, reject);
      });

      buildProcess.on('error', reject);
    } else {
      // Use existing build
      console.log('[E2E Setup] Using existing build from dist/');
      startServerProcess(mainPath, resolve, reject);
    }
  });
}

function startServerProcess(
  mainPath: string,
  resolve: () => void,
  reject: (error: Error) => void,
): void {
  // Start the server
  serverProcess = spawn('node', [mainPath], {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
    env: { ...process.env, PORT: SERVER_PORT },
    shell: false,
  });

  let serverOutput = '';
  serverProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    // Only log if it's not the standard NestJS startup message
    if (!output.includes('Nest application successfully started')) {
      console.log(`[Server] ${output.trim()}`);
    }
  });

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[Server Error] ${data.toString()}`);
  });

  serverProcess.on('error', (error) => {
    reject(error);
  });

  // Wait for server to be ready
  waitForServer(SERVER_URL)
    .then(() => {
      console.log(`[E2E Setup] Server started on ${SERVER_URL}`);
      resolve();
    })
    .catch((error) => {
      console.error('Server output:', serverOutput);
      reject(error);
    });
}

async function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (serverProcess) {
      const timeout = setTimeout(() => {
        if (serverProcess) {
          serverProcess.kill('SIGKILL');
        }
        resolve();
      }, 5000);

      serverProcess.on('close', () => {
        clearTimeout(timeout);
        console.log('[E2E Teardown] Server stopped');
        resolve();
      });

      serverProcess.kill('SIGTERM');
      serverProcess = null;
    } else {
      resolve();
    }
  });
}

// Export functions for global setup/teardown
export { startServer, stopServer, SERVER_URL };

// Store server URL globally for tests
(global as any).__E2E_SERVER_URL__ = SERVER_URL;
