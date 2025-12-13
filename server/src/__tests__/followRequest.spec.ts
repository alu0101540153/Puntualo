import request from 'supertest';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { Server } from '../server';
import { connectDB, dropTestDatabase } from '../database';

vi.mock('../services', async () => {
  const actual = await vi.importActual<any>('../services');
  const mock = {
    // Controller calls create(fromId, targetId)
    create: vi.fn(async (fromId: string, targetId: string) => ({ _id: 'fr1', fromId, targetId, status: 'pending' })),
    // Controller uses getPendingRequests(userId) and getSentRequests(userId)
    getPendingRequests: vi.fn(async (userId: string) => [
      { _id: 'fr1', fromId: 'someone', targetId: userId, status: 'pending' },
    ]),
    getSentRequests: vi.fn(async (userId: string) => [
      { _id: 'fr1', fromId: userId, targetId: 'other', status: 'pending' },
    ]),
    // Controller uses accept(id, userId) and reject(id, userId)
    accept: vi.fn(async (id: string, userId: string) => ({ _id: id, approvedBy: userId, status: 'approved' })),
    reject: vi.fn(async (id: string, userId: string) => ({ _id: id, deniedBy: userId, status: 'denied' })),
    cancel: vi.fn(async (id: string, userId: string) => ({ _id: id, canceledBy: userId, status: 'canceled' })),
  };
  return { ...actual, followRequestService: mock };
});

const server = new Server();
const app = server.getApp();

async function registerToken(email: string) {
  const u = { handle: email.split('@')[0], name: 'User', email, password: 'secret123' };
  const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201);
  return reg.body.token as string;
}

describe('FollowRequest endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await dropTestDatabase();
  });

  afterAll(async () => {
    await dropTestDatabase();
    await mongoose.connection.close();
  });

  it('create and list follow requests', async () => {
    const t1 = await registerToken('a@example.com');
    const t2 = await registerToken('b@example.com');
    const me = await request(app).post('/api/v1/puntualo/auth/login').send({ email: 'a@example.com', password: 'secret123' }).expect(200);
    const userId = me.body.user._id;

    const resCreate = await request(app)
      .post('/api/v1/puntualo/follow-requests')
      .set('Authorization', `Bearer ${t1}`)
      // targetId value is arbitrary because service is mocked
      .send({ targetId: 'u2' })
      .expect(200);
    expect(resCreate.body.status).toBe('pending');

    const resListPending = await request(app)
      .get('/api/v1/puntualo/follow-requests/pending')
      .set('Authorization', `Bearer ${t1}`)
      .expect(200);
    expect(Array.isArray(resListPending.body)).toBe(true);

    const resListSent = await request(app)
      .get('/api/v1/puntualo/follow-requests/sent')
      .set('Authorization', `Bearer ${t1}`)
      .expect(200);
    expect(Array.isArray(resListSent.body)).toBe(true);
  });

  it('approve and deny follow request', async () => {
    const t1 = await registerToken('c@example.com');
    await registerToken('d@example.com');

    const resApprove = await request(app)
      .put('/api/v1/puntualo/follow-requests/fr1/accept')
      .set('Authorization', `Bearer ${t1}`)
      .expect(200);
    expect(resApprove.body.status).toBe('approved');

    const resDeny = await request(app)
      .put('/api/v1/puntualo/follow-requests/fr1/reject')
      .set('Authorization', `Bearer ${t1}`)
      .expect(200);
    expect(resDeny.body.status).toBe('denied');
  });
});
