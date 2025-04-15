import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { response } from './api-steps';

// Then steps for vehicle-specific validation
Then('the response should contain a list of vehicles', function() {
  expect(response.body).to.have.property('data');
  expect(response.body.data).to.be.an('array');
});

Then('the response should contain details of the vehicle with ID {int}', function(id: number) {
  expect(response.body).to.have.property('id', id);
  expect(response.body).to.have.property('name');
  expect(response.body).to.have.property('make');
  expect(response.body).to.have.property('model');
  expect(response.body).to.have.property('year');
  expect(response.body).to.have.property('type');
});

Then('the response should contain a vehicle with name {string}', function(name: string) {
  expect(response.body).to.have.property('name', name);
});

Then('the response should contain a vehicle with make {string}', function(make: string) {
  expect(response.body).to.have.property('make', make);
}); 