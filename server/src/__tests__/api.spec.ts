import request from 'supertest';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { Server } from '../server';
import { connectDB, dropTestDatabase } from '../database';

const server = new Server();
const app = server.getApp();

describe('API basics and items/auth/test route', () => {
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

  it('GET / should return name and status', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.body.name).toBeDefined();
    expect(res.body.status).toBeDefined();
  });

  it('register duplicate email should return 409', async () => {
    const u = { handle: 'dup', name: 'Dup', email: 'dup@example.com', password: 'secret123' };
    await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201);
  const res = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(409);
  // support both response shapes: { field: 'email' } or { errors: [{ field: 'email' }] }
  const field = res.body.field || (res.body.errors && res.body.errors[0] && res.body.errors[0].field)
  expect(field).toBe('email');
  });

  it('login with wrong password returns 401', async () => {
    const u = { handle: 'log', name: 'Log', email: 'log@example.com', password: 'secret123' };
    await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201);
    await request(app).post('/api/v1/puntualo/auth/login').send({ email: u.email, password: 'wrong' }).expect(401);
  });

  it('item CRUD lifecycle works with auth', async () => {
    const u = { handle: 'ituser', name: 'ItUser', email: 'it@example.com', password: 'secret123' };
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201);
    const token = reg.body.token;

    // create item
    const item = { itemType: 'movie', title: 'Test Movie' };
    const createRes = await request(app).post('/api/v1/puntualo/item').set('Authorization', `Bearer ${token}`).send(item).expect(200);
    expect(createRes.body._id).toBeDefined();
    const itemId = createRes.body._id;

    // get all
    const all = await request(app).get('/api/v1/puntualo/item').expect(200);
    expect(Array.isArray(all.body)).toBe(true);
    expect(all.body.length).toBe(1);

    // get by id
    const byId = await request(app).get(`/api/v1/puntualo/item/${itemId}`).expect(200);
    expect(byId.body.title).toBe('Test Movie');

    // update
    await request(app).patch(`/api/v1/puntualo/item/${itemId}`).set('Authorization', `Bearer ${token}`).send({ title: 'Updated Movie' }).expect(200);
    const afterUpd = await request(app).get(`/api/v1/puntualo/item/${itemId}`).expect(200);
    expect(afterUpd.body.title).toBe('Updated Movie');

    // delete
    await request(app).delete(`/api/v1/puntualo/item/${itemId}`).set('Authorization', `Bearer ${token}`).expect(200);
    await request(app).get(`/api/v1/puntualo/item/${itemId}`).expect(404);
  });

  it('test/send-template returns 202 when to+templateId present', async () => {
    const res = await request(app).post('/api/v1/puntualo/test/send-template').send({ to: 'a@b.com', templateId: 'tpl-1' }).expect(202);
    expect(res.body.message).toBeDefined();
  });

});
