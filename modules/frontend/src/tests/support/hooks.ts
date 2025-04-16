// @ts-nocheck
const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const { CustomWorld } = require('./custom-world');

let frontendProcess;

// Start the frontend server before all tests if AUTO_START_FRONTEND=true
BeforeAll(async function() {
  if (process.env.AUTO_START_FRONTEND === 'true') {
    console.log('Starting frontend server for tests...');
    frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(), // Current working directory
      stdio: 'pipe',
      shell: true
    });
    
    // Give the server time to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Frontend server started');
    
    // Log any server output for debugging
    frontendProcess.stdout.on('data', (data) => {
      console.log(`Frontend server: ${data}`);
    });
    
    frontendProcess.stderr.on('data', (data) => {
      console.error(`Frontend server error: ${data}`);
    });
  }
});

// Stop the frontend server after all tests
AfterAll(async function() {
  if (frontendProcess) {
    console.log('Stopping frontend server...');
    frontendProcess.kill();
    console.log('Frontend server stopped');
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