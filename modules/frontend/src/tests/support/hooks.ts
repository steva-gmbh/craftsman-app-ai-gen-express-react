import { Before, After } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { ICustomWorld } from './custom-world';

// Launch a browser before each scenario
Before(async function(this: ICustomWorld) {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

// Close the browser after each scenario
After(async function(this: ICustomWorld) {
  if (this.browser) {
    await this.browser.close();
  }
}); 