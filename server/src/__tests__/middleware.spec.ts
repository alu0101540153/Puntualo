import request from 'supertest'
import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Middleware: verifyToken & checkOwnership', () => {
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

  it('returns 401 for protected route without token', async () => {
    await request(app).post('/api/v1/puntualo/item').send({ itemType: 'movie', title: 'X' }).expect(401)
  })

  it('returns 403 when user tries to modify another user (checkOwnership)', async () => {
    const a = { handle: 'm1', name: 'M1', email: 'm1@example.com', password: 'secret123' }
    const b = { handle: 'm2', name: 'M2', email: 'm2@example.com', password: 'secret123' }

    const resA = await request(app).post('/api/v1/puntualo/auth/register').send(a).expect(201)
    const tokenA = resA.body.token
    const idA = resA.body.user._id

    const resB = await request(app).post('/api/v1/puntualo/auth/register').send(b).expect(201)
    const idB = resB.body.user._id

    // A tries to patch B -> forbidden
    await request(app).patch(`/api/v1/puntualo/users/${idB}`).set('Authorization', `Bearer ${tokenA}`).send({ name: 'Hacked' }).expect(403)
  })
})
