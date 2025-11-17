// import request from 'supertest';
// import mongoose from 'mongoose';
// import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
// import { Server } from '../server';
// import { connectDB, dropTestDatabase } from '../database';

// const server = new Server();
// const app = server.getApp();

// describe('Item API (integration) - local MongoDB (TEST)', () => {
//   beforeAll(async () => {
//     // connectDB usará .env.test cuando NODE_ENV=test (el script de npm lo define)
//     await connectDB();
//   });

//   beforeEach(async () => {
//     await dropTestDatabase();
//   });

//   afterAll(async () => {
//     await dropTestDatabase();
//     await mongoose.connection.close();
//   });

//   it('POST /api/v1/puntualo/item should create an item', async () => {
//     const payload = {
//       itemType: 'movie',
//       title: 'Local Test Movie',
//       data: { description: 'A movie for local DB tests' }
//     };

//     const res = await request(app)
//       .post('/api/v1/puntualo/item')
//       .send(payload)
//       .expect(200);

//     expect(res.body).toHaveProperty('_id');
//     expect(res.body.title).toBe(payload.title);
//   });

//   it('GET /api/v1/puntualo/item should return created items', async () => {
//     const payload = {
//       itemType: 'movie',
//       title: 'Local Another Test Movie'
//     };

//     await request(app).post('/api/v1/puntualo/item').send(payload).expect(200);

//     const res = await request(app)
//       .get('/api/v1/puntualo/item')
//       .expect(200);

//     expect(Array.isArray(res.body)).toBe(true);
//     expect(res.body.length).toBeGreaterThanOrEqual(1);
//   });
// });
