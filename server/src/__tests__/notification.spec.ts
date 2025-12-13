import request from 'supertest';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { Server } from '../server';
import { connectDB, dropTestDatabase } from '../database';

// Mock notificationService from services to isolate controller behavior
vi.mock('../services', async () => {
  const actual = await vi.importActual<any>('../services');
  const mock = {
    getAll: vi.fn(async (_userId: string, unreadOnly?: boolean) => {
      const base = [
        { _id: 'n1', userId: 'u1', type: 'info', read: false },
        { _id: 'n2', userId: 'u1', type: 'warn', read: true },
      ];
      return unreadOnly ? base.filter(n => !n.read) : base;
    }),
    getUnread: vi.fn(async (_userId: string) => [{ _id: 'n1', read: false }]),
    countUnread: vi.fn(async (_userId: string) => 1),
    markAsRead: vi.fn(async (id: string, _userId: string) => ({ _id: id, read: true })),
    markAllAsRead: vi.fn(async (_userId: string) => ({ updated: 2 })),
    delete: vi.fn(async (id: string, _userId: string) => ({ deleted: id })),
  }
  return { ...actual, notificationService: mock };
});

const server = new Server();
const app = server.getApp();

async function registerAndLogin() {
  const u = { handle: 'notif', name: 'Notif', email: 'notif@example.com', password: 'secret123' };
  const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201);
  return reg.body.token as string;
}

describe('Notification endpoints', () => {
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

  it('GET /notifications returns all (and unreadOnly when set)', async () => {
    const token = await registerAndLogin();
    const res1 = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', `Bearer ${token}`).expect(200);
    expect(Array.isArray(res1.body)).toBe(true);
    const res2 = await request(app).get('/api/v1/puntualo/notifications?unreadOnly=true').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res2.body.every((n: any) => !n.read)).toBe(true);
  });

  it('GET /notifications/unread returns only unread', async () => {
    const token = await registerAndLogin();
    const res = await request(app).get('/api/v1/puntualo/notifications/unread').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /notifications/count returns count', async () => {
    const token = await registerAndLogin();
    const res = await request(app).get('/api/v1/puntualo/notifications/count').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.count).toBe(1);
  });

  it('PUT /notifications/mark-all-read marks all as read', async () => {
    const token = await registerAndLogin();
    const res = await request(app).put('/api/v1/puntualo/notifications/mark-all-read').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.updated).toBeDefined();
  });

  it('PUT /notifications/:id/read marks one as read', async () => {
    const token = await registerAndLogin();
    const res = await request(app).put('/api/v1/puntualo/notifications/n1/read').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.read).toBe(true);
  });

  it('DELETE /notifications/:id deletes one', async () => {
    const token = await registerAndLogin();
    const res = await request(app).delete('/api/v1/puntualo/notifications/n2').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.deleted).toBe('n2');
  });
});
