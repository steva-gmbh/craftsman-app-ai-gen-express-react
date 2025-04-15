Feature: User Settings Management
  As a user of the CraftsmanApp
  I want to manage my application settings
  So that I can customize my experience

  Background:
    Given the API is running
    And the database is reset for settings tests

  Scenario: List all settings
    Given user 1 has settings in the database
    And user 2 has settings in the database
    When I make a GET request to "/api/settings"
    Then I should receive a 200 status code
    And the response should contain a list of settings

  Scenario: Get settings for a specific user
    Given user 1 has settings in the database
    When I make a GET request to "/api/settings/1"
    Then I should receive a 200 status code
    And the response should contain settings for user with ID 1

  Scenario: Create default settings for a user without existing settings
    Given there is a user with ID 3 in the database
    When I make a GET request to "/api/settings/3"
    Then I should receive a 200 status code
    And the response should contain settings for user with ID 3

  Scenario: Creating new settings
    Given there is a user with ID 4 in the database
    When I make a POST request to "/api/settings" with the following data:
      | userId | profile                                                           | business                                               | notifications                           | appearance                      | pagination                        |
      | 4      | {"name":"New User 4","email":"new4@example.com"}                | {"name":"New Business","services":["Service 1"]}      | {"email":true,"sms":false}            | {"theme":"dark"}               | {"rowsPerPage":15}               |
    Then I should receive a 201 status code
    And the response should contain settings for user with ID 4
    And the response should contain settings with profile name "New User 4"
    And the response should contain settings with business name "New Business"
    And the response should contain settings with theme "dark"

  Scenario: Updating existing settings
    Given user 1 has settings in the database
    When I make a PUT request to "/api/settings/1" with the following data:
      | profile                                                           | appearance            | business                                             |
      | {"name":"Updated User 1","email":"updated1@example.com"}         | {"theme":"dark"}     | {"name":"Updated Business","services":["Service X"]} |
    Then I should receive a 200 status code
    And the response should contain settings for user with ID 1
    And the response should contain settings with profile name "Updated User 1"
    And the response should contain settings with business name "Updated Business"
    And the response should contain settings with theme "dark"

  Scenario: Deleting settings
    Given user 2 has settings in the database
    When I make a DELETE request to "/api/settings/2"
    Then I should receive a 204 status code
    When I make a GET request to "/api/settings/2"
    Then I should receive a 200 status code
    And the response should contain settings for user with ID 2
    # Note: In this app, settings will be recreated with defaults if they don't exist

  Scenario: Getting settings for a non-existent user
    When I make a GET request to "/api/settings/999"
    Then I should receive a 404 status code
    And the response should contain "error" with value "User not found" 