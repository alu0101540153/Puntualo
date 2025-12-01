import request from 'supertest'
import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('User endpoints (follow/items/ratings)', () => {
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

  it('follow and unfollow flow', async () => {
  const a = { handle: 'ua', name: 'UA', email: 'ua@example.com', password: 'secret123' }
  const b = { handle: 'ub', name: 'UB', email: 'ub@example.com', password: 'secret123' }

    const ra = await request(app).post('/api/v1/puntualo/auth/register').send(a).expect(201)
    const rb = await request(app).post('/api/v1/puntualo/auth/register').send(b).expect(201)
    const tokenA = ra.body.token
    const idB = rb.body.user._id

    const follow = await request(app).post(`/api/v1/puntualo/users/${idB}/follow`).set('Authorization', `Bearer ${tokenA}`).expect(200)
    expect(follow.body.follows).toBeDefined()

    const unf = await request(app).delete(`/api/v1/puntualo/users/${idB}/follow`).set('Authorization', `Bearer ${tokenA}`).expect(200)
    expect(unf.body.follows).toBeDefined()
  })

  it('add and remove item in user list', async () => {
  const u = { handle: 'uc', name: 'UC', email: 'uc@example.com', password: 'secret123' }
    const r = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    const token = r.body.token
    const id = r.body.user._id

    const add = await request(app).post(`/api/v1/puntualo/users/${id}/items`).set('Authorization', `Bearer ${token}`).send({ externalId: 'x1', itemType: 'movie', title: 'X' }).expect(200)
    expect(add.body.items.length).toBe(1)

    const subId = add.body.items[0]._id
    const del = await request(app).delete(`/api/v1/puntualo/users/${id}/items/${subId}`).set('Authorization', `Bearer ${token}`).expect(200)
    expect(del.body.items.length).toBe(0)
  })

  it('add/get/delete ratings', async () => {
  const u = { handle: 'ud', name: 'UD', email: 'ud@example.com', password: 'secret123' }
    const r = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    const token = r.body.token
    const id = r.body.user._id

    const rate = await request(app).post(`/api/v1/puntualo/users/${id}/rate`).set('Authorization', `Bearer ${token}`).send({ score: 7, itemType: 'movie' }).expect(200)
    expect(rate.body.ratedItems.length).toBe(1)
    const ratingId = rate.body.ratedItems[0]._id

    const get = await request(app).get(`/api/v1/puntualo/users/${id}/ratings`).set('Authorization', `Bearer ${token}`).expect(200)
    expect(get.body.length).toBe(1)

    await request(app).delete(`/api/v1/puntualo/users/${id}/ratings/${ratingId}`).set('Authorization', `Bearer ${token}`).expect(200)
    const after = await request(app).get(`/api/v1/puntualo/users/${id}/ratings`).set('Authorization', `Bearer ${token}`).expect(200)
    expect(after.body.length).toBe(0)
  })

  it('change password with correct current password', async () => {
    const u = { handle: 'pwuser', name: 'PW User', email: 'pw@example.com', password: 'oldpass123' }
    const r = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    const token = r.body.token
    const id = r.body.user._id

    // Cambiar contraseña con la contraseña actual correcta
    const update = await request(app)
      .patch(`/api/v1/puntualo/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'oldpass123',
        newPassword: 'newpass456'
      })
      .expect(200)
    
    expect(update.body).toBeDefined()

    // Intentar login con la nueva contraseña
    const login = await request(app)
      .post('/api/v1/puntualo/auth/login')
      .send({ email: 'pw@example.com', password: 'newpass456' })
      .expect(200)
    
    expect(login.body.token).toBeDefined()
  })

  it('reject password change with incorrect current password', async () => {
    const u = { handle: 'pwuser2', name: 'PW User 2', email: 'pw2@example.com', password: 'oldpass123' }
    const r = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    const token = r.body.token
    const id = r.body.user._id

    // Intentar cambiar contraseña con contraseña actual incorrecta
    const update = await request(app)
      .patch(`/api/v1/puntualo/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrongpassword',
        newPassword: 'newpass456'
      })
      .expect(401)
    
    expect(update.body.message).toContain('contraseña')
  })
})
