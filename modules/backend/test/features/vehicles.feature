Feature: Vehicle Management
  As a user of the CraftsmanApp
  I want to perform CRUD operations on vehicles
  So that I can manage vehicle information effectively

  Background:
    Given the API is running
    And the database is reset for vehicle tests

  Scenario: List all vehicles
    When I make a GET request to "/api/vehicles"
    Then I should receive a 200 status code
    And the response should contain a list of vehicles
    And the response should include pagination information

  Scenario: Get a specific vehicle
    Given there is a vehicle with ID 1 in the database
    When I make a GET request to "/api/vehicles/1"
    Then I should receive a 200 status code
    And the response should contain details of the vehicle with ID 1

  Scenario: Get a non-existent vehicle
    When I make a GET request to "/api/vehicles/999"
    Then I should receive a 404 status code
    And the response should contain "error" with value "Vehicle not found"

  Scenario: Create a new vehicle
    When I make a POST request to "/api/vehicles" with the following data:
      | name         | make   | model    | year | type  | licensePlate | color  |
      | Test Vehicle | Toyota | Corolla  | 2023 | sedan | TEST-123     | Silver |
    Then I should receive a 201 status code
    And the response should contain a vehicle with name "Test Vehicle"
    And the response should contain a vehicle with make "Toyota"

  Scenario: Update an existing vehicle
    Given there is a vehicle with ID 1 in the database
    When I make a PUT request to "/api/vehicles/1" with the following data:
      | name              | make    | model       | year | type   | licensePlate | color  | mileage |
      | Updated Vehicle   | Honda   | Civic       | 2022 | sedan  | UPD-456      | Blue   | 15000   |
    Then I should receive a 200 status code
    And the response should contain a vehicle with name "Updated Vehicle"
    And the response should contain a vehicle with make "Honda"

  Scenario: Delete a vehicle
    Given there is a vehicle with ID 2 in the database
    When I make a DELETE request to "/api/vehicles/2"
    Then I should receive a 204 status code
    When I make a GET request to "/api/vehicles/2"
    Then I should receive a 404 status code 