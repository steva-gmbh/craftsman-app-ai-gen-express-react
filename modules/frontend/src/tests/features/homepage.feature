Feature: Homepage
  As a user
  I want to visit the homepage
  So that I can use the application

  Scenario: User visits the homepage
    Given I am a user
    When I navigate to the homepage
    Then I should see the application title
