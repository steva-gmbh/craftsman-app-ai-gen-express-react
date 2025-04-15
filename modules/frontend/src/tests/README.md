# Frontend Testing with Cucumber.js and Playwright

This directory contains end-to-end tests for the frontend application using Cucumber.js for BDD-style tests and Playwright for browser automation.

## Directory Structure

- `features/`: Contains Gherkin feature files describing test scenarios
- `step_definitions/`: Contains TypeScript implementation of the steps
- `support/`: Contains support files such as world definition and hooks

## Running Tests

To run all tests:

```bash
npm test
```

To generate an HTML report:

```bash
npm run test:generate-report
```

To debug tests:

```bash
npm run test:debug
```

## Writing Tests

### 1. Create a Feature File

Create a new `.feature` file in the `features/` directory with Gherkin syntax:

```gherkin
Feature: Feature Name
  As a user
  I want to do something
  So that I can achieve some goal

  Scenario: Example Scenario
    Given some precondition
    When I do some action
    Then I should see some result
```

### 2. Implement Step Definitions

Create a new `.ts` file in the `step_definitions/` directory to implement the steps:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/custom-world';

Given('some precondition', async function(this: ICustomWorld) {
  // Implementation
});

When('I do some action', async function(this: ICustomWorld) {
  // Implementation
});

Then('I should see some result', async function(this: ICustomWorld) {
  // Implementation using assertions
  expect(true).toBeTruthy();
});
```

### 3. Run the Tests

Run the tests using one of the commands mentioned above. 