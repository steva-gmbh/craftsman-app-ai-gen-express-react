Feature: Customer Management
  As a user of the CraftsmanApp
  I want to perform CRUD operations on customers
  So that I can manage customer information effectively

  Background:
    Given the API is running
    And the database is reset for customer tests

  Scenario: List all customers
    When I make a GET request to "/api/customers"
    Then I should receive a 200 status code
    And the response should contain a list of customers
    And the response should include pagination information

  Scenario: Get a specific customer
    Given there is a customer with ID 1 in the database
    When I make a GET request to "/api/customers/1"
    Then I should receive a 200 status code
    And the response should contain details of the customer with ID 1

  Scenario: Get a non-existent customer
    When I make a GET request to "/api/customers/999"
    Then I should receive a 404 status code
    And the response should contain "error" with value "Customer not found"

  Scenario: Create a new customer
    When I make a POST request to "/api/customers" with the following data:
      | name          | email               | phone        | address                   |
      | Test Customer | test@customer.com   | 555-123-4567 | 123 Test St, Testville    |
    Then I should receive a 201 status code
    And the response should contain a customer with name "Test Customer"
    And the response should contain a customer with email "test@customer.com"

  Scenario: Update an existing customer
    Given there is a customer with ID 1 in the database
    When I make a PUT request to "/api/customers/1" with the following data:
      | name              | email                   | phone        | address                   |
      | Updated Customer  | updated@customer.com    | 555-987-6543 | 456 Update Ave, Updateville |
    Then I should receive a 200 status code
    And the response should contain a customer with name "Updated Customer"
    And the response should contain a customer with email "updated@customer.com"

  Scenario: Delete a customer
    Given there is a customer with ID 2 in the database
    When I make a DELETE request to "/api/customers/2"
    Then I should receive a 204 status code
    When I make a GET request to "/api/customers/2"
    Then I should receive a 404 status code
