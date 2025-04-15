import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { response } from './api-steps';

// Then steps for job-specific validation
Then('the response should contain a list of jobs', function() {
  expect(response.body).to.have.property('data');
  expect(response.body.data).to.be.an('array');
});

Then('the response should contain details of the job with ID {int}', function(id: number) {
  expect(response.body).to.have.property('id', id);
  expect(response.body).to.have.property('title');
  expect(response.body).to.have.property('description');
  expect(response.body).to.have.property('status');
  expect(response.body).to.have.property('customerId');
});

Then('the response should contain a job with title {string}', function(title: string) {
  expect(response.body).to.have.property('title', title);
});

Then('the response should contain a job with status {string}', function(status: string) {
  expect(response.body).to.have.property('status', status);
});

Then('the response should contain a job-material with materialId {int}', function(materialId: number) {
  expect(response.body).to.have.property('materialId', materialId);
  expect(response.body).to.have.property('jobId');
  expect(response.body).to.have.property('amount');
});

Then('the response should contain a job-tool with toolId {int}', function(toolId: number) {
  expect(response.body).to.have.property('toolId', toolId);
  expect(response.body).to.have.property('jobId');
  expect(response.body).to.have.property('amount');
}); 