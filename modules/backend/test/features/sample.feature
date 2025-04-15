Feature: API Endpoints
  As a user
  I want to interact with the API
  So that I can manage my data

  Scenario: Health check endpoint
    When I make a GET request to "/health"
    Then I should receive a 200 status code
    And the response should contain "status" with value "ok" 