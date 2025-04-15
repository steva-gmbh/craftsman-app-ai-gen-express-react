// @ts-nocheck
const { Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { CustomWorld } = require('./custom-world');

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