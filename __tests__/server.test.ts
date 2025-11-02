import request from 'supertest';
import createApp from '../src/index';

describe('sysinfo API', () => {
  const app = createApp();

  it('returns system information at /api/v1/sysinfo', async () => {
    const res = await request(app).get('/api/v1/sysinfo');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cpu');
    expect(res.body).toHaveProperty('system');
    expect(res.body).toHaveProperty('mem');
    expect(res.body).toHaveProperty('os');
  });

  it('returns 404 on unknown path', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
  });
});
