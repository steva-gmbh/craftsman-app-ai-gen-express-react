import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'chai';
import request from 'supertest';
import { app } from '../support/test-app';

// Export for other steps to use
export let response: any;

// Given steps
Given('the API is running', function() {
  // Already setup with Express app
});

// When steps
When('I make a GET request to {string}', async function(endpoint: string) {
  response = await request(app).get(endpoint);
});

When('I make a POST request to {string} with the following data:', async function(endpoint: string, dataTable: DataTable) {
  const data = dataTable.hashes()[0]; // Get the first row of data
  response = await request(app).post(endpoint).send(data);
});

When('I make a PUT request to {string} with the following data:', async function(endpoint: string, dataTable: DataTable) {
  const data = dataTable.hashes()[0]; // Get the first row of data
  response = await request(app).put(endpoint).send(data);
});

When('I make a DELETE request to {string}', async function(endpoint: string) {
  response = await request(app).delete(endpoint);
});

// Then steps
Then('I should receive a {int} status code', function(statusCode: number) {
  expect(response.status).to.equal(statusCode);
});

Then('the response should contain {string} with value {string}', function(field: string, value: string) {
  expect(response.body[field]).to.equal(value);
}); 