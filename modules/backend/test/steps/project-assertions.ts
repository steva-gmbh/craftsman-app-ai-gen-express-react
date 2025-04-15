import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { response } from './api-steps';

// Then steps for project-specific validation
Then('the response should contain a list of projects', function() {
  expect(response.body).to.have.property('data');
  expect(response.body.data).to.be.an('array');
});

Then('the response should contain details of the project with ID {int}', function(id: number) {
  expect(response.body).to.have.property('id', id);
  expect(response.body).to.have.property('name');
  expect(response.body).to.have.property('description');
  expect(response.body).to.have.property('status');
  expect(response.body).to.have.property('customerId');
});

Then('the response should contain a project with name {string}', function(name: string) {
  expect(response.body).to.have.property('name', name);
});

Then('the response should contain a project with description {string}', function(description: string) {
  expect(response.body).to.have.property('description', description);
});

Then('the response should contain a project with a job that has ID {int}', function(jobId: number) {
  expect(response.body).to.have.property('jobs');
  expect(response.body.jobs).to.be.an('array');
  
  // Find the job with the specified ID
  const job = response.body.jobs.find((j: any) => j.id === jobId);
  expect(job).to.not.be.undefined;
});

Then('the response should not contain a job with ID {int}', function(jobId: number) {
  expect(response.body).to.have.property('jobs');
  expect(response.body.jobs).to.be.an('array');
  
  // Make sure the job with specified ID is not in the array
  const job = response.body.jobs.find((j: any) => j.id === jobId);
  expect(job).to.be.undefined;
}); 