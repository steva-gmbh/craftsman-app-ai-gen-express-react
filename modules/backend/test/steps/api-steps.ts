import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';

// Create a simple app for testing
const app = express();
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

let response: any;

When('I make a GET request to {string}', async function (endpoint: string) {
  response = await request(app).get(endpoint);
});

Then('I should receive a {int} status code', function (statusCode: number) {
  expect(response.status).to.equal(statusCode);
});

Then('the response should contain {string} with value {string}', function (field: string, value: string) {
  expect(response.body[field]).to.equal(value);
}); 