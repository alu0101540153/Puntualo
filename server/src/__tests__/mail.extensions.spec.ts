import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Mail assets extensions handling', () => {
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

  it('rejects .svg extension with 404 or 400', async () => {
    const res = await request(app).get('/api/v1/puntualo/test/mail-assets/image.svg')
    expect([400, 404]).toContain(res.status)
  })

  it('rejects .zip extension with 404 or 400', async () => {
    const res = await request(app).get('/api/v1/puntualo/test/mail-assets/file.zip')
    expect([400, 404]).toContain(res.status)
  })

  it('rejects path with subdirectories with 404 or 400', async () => {
    const res = await request(app).get('/api/v1/puntualo/test/mail-assets/subdir/file.png')
    expect([400, 404]).toContain(res.status)
  })

  it('rejects path traversal attempts with 404 or 400', async () => {
    const res = await request(app).get('/api/v1/puntualo/test/mail-assets/../../../etc/passwd')
    expect([400, 404]).toContain(res.status)
  })
})
