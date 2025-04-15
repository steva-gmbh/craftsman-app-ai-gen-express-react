import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { response } from './api-steps';

// Then steps for settings-specific validation
Then('the response should contain a list of settings', function() {
  expect(Array.isArray(response.body)).to.be.true;
  expect(response.body.length).to.be.greaterThan(0);
});

Then('the response should contain settings for user with ID {int}', function(userId: number) {
  expect(response.body).to.have.property('userId', userId);
  expect(response.body).to.have.property('profile');
  expect(response.body).to.have.property('business');
  expect(response.body).to.have.property('notifications');
  expect(response.body).to.have.property('appearance');
  expect(response.body).to.have.property('pagination');
});

Then('the response should contain settings with profile name {string}', function(name: string) {
  const profile = JSON.parse(response.body.profile);
  expect(profile).to.have.property('name', name);
});

Then('the response should contain settings with business name {string}', function(businessName: string) {
  const business = JSON.parse(response.body.business);
  expect(business).to.have.property('name', businessName);
});

Then('the response should contain settings with theme {string}', function(theme: string) {
  const appearance = JSON.parse(response.body.appearance);
  expect(appearance).to.have.property('theme', theme);
}); 