import { describe, it, expect, vi, afterEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../middlewares/auth.middleware'
import { checkOwnership } from '../middlewares/owner.middleware'
import { validateUser } from '../middlewares/validateUser.middleware'
import { UserModel } from '../models'

const createRes = () => {
  const status = vi.fn().mockReturnThis()
  const json = vi.fn().mockReturnThis()
  return { status, json }
}

const createNext = () => vi.fn()

describe('auth middleware', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 401 when no token provided', () => {
    const req = { headers: {} } as any
    const res = createRes()
    verifyToken(req, res as any, createNext())
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' })
  })

  it('returns 401 when token invalid', () => {
    const req = { headers: { authorization: 'Bearer bad' } } as any
    vi.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('bad') })
    const res = createRes()
    verifyToken(req, res as any, createNext())
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' })
  })

  it('sets user and calls next when token valid', () => {
    const req: any = { headers: { authorization: 'Bearer good' } }
    const payload = { id: 'u1', email: 'a@test.com' }
    const next = createNext()
    vi.spyOn(jwt, 'verify').mockReturnValue(payload as any)
    verifyToken(req, createRes() as any, next)
    expect(req.user).toEqual({ id: 'u1', email: 'a@test.com' })
    expect(next).toHaveBeenCalled()
  })
})

describe('owner middleware', () => {
  it('returns 401 when no user in request', () => {
    const req = { params: { id: '1' } } as any
    const res = createRes()
    checkOwnership(req, res as any, createNext())
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 400 when missing target id', () => {
    const req = { user: { id: 'u1' }, params: {}, body: {} } as any
    const res = createRes()
    checkOwnership(req, res as any, createNext())
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 403 when user is not owner', () => {
    const req = { user: { id: 'u1' }, params: { id: 'other' } } as any
    const res = createRes()
    checkOwnership(req, res as any, createNext())
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('calls next when user is owner', () => {
    const next = createNext()
    const req = { user: { id: 'u1' }, params: { id: 'u1' } } as any
    checkOwnership(req, createRes() as any, next)
    expect(next).toHaveBeenCalled()
  })
})

describe('validateUser middleware', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 400 when fields are invalid', async () => {
    const req = { body: {} } as any
    const res = createRes()
    const next = createNext()
    await validateUser(req, res as any, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 409 when email exists', async () => {
    vi.spyOn(UserModel, 'findOne').mockReturnValueOnce({ lean: () => ({ _id: 'x' }) } as any)
    const req = { body: { name: 'a', email: 'a@test.com', password: '123456', handle: 'h1' } } as any
    const res = createRes()
    await validateUser(req, res as any, createNext())
    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('returns 409 when handle exists', async () => {
    vi.spyOn(UserModel, 'findOne').mockReturnValueOnce({ lean: () => null } as any).mockReturnValueOnce({ lean: () => ({ _id: 'y' }) } as any)
    const req = { body: { name: 'a', email: 'a@test.com', password: '123456', handle: 'h1' } } as any
    const res = createRes()
    await validateUser(req, res as any, createNext())
    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('returns 500 on lookup error', async () => {
    vi.spyOn(UserModel, 'findOne').mockImplementation(() => { throw new Error('db error') })
    const req = { body: { name: 'a', email: 'a@test.com', password: '123456', handle: 'h1' } } as any
    const res = createRes()
    await validateUser(req, res as any, createNext())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Error checking user uniqueness' })
  })

  it('calls next on valid new user', async () => {
    vi.spyOn(UserModel, 'findOne').mockReturnValueOnce({ lean: () => null } as any).mockReturnValueOnce({ lean: () => null } as any)
    const req = { body: { name: 'a', email: 'a@test.com', password: '123456', handle: 'h1' } } as any
    const res = createRes()
    const next = createNext()
    await validateUser(req, res as any, next)
    expect(next).toHaveBeenCalled()
  })
})
