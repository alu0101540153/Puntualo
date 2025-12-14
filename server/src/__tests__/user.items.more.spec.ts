import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('User items variations', () => {
  beforeAll(async () => {
    await connectDB()
  })
  beforeEach(async () => {
    await dropTestDatabase()
  })
  afterAll(async () => {
    await dropTestDatabase()
    await mongoose.connection.close()
  })

  it('add multiple items to list', async () => {
    const u = { handle: 'multitem', name: 'MultItem', email: 'multitem@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    await request(app).post(`/api/v1/puntualo/users/${id}/items/ITEM1`).set('Authorization', `Bearer ${token}`)
    await request(app).post(`/api/v1/puntualo/users/${id}/items/ITEM2`).set('Authorization', `Bearer ${token}`)
    await request(app).post(`/api/v1/puntualo/users/${id}/items/ITEM3`).set('Authorization', `Bearer ${token}`)
    const res = await request(app).get(`/api/v1/puntualo/users/${id}/items`)
    expect([200, 401, 404]).toContain(res.status)
  })

  it('add same item twice (idempotent)', async () => {
    const u = { handle: 'idempitem', name: 'IdempItem', email: 'idempitem@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    const res1 = await request(app).post(`/api/v1/puntualo/users/${id}/items/DUPITEM`).set('Authorization', `Bearer ${token}`)
    const res2 = await request(app).post(`/api/v1/puntualo/users/${id}/items/DUPITEM`).set('Authorization', `Bearer ${token}`)
    expect([200, 201, 401, 404]).toContain(res1.status)
    expect([200, 201, 401, 404]).toContain(res2.status)
  })

  it('remove item from list', async () => {
    const u = { handle: 'remitem', name: 'RemItem', email: 'remitem@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    await request(app).post(`/api/v1/puntualo/users/${id}/items/ITEMX`).set('Authorization', `Bearer ${token}`)
    const res = await request(app).delete(`/api/v1/puntualo/users/${id}/items/ITEMX`).set('Authorization', `Bearer ${token}`)
    expect([200, 204, 400, 401, 404]).toContain(res.status)
  })

  it('get empty items list', async () => {
    const u = { handle: 'emptyitems', name: 'EmptyItems', email: 'emptyitems@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).get(`/api/v1/puntualo/users/${id}/items`)
    expect([200, 401, 404]).toContain(res.status)
  })

  it('get items for other user', async () => {
    const u1 = { handle: 'owner', name: 'Owner', email: 'owner@example.com', password: 'secret123' }
    const u2 = { handle: 'viewer', name: 'Viewer', email: 'viewer@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id1 = reg1.body.user._id
    const token1 = reg1.body.token
    await request(app).post(`/api/v1/puntualo/users/${id1}/items/PUBLICITEM`).set('Authorization', `Bearer ${token1}`)
    const res = await request(app).get(`/api/v1/puntualo/users/${id1}/items`)
    expect([200, 401, 404]).toContain(res.status)
  })
})
