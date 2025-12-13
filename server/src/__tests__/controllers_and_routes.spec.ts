import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'

const loginMock = vi.fn()
const generateTokenMock = vi.fn(() => 'token')
const userServiceMock: any = {
  create: vi.fn(),
  getAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  addRating: vi.fn(),
  getRatings: vi.fn(),
  removeRating: vi.fn(),
  getById: vi.fn(),
  getFollows: vi.fn(),
  getFeed: vi.fn(),
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
  addItemToUser: vi.fn(),
  removeItemFromUser: vi.fn()
}
const sendRegisterEmailMock = vi.fn()

const bookServiceMock = { searchBooksByTitle: vi.fn(), fetchBookByGoogleId: vi.fn() }
const movieServiceMock = { searchMoviesByTitle: vi.fn(), fetchMovieByTmdbId: vi.fn() }
const seriesServiceMock = { searchShowsByTitle: vi.fn(), fetchShowByTmdbId: vi.fn() }
const userModelMock: any = { countDocuments: vi.fn(), find: vi.fn() }

// Mock service modules before controller imports
vi.mock('../services/auth.service', () => ({ authService: { login: loginMock, generateToken: generateTokenMock } }))
vi.mock('../services', () => ({
  userService: userServiceMock,
  sendRegisterEmail: sendRegisterEmailMock,
  BookService: bookServiceMock,
  MovieService: movieServiceMock,
  SeriesService: seriesServiceMock,
  sendTemplateEmail: vi.fn()
}))
vi.mock('../models', () => ({ UserModel: userModelMock }))

// Helpers
const mockRes = () => {
  const res: any = {}
  res.statusCode = 200
  res.status = vi.fn((code: number) => { res.statusCode = code; return res })
  res.json = vi.fn((data: any) => { res.body = data; return res })
  return res as Response & { body?: any }
}

const authController = await import('../controllers/auth.controller').then(m => m.authController)
const userController = await import('../controllers/user.controller').then(m => m.userController)
const searchController = await import('../controllers/search.controller').then(m => m.searchController)
const testRouter = await import('../routes/test.route').then(m => m.default)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('auth.controller', () => {
  it('login returns result', async () => {
    const res = mockRes()
    loginMock.mockResolvedValueOnce({ ok: true })
    await authController.login({ body: { email: 'a', password: 'p' } } as Request, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('login maps auth errors to 401', async () => {
    const res = mockRes()
    loginMock.mockRejectedValueOnce(new Error('Usuario no encontrado'))
    await authController.login({ body: { email: 'a', password: 'p' } } as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalled()
  })

  it('register strips password and sends token', async () => {
    const res = mockRes()
    const fakeUser = { email: 'e@test.com', password: 'hash', toObject: () => ({ email: 'e@test.com', password: 'hash' }) }
    userServiceMock.create.mockResolvedValueOnce(fakeUser)
    await authController.register({ body: { email: 'e', password: 'p' } } as Request, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.body?.user.password).toBeUndefined()
    expect(sendRegisterEmailMock).toHaveBeenCalledWith('e@test.com', '')
  })

  it('register handles duplicate email with 409', async () => {
    const res = mockRes()
    userServiceMock.create.mockRejectedValueOnce({ code: 11000, keyValue: { email: 'e' }, message: 'dup' })
    await authController.register({ body: {} } as Request, res)
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.body?.field).toBe('email')
  })
})

describe('user.controller happy paths', () => {
  it('returns all users', async () => {
    const res = mockRes()
    userServiceMock.getAll.mockResolvedValueOnce(['u1'])
    await userController.getAllUser({} as Request, res)
    expect(res.json).toHaveBeenCalledWith(['u1'])
  })

  it('handles conflict on update', async () => {
    const res = mockRes()
    userServiceMock.update.mockRejectedValueOnce({ name: 'ConflictError', message: 'Handle ya en uso' })
    await userController.update({ params: { id: '1' }, body: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('follow requires auth', async () => {
    const res = mockRes()
    await userController.follow({ params: { id: 't' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('getUserById returns 404 when missing', async () => {
    const res = mockRes()
    userServiceMock.getById.mockResolvedValueOnce(null)
    await userController.getUserById({ params: { id: 'x' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })
})

describe('search.controller', () => {
  it('validates missing title on books', async () => {
    const res = mockRes()
    await searchController.searchBooks({ query: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('searchFriends paginates', async () => {
    const res = mockRes()
    userModelMock.countDocuments.mockResolvedValueOnce(1)
    userModelMock.find.mockReturnValue({ select: () => ({ skip: () => ({ limit: () => ({ lean: vi.fn().mockResolvedValue([{ name: 'a' }]) }) }) }) })
    await searchController.searchFriends({ query: { page: '1' } } as unknown as Request, res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 1, items: [{ name: 'a' }] }))
  })
})

describe('test.route', () => {
  const getHandler = () => {
    const stack = (testRouter as any).stack.find((l: any) => l.route?.path === '/send-template')
    return stack.route.stack[0].handle
  }

  it('returns 400 when params missing', async () => {
    const res = mockRes()
    await getHandler()({ body: {} } as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 202 on success', async () => {
    const res = mockRes()
    const services = await import('../services')
    vi.spyOn(services, 'sendTemplateEmail').mockResolvedValueOnce(undefined)
    await getHandler()({ body: { to: 'a', templateId: 't', data: {} } } as Request, res)
    expect(res.status).toHaveBeenCalledWith(202)
  })

  it('returns 500 on errors', async () => {
    const res = mockRes()
    const services = await import('../services')
    vi.spyOn(services, 'sendTemplateEmail').mockRejectedValueOnce({ message: 'boom' })
    await getHandler()({ body: { to: 'a', templateId: 't' } } as Request, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })
})

describe('index modules expose exports', () => {
  it('controllers and services are defined', async () => {
    const controllers = await import('../controllers')
    const services = await import('../services')
    const models = await import('../models')
    expect(controllers).toBeDefined()
    expect(services.userService).toBeDefined()
    expect(models.UserModel).toBeDefined()
  })
})
