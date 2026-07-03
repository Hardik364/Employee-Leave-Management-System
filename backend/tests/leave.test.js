/**
 * Integration tests for the leave lifecycle:
 * apply -> manager approves, plus ownership/validation guards.
 */
const request = require('supertest');
const app = require('../src/app');
const { sequelize, Employee } = require('../src/models');

let employeeToken;
let managerToken;

const login = (email) =>
  request(app).post('/api/auth/login').send({ email, password: 'Secret123!' });

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await Employee.create({
    name: 'Mgr', email: 'm@test.com', password: 'Secret123!', role: 'manager', department: 'QA',
  });
  await Employee.create({
    name: 'Emp', email: 'e@test.com', password: 'Secret123!', role: 'employee', department: 'QA',
  });

  employeeToken = (await login('e@test.com')).body.data.accessToken;
  managerToken = (await login('m@test.com')).body.data.accessToken;
});

afterAll(async () => {
  await sequelize.close();
});

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Leave lifecycle', () => {
  let leaveId;

  it('lets an employee apply for leave', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .set(auth(employeeToken))
      .send({
        leaveType: 'casual',
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        reason: 'Family event',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    leaveId = res.body.data.id;
  });

  it('validates the leave payload (end before start)', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .set(auth(employeeToken))
      .send({ leaveType: 'sick', startDate: '2026-09-05', endDate: '2026-09-01', reason: 'x' });

    expect(res.status).toBe(400);
  });

  it('lets an employee edit their pending leave', async () => {
    const res = await request(app)
      .put(`/api/leaves/${leaveId}`)
      .set(auth(employeeToken))
      .send({ reason: 'Updated reason' });

    expect(res.status).toBe(200);
    expect(res.body.data.reason).toBe('Updated reason');
  });

  it('shows the request in the manager pending list', async () => {
    const res = await request(app)
      .get('/api/manager/pending-leaves')
      .set(auth(managerToken));

    expect(res.status).toBe(200);
    expect(res.body.data.some((l) => l.id === leaveId)).toBe(true);
  });

  it('lets a manager approve the request', async () => {
    const res = await request(app)
      .put(`/api/manager/leaves/${leaveId}/approve`)
      .set(auth(managerToken))
      .send({ managerComments: 'Approved' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('approved');
  });

  it('prevents editing a non-pending leave', async () => {
    const res = await request(app)
      .put(`/api/leaves/${leaveId}`)
      .set(auth(employeeToken))
      .send({ reason: 'too late' });

    expect(res.status).toBe(400);
  });

  it('requires comments when rejecting', async () => {
    const created = await request(app)
      .post('/api/leaves')
      .set(auth(employeeToken))
      .send({ leaveType: 'sick', startDate: '2026-10-01', endDate: '2026-10-02', reason: 'Flu' });

    const res = await request(app)
      .put(`/api/manager/leaves/${created.body.data.id}/reject`)
      .set(auth(managerToken))
      .send({});

    expect(res.status).toBe(400);
  });
});
