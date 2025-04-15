# Backend Testing Setup

This directory contains the testing setup for the CraftsmanApp backend. We use a combination of Jest for unit tests and Cucumber.js for behavior-driven development (BDD) tests with Gherkin syntax.

## Directory Structure

- `features/`: Contains Gherkin feature files (.feature) that describe application behavior
- `steps/`: Contains step definitions that implement the steps in the feature files
- `support/`: Contains support files, such as hooks and world setup
- `unit/`: Contains Jest unit tests

## Running Tests

Run all tests:
```
npm run test:all
```

Run only Jest tests:
```
npm test
```

Run only Cucumber tests:
```
npm run test:cucumber
```

## Writing Tests

### Unit Tests (Jest)

Unit tests are written using Jest and are located in the `test/unit` directory. Example:

```typescript
import request from 'supertest';
import app from '../../src/app';

describe('API Endpoint', () => {
  it('should return expected data', async () => {
    const response = await request(app).get('/endpoint');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```

### BDD Tests (Cucumber)

BDD tests are written using Gherkin syntax in `.feature` files located in the `test/features` directory. Example:

```gherkin
Feature: User Authentication
  As a user
  I want to log in to the application
  So that I can access my account

  Scenario: Successful login
    Given I have a valid username and password
    When I submit the login form
    Then I should be redirected to the dashboard
    And I should see a welcome message
```

Step definitions that implement these steps are located in the `test/steps` directory.

## Configuration Files

- `jest.config.js`: Jest configuration
- `cucumber.js`: Cucumber.js configuration
- `tsconfig.test.json`: TypeScript configuration for tests 