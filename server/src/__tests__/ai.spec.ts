import request from 'supertest';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { Server } from '../server';
import { connectDB, dropTestDatabase } from '../database';

vi.mock('../services', async () => {
  const actual = await vi.importActual<any>('../services');
  const mock = {
    generateRecommendation: vi.fn(async (_input: any) => ({ items: [{ title: 'AI Rec 1' }] })),
    summarize: vi.fn(async (_text: string) => ({ summary: 'ok' })),
  };
  return { ...actual, aiService: mock };
});

const server = new Server();
const app = server.getApp();

describe('AI controller endpoints', () => {
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

  it('returns recommendations with type+genre', async () => {
    const res = await request(app)
      .get('/api/v1/puntualo/ai/recommendations')
      .query({ type: 'movie', genre: 'comedia', limit: 2 })
      .expect(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('chat returns fallback or local reply', async () => {
    const res = await request(app)
      .post('/api/v1/puntualo/ai/chat')
      .send({ message: 'Hola, recomiendame peliculas de comedia' })
      .expect(200);
    expect(typeof res.body.reply).toBe('string');
  });

    it('returns 400 when missing params on recommendations', async () => {
      const res = await request(app).get('/api/v1/puntualo/ai/recommendations')
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })

    it('chat uses LOCAL_MODEL path when enabled', async () => {
      vi.resetModules()
      vi.doMock('../services/ai.service', () => ({
        askLocalModel: vi.fn(async () => ({ content: 'Hola desde local', model: 'local' })),
        askRemoteModel: vi.fn(async () => ({ content: 'remote', model: 'remote' })),
        isLocalEnabled: () => true
      }))
      const { Server: ServerRe } = await import('../server')
      const app2 = new ServerRe().getApp()
      const res = await request(app2).post('/api/v1/puntualo/ai/chat').send({ message: 'Hola' })
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('reply')
    })
});
