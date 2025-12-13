import request from 'supertest';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { Server } from '../server';
import { connectDB, dropTestDatabase } from '../database';
import { UserModel, ItemModel } from '../models';
import { ItemType } from '../models/enums';

const server = new Server();
const app = server.getApp();

describe('Stats endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await dropTestDatabase();
    // seed: two items and one user with ratings
    const movie = await ItemModel.create({ itemType: ItemType.MOVIE, title: 'M1' });
    const book = await ItemModel.create({ itemType: ItemType.BOOK, title: 'B1' });
    await UserModel.create({
      name: 'StatsUser', handle: 'stats', email: 'stats@example.com', password: 'x',
      ratedItems: [
        { itemId: movie._id, itemType: ItemType.MOVIE, score: 4, lastModified: new Date() },
        { itemId: book._id, itemType: ItemType.BOOK, score: 5, lastModified: new Date() }
      ]
    } as any);
  });

  afterAll(async () => {
    await dropTestDatabase();
    await mongoose.connection.close();
  });

  it('GET /stats returns aggregate counts', async () => {
    const res = await request(app).get('/api/v1/puntualo/stats').expect(200);
    expect(typeof res.body.users).toBe('number');
    expect(typeof res.body.reviews).toBe('number');
    expect(typeof res.body.movies).toBe('number');
    expect(typeof res.body.books).toBe('number');
    expect(res.body.source).toBe('db');
    expect(typeof res.body.checkedAt).toBe('string');
  });

  it('GET /stats/top-rated returns cached facet lists', async () => {
    const res = await request(app).get('/api/v1/puntualo/stats/top-rated').expect(200);
    expect(res.body.source).toBe('cache');
    expect(res.body.data).toBeDefined();
    expect(res.body.data.movies).toBeDefined();
    expect(Array.isArray(res.body.data.movies)).toBe(true);
  });

  it('GET /stats/all returns combined cached payload', async () => {
    const res = await request(app).get('/api/v1/puntualo/stats/all').expect(200);
    expect(res.body.source).toBe('cache');
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.totalUsers).toBe('number');
    expect(typeof res.body.data.totalRatings).toBe('number');
    expect(res.body.data.top).toBeDefined();
  });
});
