import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'
import request from 'supertest'

const server = new Server()
const app = server.getApp()

describe('Mail edges: template/assets fallbacks', () => {
  beforeAll(async () => {
    await connectDB()
  })
  afterAll(async () => {
    await dropTestDatabase()
  })

  it('template endpoint returns 202 with missing API key', async () => {
    await request(app)
      .post('/api/v1/puntualo/test/send-template')
      .send({ to: 'z@z.z', templateId: 'unknown' })
      .expect(202)
  })

  it('assets endpoint missing asset returns 404-ish', async () => {
    const res = await request(app)
      .get('/api/v1/puntualo/test/mail-assets/missing.png')
    expect([404,400].includes(res.status)).toBe(true)
  })
})
