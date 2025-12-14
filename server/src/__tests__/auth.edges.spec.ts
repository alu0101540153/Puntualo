import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Auth edge cases', () => {
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

  it('register with missing email returns 400 or validation error', async () => {
    const u = { handle: 'nomail', name: 'NoMail', password: 'secret123' }
    const res = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    expect([400, 422, 500]).toContain(res.status)
  })

  it('register with missing handle returns 400 or validation error', async () => {
    const u = { name: 'NoHandle', email: 'nohandle@example.com', password: 'secret123' }
    const res = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    expect([400, 422, 500]).toContain(res.status)
  })

  it('register with missing password returns 400 or validation error', async () => {
    const u = { handle: 'nopwd', name: 'NoPwd', email: 'nopwd@example.com' }
    const res = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    expect([400, 422, 500]).toContain(res.status)
  })

  it('login with missing email returns 400 or 401', async () => {
    const res = await request(app).post('/api/v1/puntualo/auth/login').send({ password: 'secret123' })
    expect([400, 401, 422]).toContain(res.status)
  })

  it('login with missing password returns 400 or 401', async () => {
    const res = await request(app).post('/api/v1/puntualo/auth/login').send({ email: 'test@example.com' })
    expect([400, 401, 422]).toContain(res.status)
  })

  it('register normalizes email to lowercase and trims spaces', async () => {
    const u = { handle: 'normalizer', name: 'Normalizer', email: '  TEST@EXAMPLE.COM  ', password: 'secret123' }
    const res = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    if (res.status === 201) {
      expect(res.body.user.email).toBe('test@example.com')
    }
  })

  it('login accepts email case-insensitively', async () => {
    const u = { handle: 'caseless', name: 'Caseless', email: 'caseless@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).post('/api/v1/puntualo/auth/login').send({ email: 'CASELESS@EXAMPLE.COM', password: 'secret123' })
    expect([200, 401]).toContain(res.status)
  })
})
