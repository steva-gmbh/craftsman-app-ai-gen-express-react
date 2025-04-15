Feature: Job Management

  As a user of the CraftsmanApp
  I want to perform CRUD operations on jobs
  So that I can manage job information effectively

  Background:
    Given the API is running
    And the database is reset for job tests
    And there is a customer with ID 1 in the database

  Scenario: List all jobs
    When I make a GET request to "/api/jobs"
    Then I should receive a 200 status code
    And the response should contain a list of jobs
    And the response should include pagination information

  Scenario: Get a specific job
    Given there is a job with ID 1 in the database
    When I make a GET request to "/api/jobs/1"
    Then I should receive a 200 status code
    And the response should contain details of the job with ID 1

  Scenario: Get a non-existent job
    When I make a GET request to "/api/jobs/999"
    Then I should receive a 404 status code
    And the response should contain "error" with value "Job not found"

  Scenario: Create a new job
    When I make a POST request to "/api/jobs" with the following data:
      | title         | description             | status   | price  | customerId |
      | Test Job      | A test job for testing  | pending  | 250.00 | 1          |
    Then I should receive a 201 status code
    And the response should contain a job with title "Test Job"
    And the response should contain a job with status "pending"

  Scenario: Update an existing job
    Given there is a job with ID 1 in the database
    When I make a PUT request to "/api/jobs/1" with the following data:
      | title          | description         | status      | price  | customerId |
      | Updated Job    | An updated job      | in_progress | 350.00 | 1          |
    Then I should receive a 200 status code
    And the response should contain a job with title "Updated Job"
    And the response should contain a job with status "in_progress"

  Scenario: Delete a job
    Given there is a job with ID 2 in the database
    When I make a DELETE request to "/api/jobs/2"
    Then I should receive a 204 status code
    When I make a GET request to "/api/jobs/2"
    Then I should receive a 404 status code
    
  Scenario: Add a material to a job
    Given there is a job with ID 1 in the database
    And there is a material with ID 1 in the database
    When I make a POST request to "/api/jobs/1/materials" with the following data:
      | materialId | amount |
      | 1          | 5.5    |
    Then I should receive a 201 status code
    And the response should contain a job-material with materialId 1
    
  Scenario: Add a tool to a job
    Given there is a job with ID 1 in the database
    And there is a tool with ID 1 in the database
    When I make a POST request to "/api/jobs/1/tools" with the following data:
      | toolId | amount |
      | 1      | 2      |
    Then I should receive a 201 status code
    And the response should contain a job-tool with toolId 1 