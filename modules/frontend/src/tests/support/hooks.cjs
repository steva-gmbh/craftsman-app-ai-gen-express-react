const { Before, After, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fetch = require('node-fetch');

// Extend the default timeout for hooks and steps (30 seconds)
setDefaultTimeout(30 * 1000);

let server;
let frontendStarted = false;
const shouldAutoStartFrontend = process.env.AUTO_START_FRONTEND === 'true';
const FRONTEND_URL = 'http://localhost:5173';
const MAX_RETRY_TIME = 20000; // Maximum time to wait for server in milliseconds
const POLL_INTERVAL = 500; // Check every 500ms

// Helper function to check if the server is available
async function isServerAvailable() {
  try {
    const response = await fetch(FRONTEND_URL, { method: 'HEAD', timeout: 1000 });
    return response.status < 500; // Any response that's not a server error
  } catch (error) {
    return false;
  }
}

// Helper function to poll the server until it's available or timeout is reached
async function waitForServer(timeout = MAX_RETRY_TIME) {
  const startTime = Date.now();
  let serverAvailable = false;
  
  while (!serverAvailable && Date.now() - startTime < timeout) {
    serverAvailable = await isServerAvailable();
    if (serverAvailable) {
      return true;
    }
    // Wait a bit before trying again
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
  
  return serverAvailable;
}

// Start the frontend server before any tests run
BeforeAll(async function() {
  if (!shouldAutoStartFrontend) {
    console.log('Auto-start frontend is disabled. Tests will use an existing server if available.');
    return;
  }
  
  console.log('Starting frontend server for tests...');
  
  // Determine the path to the frontend directory
  const frontendDir = path.resolve(__dirname, '../../../');
  
  try {
    // Start the frontend server with "npm run dev" command
    server = spawn('npm', ['run', 'dev'], {
      cwd: frontendDir,
      shell: true,
      detached: true,
      stdio: 'ignore' // Don't pipe output to avoid cluttering test output
    });
    
    // Poll the server until it's available
    console.log('Waiting for frontend server to initialize...');
    const serverReady = await waitForServer();
    
    if (serverReady) {
      frontendStarted = true;
      console.log('Frontend server started for testing');
    } else {
      console.error('Timed out waiting for frontend server to start');
      throw new Error('Frontend server failed to start within the timeout period');
    }
  } catch (error) {
    console.error('Failed to start frontend server:', error);
    throw error;
  }
});

// Stop the frontend server after all tests have run
AfterAll(async function() {
  if (server && frontendStarted && shouldAutoStartFrontend) {
    console.log('Shutting down frontend server...');
    
    // Kill the server process and all child processes
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', server.pid, '/f', '/t'], { shell: true });
    } else {
      process.kill(-server.pid, 'SIGINT');
    }
    
    frontendStarted = false;
    console.log('Frontend server shut down');
  }
});

// Launch a browser before each scenario
Before(async function() {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

// Close the browser after each scenario
After(async function() {
  if (this.browser) {
    await this.browser.close();
  }
}); 