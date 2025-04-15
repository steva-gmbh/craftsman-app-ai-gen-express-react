import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { response } from './api-steps';

// Then steps for material-specific validation
Then('the response should contain a list of materials', function() {
  expect(response.body).to.have.property('data');
  expect(response.body.data).to.be.an('array');
});

Then('the response should contain details of the material with ID {int}', function(id: number) {
  expect(response.body).to.have.property('id', id);
  expect(response.body).to.have.property('name');
  expect(response.body).to.have.property('category');
  expect(response.body).to.have.property('unit');
  expect(response.body).to.have.property('costPerUnit');
});

Then('the response should contain a material with name {string}', function(name: string) {
  expect(response.body).to.have.property('name', name);
});

Then('the response should contain a material with category {string}', function(category: string) {
  expect(response.body).to.have.property('category', category);
}); 