Feature: Project Management
  As a user of the CraftsmanApp
  I want to perform CRUD operations on projects
  So that I can manage project information effectively

  Background:
    Given the API is running
    And the database is reset for project tests

  Scenario: List all projects
    When I make a GET request to "/api/projects"
    Then I should receive a 200 status code
    And the response should contain a list of projects
    And the response should include pagination information

  Scenario: Get a specific project
    Given there is a project with ID 1 in the database
    When I make a GET request to "/api/projects/1"
    Then I should receive a 200 status code
    And the response should contain details of the project with ID 1

  Scenario: Get a non-existent project
    When I make a GET request to "/api/projects/999"
    Then I should receive a 404 status code
    And the response should contain "error" with value "Project not found"

  Scenario: Create a new project
    Given there is a customer with ID 1 in the database
    When I make a POST request to "/api/projects" with the following data:
      | name           | description                   | status     | budget   | startDate   | endDate     | customerId |
      | Test Project   | This is a test project        | active     | 15000.00 | 2023-06-01  | 2023-12-31  | 1          |
    Then I should receive a 201 status code
    And the response should contain a project with name "Test Project"
    And the response should contain a project with description "This is a test project"

  Scenario: Update an existing project
    Given there is a project with ID 1 in the database
    When I make a PUT request to "/api/projects/1" with the following data:
      | name               | description                     | status   | budget     | startDate   | endDate     | customerId |
      | Updated Project    | This project has been updated   | completed| 25000.00   | 2023-07-01  | 2023-11-30  | 1          |
    Then I should receive a 200 status code
    And the response should contain a project with name "Updated Project"
    And the response should contain a project with description "This project has been updated"

  Scenario: Delete a project
    Given there is a project with ID 2 in the database
    When I make a DELETE request to "/api/projects/2"
    Then I should receive a 204 status code
    When I make a GET request to "/api/projects/2"
    Then I should receive a 404 status code

  Scenario: Add a job to a project
    Given there is a project with ID 1 in the database
    And there is a job for project testing with ID 1 in the database
    When I make a POST request to "/api/projects/1/jobs" with the following data:
      | jobId |
      | 1     |
    Then I should receive a 200 status code
    And the response should contain a project with a job that has ID 1

  Scenario: Remove a job from a project
    Given there is a project with ID 1 in the database with a job ID 2
    When I make a DELETE request to "/api/projects/1/jobs/2"
    Then I should receive a 200 status code
    And the response should not contain a job with ID 2 