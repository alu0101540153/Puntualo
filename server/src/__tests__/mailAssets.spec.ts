import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

// Covers branches in mail_assets.service.ts for missing/invalid assets
const server = new Server()
const app = server.getApp()

describe('Mail assets service', () => {
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

  it('returns 404 for missing asset path', async () => {
    const res = await request(app).get('/api/v1/puntualo/test/mail-assets/not-found.png')
    expect(res.status).toBe(404)
    // Body may be empty or contain an error message depending on static handling
    expect(res.body).toBeTypeOf('object')
  })

  it('rejects invalid extension and responds with 400/404', async () => {
    const res = await request(app).get('/api/v1/puntualo/test/mail-assets/invalid.exe')
    expect([400, 404]).toContain(res.status)
  })
})
