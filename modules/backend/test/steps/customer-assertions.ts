import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { response } from './api-steps';

// Then steps for customer-specific validation
Then('the response should contain a list of customers', function() {
  expect(response.body).to.have.property('data');
  expect(response.body.data).to.be.an('array');
});

Then('the response should include pagination information', function() {
  expect(response.body).to.have.property('totalCount');
  expect(response.body).to.have.property('totalPages');
  expect(response.body).to.have.property('currentPage');
  expect(response.body).to.have.property('limit');
});

Then('the response should contain details of the customer with ID {int}', function(id: number) {
  expect(response.body).to.have.property('id', id);
  expect(response.body).to.have.property('name');
  expect(response.body).to.have.property('email');
});

Then('the response should contain a customer with name {string}', function(name: string) {
  expect(response.body).to.have.property('name', name);
});

Then('the response should contain a customer with email {string}', function(email: string) {
  expect(response.body).to.have.property('email', email);
}); 