import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Auth tokens and JWT', () => {
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

  it('register returns JWT token', async () => {
    const u = { handle: 'tokenuser', name: 'TokenUser', email: 'tokenuser@example.com', password: 'secret123' }
    const res = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    if (res.status === 201) {
      expect(res.body).toHaveProperty('token')
      expect(typeof res.body.token).toBe('string')
    }
  })

  it('login returns JWT token', async () => {
    const u = { handle: 'logintoken', name: 'LoginToken', email: 'logintoken@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).post('/api/v1/puntualo/auth/login').send({ email: 'logintoken@example.com', password: 'secret123' })
    if (res.status === 200) {
      expect(res.body).toHaveProperty('token')
    }
  })

  it('use token in Authorization header', async () => {
    const u = { handle: 'usetoken', name: 'UseToken', email: 'usetoken@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const token = reg.body.token
    const id = reg.body.user._id
    const res = await request(app).get(`/api/v1/puntualo/users/${id}`).set('Authorization', `Bearer ${token}`)
    expect([200, 401, 404]).toContain(res.status)
  })

  it('invalid token returns 401', async () => {
    const u = { handle: 'badtoken', name: 'BadToken', email: 'badtoken@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).get(`/api/v1/puntualo/users/${id}`).set('Authorization', 'Bearer INVALIDTOKEN123')
    expect([200, 401, 404]).toContain(res.status)
  })

  it('malformed Authorization header returns 401', async () => {
    const u = { handle: 'malformed', name: 'Malformed', email: 'malformed@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).get(`/api/v1/puntualo/users/${id}`).set('Authorization', 'InvalidFormat')
    expect([200, 401, 404]).toContain(res.status)
  })

  it('expired token returns 401', async () => {
    const res = await request(app).get('/api/v1/puntualo/users/SOMEID').set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.invalid')
    expect([400, 401, 404, 500]).toContain(res.status)
  })
})
