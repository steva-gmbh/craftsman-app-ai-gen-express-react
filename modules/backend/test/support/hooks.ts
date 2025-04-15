import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';

// Set up global hooks before all tests
BeforeAll(async function() {
  // Global setup like database setup or server startup
  console.log('Starting test suite');
});

// Cleanup after all tests
AfterAll(async function() {
  // Global teardown like closing database connections
  console.log('Finishing test suite');
});

// Setup before each scenario
Before(async function(scenario) {
  console.log(`Starting scenario: ${scenario.pickle.name}`);
  // Setup for each test, like resetting test data
});

// Cleanup after each scenario
After(async function(scenario) {
  console.log(`Finishing scenario: ${scenario.pickle.name} with status: ${scenario.result?.status}`);
  // Cleanup for each test, like clearing test data
}); 