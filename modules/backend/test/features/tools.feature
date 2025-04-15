Feature: Tool Management
  As a user of the CraftsmanApp
  I want to perform CRUD operations on tools
  So that I can manage tool information effectively

  Background:
    Given the API is running
    And the database is reset for tool tests

  Scenario: List all tools
    When I make a GET request to "/api/tools"
    Then I should receive a 200 status code
    And the response should contain a list of tools
    And the response should include pagination information

  Scenario: Get a specific tool
    Given there is a tool with ID 1 in the database
    When I make a GET request to "/api/tools/1"
    Then I should receive a 200 status code
    And the response should contain details of the tool with ID 1

  Scenario: Get a non-existent tool
    When I make a GET request to "/api/tools/999"
    Then I should receive a 404 status code
    And the response should contain "error" with value "Tool not found"

  Scenario: Create a new tool
    When I make a POST request to "/api/tools" with the following data:
      | name         | category      | description                   | brand  | model      |
      | Test Tool    | Hand Tools    | A test tool for testing       | TestCo | Tester 1.0 |
    Then I should receive a 201 status code
    And the response should contain a tool with name "Test Tool"
    And the response should contain a tool with category "Hand Tools"

  Scenario: Update an existing tool
    Given there is a tool with ID 1 in the database
    When I make a PUT request to "/api/tools/1" with the following data:
      | name              | category      | description                   | brand      | model      | location      |
      | Updated Tool      | Power Tools   | An updated test tool          | UpdatedCo  | Updated 2.0 | Tool Cabinet |
    Then I should receive a 200 status code
    And the response should contain a tool with name "Updated Tool"
    And the response should contain a tool with category "Power Tools"

  Scenario: Delete a tool
    Given there is a tool with ID 2 in the database
    When I make a DELETE request to "/api/tools/2"
    Then I should receive a 204 status code
    When I make a GET request to "/api/tools/2"
    Then I should receive a 404 status code 