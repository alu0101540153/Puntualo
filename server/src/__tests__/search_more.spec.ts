import request from 'supertest';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { Server } from '../server';
import { connectDB, dropTestDatabase } from '../database';

vi.mock('../services', async () => {
  const actual = await vi.importActual<any>('../services');
  const Book = { searchBooksByTitle: vi.fn(async (_t: string, _p: number) => ({ items: [], page: 1, total: 0 })), fetchBookByGoogleId: vi.fn(async (id: string) => ({ created: { googleId: id } })) };
  const Series = { searchShowsByTitle: vi.fn(async (_t: string, _p: number) => ({ items: [], page: 1, total: 0 })), fetchShowByTmdbId: vi.fn(async (id: string) => ({ created: { tmdbId: id } })) };
  return { ...actual, BookService: Book, SeriesService: Series };
});

const server = new Server();
const app = server.getApp();

describe('Search controller extended', () => {
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

  it('GET /search/books returns list', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/books?title=abc').expect(200);
    expect(res.body.items).toBeDefined();
  });

  it('POST /search/books/:googleId creates doc', async () => {
    const res = await request(app).post('/api/v1/puntualo/search/books/gg123').expect(201);
    expect(res.body.created.googleId).toBe('gg123');
  });

  it('GET /search/series returns list', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/series?title=abc').expect(200);
    expect(res.body.items).toBeDefined();
  });

  it('POST /search/series/:tmdbId creates doc', async () => {
    const res = await request(app).post('/api/v1/puntualo/search/series/999').expect(201);
    expect(res.body.created.tmdbId).toBe('999');
  });
});
