import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/custom-world';

Given('I am a user', async function(this: ICustomWorld) {
  // This step doesn't require any specific action
  console.log('User is ready to interact with the application');
});

When('I navigate to the homepage', async function(this: ICustomWorld) {
  if (!this.page) throw new Error('Page is not defined');
  // Navigate to the application homepage
  await this.page.goto('http://localhost:5173/');
});

Then('I should see the application title', async function(this: ICustomWorld) {
  if (!this.page) throw new Error('Page is not defined');
  // Check that the title is present on the page
  const title = await this.page.title();
  expect(title).not.toBe('');
  
  // Additional check for a visible element that should be on the homepage
  // Adjust the selector based on your actual application
  const appContent = await this.page.isVisible('main');
  expect(appContent).toBeTruthy();
}); 