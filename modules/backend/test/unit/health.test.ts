import express from 'express';
import request from 'supertest';

// Create a simple app just for testing
const app = express();
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

describe('Health Endpoint', () => {
  it('should return status code 200 and status OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
}); 