import { vi } from 'vitest'
import axios from 'axios'
import mongoose from 'mongoose'
import request from 'supertest'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

vi.mock('axios')
const mockedAxios = axios as unknown as { post: vi.Mock }

describe('Mail template service via /test/send-template', () => {
  beforeAll(async () => {
    await connectDB()
  })

  beforeEach(async () => {
    await dropTestDatabase()
    vi.resetAllMocks()
  })

  afterAll(async () => {
    await dropTestDatabase()
    await mongoose.connection.close()
  })

  it('returns 202 when no API key configured (skipped send)', async () => {
    // ensure no API key at module load time for the mail service
    delete process.env.SENDGRID_API_KEY
    // clear module cache so service modules re-read environment variables
    vi.resetModules()
    // create server AFTER env change so mail_template.service reads current env
    const server = new (await import('../server')).Server()
    const app = server.getApp()

    const res = await request(app).post('/api/v1/puntualo/test/send-template').send({ to: 'x@y.z', templateId: 't1' }).expect(202)
    expect(res.body.message).toBeDefined()
  })

  it('calls axios.post when API key is set', async () => {
    // set API key before instantiating server so service reads it
    process.env.SENDGRID_API_KEY = 'key'
    mockedAxios.post = vi.fn().mockResolvedValue({ status: 202, data: {} })
    vi.resetModules()
    const server = new (await import('../server')).Server()
    const app = server.getApp()

    const res = await request(app).post('/api/v1/puntualo/test/send-template').send({ to: 'x@y.z', templateId: 't1' }).expect(202)
    expect(mockedAxios.post).toHaveBeenCalled()
  })
})
