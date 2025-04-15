Feature: Login
  As a user
  I want to login to the application
  So that I can access protected resources

  Scenario: Login page exists
    When I navigate to the login page
    Then I should see the login page URL

  Scenario: User can navigate back to homepage from login
    Given I am at the login page
    When I go to the homepage
    Then I should see the homepage URL

  Scenario: User can login with valid credentials
    Given I am at the login page
    When I enter "test@example.com" as email
    And I enter "password123" as password
    And I click the sign in button
    Then I should be successfully logged in
    And I should see the homepage URL
    
  Scenario: User cannot login with invalid credentials
    Given I am at the login page
    When I enter "wrong@example.com" as email
    And I enter "wrongpassword" as password
    And I click the sign in button
    Then I should see an error message 