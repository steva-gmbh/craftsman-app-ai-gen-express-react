Feature: Material Management

  As a user of the CraftsmanApp
  I want to perform CRUD operations on materials
  So that I can manage material information effectively

  Background:
    Given the API is running
    And the database is reset for material tests

  Scenario: List all materials
    When I make a GET request to "/api/materials"
    Then I should receive a 200 status code
    And the response should contain a list of materials
    And the response should include pagination information

  Scenario: Get a specific material
    Given there is a material with ID 1 in the database
    When I make a GET request to "/api/materials/1"
    Then I should receive a 200 status code
    And the response should contain details of the material with ID 1

  Scenario: Get a non-existent material
    When I make a GET request to "/api/materials/999"
    Then I should receive a 404 status code
    And the response should contain "error" with value "Material not found"

  Scenario: Create a new material
    When I make a POST request to "/api/materials" with the following data:
      | name           | category | description               | unit | costPerUnit | stock | minStock |
      | Test Material  | Paint    | A test material for tests | kg   | 10.50       | 100   | 20       |
    Then I should receive a 201 status code
    And the response should contain a material with name "Test Material"
    And the response should contain a material with category "Paint"

  Scenario: Update an existing material
    Given there is a material with ID 1 in the database
    When I make a PUT request to "/api/materials/1" with the following data:
      | name             | category | description         | unit | costPerUnit | stock | minStock | location   |
      | Updated Material | Wood     | An updated material | m    | 15.75       | 50    | 10       | Warehouse B|
    Then I should receive a 200 status code
    And the response should contain a material with name "Updated Material"
    And the response should contain a material with category "Wood"

  Scenario: Delete a material
    Given there is a material with ID 2 in the database
    When I make a DELETE request to "/api/materials/2"
    Then I should receive a 204 status code
    When I make a GET request to "/api/materials/2"
    Then I should receive a 404 status code 