import request from 'supertest';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { Server } from '../server';
import { connectDB, dropTestDatabase } from '../database';

const server = new Server();
const app = server.getApp();

describe('User actions: follow, items, ratings, search friends', () => {
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

  it('should register two users and allow follow/unfollow', async () => {
    const u1 = { handle: 'alice', name: 'Alice', email: 'alice@example.com', password: 'password' };
    const u2 = { handle: 'bob', name: 'Bob', email: 'bob@example.com', password: 'password' };

    const res1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1).expect(201);
    const token1 = res1.body.token;
    const id1 = res1.body.user._id || res1.body.user.id;

    const res2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2).expect(201);
    const id2 = res2.body.user._id || res2.body.user.id;

    // follow
    const followRes = await request(app)
      .post(`/api/v1/puntualo/users/${id2}/follow`)
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);

    expect(followRes.body.follows).toBeDefined();
    expect(followRes.body.follows.map((s: any) => String(s))).toContain(String(id2));

    // unfollow
    const unf = await request(app)
      .delete(`/api/v1/puntualo/users/${id2}/follow`)
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);

    expect(unf.body.follows.map((s: any) => String(s))).not.toContain(String(id2));
  });

  it('should add and remove an item in user items list (personal list)', async () => {
    const u = { handle: 'carol', name: 'Carol', email: 'carol@example.com', password: 'password' };
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201);
    const token = reg.body.token;
    const id = reg.body.user._id || reg.body.user.id;

    const addRes = await request(app)
      .post(`/api/v1/puntualo/users/${id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ externalId: 'ext-1', itemType: 'movie', title: 'Local Movie' })
      .expect(200);

    expect(addRes.body.items).toBeDefined();
    expect(addRes.body.items.length).toBe(1);
    const subId = addRes.body.items[0]._id;

    // delete
    const delRes = await request(app)
      .delete(`/api/v1/puntualo/users/${id}/items/${subId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(delRes.body.items.length).toBe(0);
  });

  it('should add and remove a rating for user', async () => {
    const u = { handle: 'dave', name: 'Dave', email: 'dave@example.com', password: 'password' };
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201);
    const token = reg.body.token;
    const id = reg.body.user._id || reg.body.user.id;

    const rateRes = await request(app)
      .post(`/api/v1/puntualo/users/${id}/rate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 8, comment: 'Great!', itemType: 'movie' })
      .expect(200);

    expect(rateRes.body.ratedItems).toBeDefined();
    expect(rateRes.body.ratedItems.length).toBe(1);
    const ratingId = rateRes.body.ratedItems[0]._id;

    // get ratings
    const getRates = await request(app)
      .get(`/api/v1/puntualo/users/${id}/ratings`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(getRates.body)).toBe(true);
    expect(getRates.body.length).toBe(1);

    // delete rating
    const del = await request(app)
      .delete(`/api/v1/puntualo/users/${id}/ratings/${ratingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // confirm deleted
    const after = await request(app)
      .get(`/api/v1/puntualo/users/${id}/ratings`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(after.body.length).toBe(0);
  });

  it('should return paginated friends (users) list', async () => {
    // create 12 users
    for (let i = 0; i < 12; i++) {
      await request(app).post('/api/v1/puntualo/auth/register').send({
        handle: `user${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: 'password'
      }).expect(201);
    }

    // page 1
    const p1 = await request(app).get('/api/v1/puntualo/search/friends?page=1').expect(200);
    expect(p1.body.items.length).toBe(10);
    expect(p1.body.total).toBe(12);

    // page 2
    const p2 = await request(app).get('/api/v1/puntualo/search/friends?page=2').expect(200);
    expect(p2.body.items.length).toBe(2);
    expect(p2.body.page).toBe(2);
  });

  it('register and get follows (merged from follows.spec.ts)', async () => {
    const a = { handle: 'a', name: 'A', email: 'a@example.com', password: 'password' }
    const b = { handle: 'b', name: 'B', email: 'b@example.com', password: 'password' }

    const resA = await request(app).post('/api/v1/puntualo/auth/register').send(a).expect(201)
    const idA = resA.body.user._id
    const tokenA = resA.body.token

    const resB = await request(app).post('/api/v1/puntualo/auth/register').send(b).expect(201)
    const idB = resB.body.user._id

    // A follows B
    await request(app).post(`/api/v1/puntualo/users/${idB}/follow`).set('Authorization', `Bearer ${tokenA}`).expect(200)

    const follows = await request(app).get(`/api/v1/puntualo/users/${idA}/follows`).set('Authorization', `Bearer ${tokenA}`).expect(200)
    expect(Array.isArray(follows.body)).toBe(true)
    expect(follows.body.length).toBe(1)
    expect(follows.body[0].handle).toBe('b')
  })
});
