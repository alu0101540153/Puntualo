import request from 'supertest';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { Server } from '../server';
import { connectDB, dropTestDatabase } from '../database';
import { itemService, userService } from '../services';

const server = new Server();
const app = server.getApp();

describe('User / Feed flow (integration) - local MongoDB (TEST)', () => {
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

  // Register two users using the auth API
  it('registers two users via auth endpoint', async () => {
    const aPayload = { handle: 'usera', name: 'User A', email: 'a@example.com', password: 'secretA' };
    const aRes = await request(app).post('/api/v1/puntualo/auth/register').send(aPayload).expect(201);
    expect(aRes.body).toHaveProperty('user');

    const bPayload = { handle: 'userb', name: 'User B', email: 'b@example.com', password: 'secretB' };
    const bRes = await request(app).post('/api/v1/puntualo/auth/register').send(bPayload).expect(201);
    expect(bRes.body).toHaveProperty('user');
  });

  // Add a rated item to a user via the API. Do not create an Item document.
  it('adds a rated item to a user (service) and verifies it exists', async () => {
    const bPayload = { handle: 'userb2', name: 'User B2', email: 'b2@example.com', password: 'secretB' };
    const bRes = await request(app).post('/api/v1/puntualo/auth/register').send(bPayload).expect(201);
    const userB = bRes.body.user;

    const itemPayload = { itemType: 'book', score: 8, comment: 'Great book', itemData: { externalId: 'ext-bb1', title: 'B Book 1', author: 'Author B' } };
    const token = bRes.body.token;
    await request(app).post('/api/v1/puntualo/item').set('Authorization', `Bearer ${token}`).send(itemPayload).expect(200);

    const getB = await request(app).get(`/api/v1/puntualo/users/${userB._id}`).expect(200);
    const rated = getB.body.ratedItems || [];
    expect(rated.length).toBe(1);
    expect(rated[0].itemData.externalId).toBe('ext-bb1');

    const found = await itemService.findByExternalId('ext-bb1');
    expect(found).toBeNull();
  });

  // Follow a user and check the feed shows their rated item
  it('user A follows user B and sees the rated book in the feed', async () => {
    const aPayload = { handle: 'usera3', name: 'User A3', email: 'a3@example.com', password: 'secretA' };
    const aRes = await request(app).post('/api/v1/puntualo/auth/register').send(aPayload).expect(201);
    const userA = aRes.body.user;

    const bPayload = { handle: 'userb3', name: 'User B3', email: 'b3@example.com', password: 'secretB' };
    const bRes = await request(app).post('/api/v1/puntualo/auth/register').send(bPayload).expect(201);
    const userB = bRes.body.user;

    const tokenB = bRes.body.token;
    const itemPayload = { itemType: 'book', score: 7, comment: 'Nice', itemData: { externalId: 'ext-fb1', title: 'Feed Book', author: 'Author FB' } };
    await request(app).post('/api/v1/puntualo/item').set('Authorization', `Bearer ${tokenB}`).send(itemPayload).expect(200);

    await userService.addFollow(userA._id, userB._id);

    const feedRes = await request(app).get(`/api/v1/puntualo/users/${userA._id}/feed`).expect(200);
    expect(feedRes.body).toBeDefined();
    expect(Array.isArray(feedRes.body.items)).toBe(true);
    expect(feedRes.body.items.length).toBe(1);
    expect(feedRes.body.items[0].item.itemData ? feedRes.body.items[0].item.itemData.externalId : feedRes.body.items[0].item.externalId).toBe('ext-fb1');
  });

  // Edit a rating and then remove it by external id
  it('edits a rating and then removes it', async () => {
    const bPayload = { handle: 'userb4', name: 'User B4', email: 'b4@example.com', password: 'secretB' };
    const bRes = await request(app).post('/api/v1/puntualo/auth/register').send(bPayload).expect(201);
    const userB = bRes.body.user;

    const tokenB = bRes.body.token;
    const payload = { itemType: 'book', score: 6, comment: 'Okay', itemData: { externalId: 'ext-edit-1', title: 'Edit Book', author: 'Author E' } };
    await request(app).post('/api/v1/puntualo/item').set('Authorization', `Bearer ${tokenB}`).send(payload).expect(200);

    const editPayload = { itemType: 'book', score: 9, comment: 'Great now', itemData: { externalId: 'ext-edit-1' } };
    await request(app).post('/api/v1/puntualo/item').set('Authorization', `Bearer ${tokenB}`).send(editPayload).expect(200);

    const getB = await request(app).get(`/api/v1/puntualo/users/${userB._id}`).expect(200);
    const rated = getB.body.ratedItems || [];
    expect(rated.some((r: any) => r.score === 9)).toBe(true);

    await userService.unrateByExternalId(userB._id, 'ext-edit-1');
    const after = await request(app).get(`/api/v1/puntualo/users/${userB._id}`).expect(200);
    expect((after.body.ratedItems || []).length).toBe(0);
  });

  // Test following and unfollowing a user
  it('allows follow and unfollow operations', async () => {
    const aPayload = { handle: 'usera5', name: 'User A5', email: 'a5@example.com', password: 'secretA' };
    const aRes = await request(app).post('/api/v1/puntualo/auth/register').send(aPayload).expect(201);
    const userA = aRes.body.user;

    const bPayload = { handle: 'userb5', name: 'User B5', email: 'b5@example.com', password: 'secretB' };
    const bRes = await request(app).post('/api/v1/puntualo/auth/register').send(bPayload).expect(201);
    const userB = bRes.body.user;

    await userService.addFollow(userA._id, userB._id);
    let getA = await request(app).get(`/api/v1/puntualo/users/${userA._id}`).expect(200);
    expect((getA.body.follows || []).some((f: any) => String(f) === String(userB._id))).toBe(true);

    await userService.removeFollow(userA._id, userB._id);
    getA = await request(app).get(`/api/v1/puntualo/users/${userA._id}`).expect(200);
    expect((getA.body.follows || []).some((f: any) => String(f) === String(userB._id))).toBe(false);
  });

  // Create an Item document via the service and then delete it
  it('creates and deletes an item via service', async () => {
    const bPayload = { handle: 'userb6', name: 'User B6', email: 'b6@example.com', password: 'secretB' };
    const bRes = await request(app).post('/api/v1/puntualo/auth/register').send(bPayload).expect(201);
    const userB = bRes.body.user;

    const tmp = await itemService.create({ itemType: 'book', title: 'To Delete' }, userB._id);
    const tmpId = String(tmp._id);
    const deleted = await itemService.delete(tmpId, userB._id);
    expect(deleted).toBeTruthy();
  });

  // Check feed is ordered newest first by rating date
  it('returns feed ordered by rating date (lastModified)', async () => {
    const aPayload = { handle: 'follower', name: 'Follower', email: 'follower@example.com', password: 'pwd123' };
    const aRes = await request(app).post('/api/v1/puntualo/auth/register').send(aPayload).expect(201);
    const follower = aRes.body.user;

    const user1Payload = { handle: 'u1', name: 'User1', email: 'u1@example.com', password: 'pwd123' };
    const u1Res = await request(app).post('/api/v1/puntualo/auth/register').send(user1Payload).expect(201);
    const u1 = u1Res.body.user;

    const user2Payload = { handle: 'u2', name: 'User2', email: 'u2@example.com', password: 'pwd123' };
    const u2Res = await request(app).post('/api/v1/puntualo/auth/register').send(user2Payload).expect(201);
    const u2 = u2Res.body.user;

    const token1 = u1Res.body.token;
    const token2 = u2Res.body.token;
    const book1Payload = { itemType: 'book', score: 5, itemData: { externalId: 'old-book-ext', title: 'Old Book' } };
    await request(app).post('/api/v1/puntualo/item').set('Authorization', `Bearer ${token1}`).send(book1Payload).expect(200);

    const book2Payload = { itemType: 'book', score: 9, itemData: { externalId: 'new-book-ext', title: 'New Book' } };
    await request(app).post('/api/v1/puntualo/item').set('Authorization', `Bearer ${token2}`).send(book2Payload).expect(200);

    await userService.addFollow(follower._id, u1._id);
    await userService.addFollow(follower._id, u2._id);

    const feedRes = await request(app).get(`/api/v1/puntualo/users/${follower._id}/feed`).expect(200);
    const items = feedRes.body.items || [];
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0].item.itemData ? items[0].item.itemData.externalId : items[0].item.externalId).toBe('new-book-ext');
    expect(items[1].item.itemData ? items[1].item.itemData.externalId : items[1].item.externalId).toBe('old-book-ext');
  });
});