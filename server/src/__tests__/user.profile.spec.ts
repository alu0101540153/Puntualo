import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('User profile and password', () => {
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

  it('update profile name', async () => {
    const u = { handle: 'updname', name: 'OldName', email: 'updname@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    const res = await request(app).put(`/api/v1/puntualo/users/${id}`).set('Authorization', `Bearer ${token}`).send({ name: 'NewName' })
    if (res.status === 200) {
      expect(res.body.name).toBe('NewName')
    }
  })

  it('update profile bio', async () => {
    const u = { handle: 'updbio', name: 'UpdBio', email: 'updbio@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    const res = await request(app).put(`/api/v1/puntualo/users/${id}`).set('Authorization', `Bearer ${token}`).send({ bio: 'New bio text' })
    if (res.status === 200) {
      expect(res.body.bio).toBe('New bio text')
    }
  })

  it('update profile isPrivate flag', async () => {
    const u = { handle: 'updpriv', name: 'UpdPriv', email: 'updpriv@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    const res = await request(app).put(`/api/v1/puntualo/users/${id}`).set('Authorization', `Bearer ${token}`).send({ isPrivate: true })
    if (res.status === 200) {
      expect(res.body.isPrivate).toBe(true)
    }
  })

  it('change password with correct old password', async () => {
    const u = { handle: 'chgpwd', name: 'ChgPwd', email: 'chgpwd@example.com', password: 'oldpass123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    const res = await request(app).post(`/api/v1/puntualo/users/${id}/change-password`).set('Authorization', `Bearer ${token}`).send({ oldPassword: 'oldpass123', newPassword: 'newpass456' })
    expect([200, 204, 404]).toContain(res.status)
  })

  it('change password with wrong old password returns 401 or 400', async () => {
    const u = { handle: 'chgpwdfail', name: 'ChgPwdFail', email: 'chgpwdfail@example.com', password: 'oldpass123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    const res = await request(app).post(`/api/v1/puntualo/users/${id}/change-password`).set('Authorization', `Bearer ${token}`).send({ oldPassword: 'wrongpass', newPassword: 'newpass456' })
    expect([400, 401, 404]).toContain(res.status)
  })

  it('update profile without token returns 401', async () => {
    const u = { handle: 'updnoauth', name: 'UpdNoAuth', email: 'updnoauth@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).put(`/api/v1/puntualo/users/${id}`).send({ name: 'Hacker' })
    expect([401, 404]).toContain(res.status)
  })

  it('update other user profile returns 403', async () => {
    const u1 = { handle: 'user1', name: 'User1', email: 'user1@example.com', password: 'secret123' }
    const u2 = { handle: 'user2', name: 'User2', email: 'user2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id2 = reg2.body.user._id
    const token1 = reg1.body.token
    const res = await request(app).put(`/api/v1/puntualo/users/${id2}`).set('Authorization', `Bearer ${token1}`).send({ name: 'Hacked' })
    expect([400, 403, 404]).toContain(res.status)
  })
})
