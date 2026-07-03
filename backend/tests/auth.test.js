/**
 * Integration tests for authentication and role-based access control.
 */
const request = require('supertest');
const app = require('../src/app');
const { sequelize, Employee } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await Employee.create({
    name: 'Test Manager',
    email: 'mgr@test.com',
    password: 'Secret123!',
    department: 'QA',
    role: 'manager',
  });
  await Employee.create({
    name: 'Test Employee',
    email: 'emp@test.com',
    password: 'Secret123!',
    department: 'QA',
    role: 'employee',
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials and returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'emp@test.com', password: 'Secret123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined(); // never leaked
  });

  it('rejects invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'emp@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 on validation failure', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('RBAC', () => {
  it('blocks employees from manager-only routes with 403', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'emp@test.com', password: 'Secret123!' });
    const token = login.body.data.accessToken;

    const res = await request(app)
      .get('/api/manager/stats/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('rejects requests without a token with 401', async () => {
    const res = await request(app).get('/api/leaves');
    expect(res.status).toBe(401);
  });
});
