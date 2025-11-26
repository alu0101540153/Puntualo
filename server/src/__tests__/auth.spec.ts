import request from 'supertest'
import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Auth endpoints', () => {
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

  it('registers and returns token & user (no password)', async () => {
    const u = { handle: 'auth1', name: 'Auth One', email: 'auth1@example.com', password: 'secret123' }
    const res = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user).toBeDefined()
    expect(res.body.user.password).toBeUndefined()
  })

  it('rejects duplicate email with 409', async () => {
    const u = { handle: 'auth2', name: 'Auth Two', email: 'auth2@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    const res = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(409)
    const field = res.body.field || (res.body.errors && res.body.errors[0] && res.body.errors[0].field)
    expect(field).toBe('email')
  })

  it('allows login with correct password and rejects wrong password', async () => {
    const u = { handle: 'auth3', name: 'Auth Three', email: 'auth3@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)

  const good = await request(app).post('/api/v1/puntualo/auth/login').send({ email: u.email, password: 'secret123' }).expect(200)
    expect(good.body.token).toBeDefined()

    await request(app).post('/api/v1/puntualo/auth/login').send({ email: u.email, password: 'wrong' }).expect(401)
  })
})
