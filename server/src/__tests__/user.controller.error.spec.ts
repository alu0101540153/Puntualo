import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'

const userServiceMock: any = {
  getAll: vi.fn(),
  create: vi.fn(),
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

vi.mock('../services', () => ({ userService: userServiceMock }))

const userController = await import('../controllers/user.controller').then(m => m.userController)

const mockRes = () => {
  const res: any = {}
  res.statusCode = 200
  res.status = vi.fn((code: number) => { res.statusCode = code; return res })
  res.json = vi.fn((data: any) => { res.body = data; return res })
  return res as Response & { body?: any }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('user.controller error branches', () => {
  it('getAllUser catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.getAll.mockRejectedValueOnce(new Error('db fail'))
    await userController.getAllUser({} as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.body.message).toBe('db fail')
  })

  it('create catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.create.mockRejectedValueOnce(new Error('invalid'))
    await userController.create({ body: {} } as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('update catches non-conflict error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.update.mockRejectedValueOnce(new Error('generic error'))
    await userController.update({ params: { id: '1' }, body: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.body.message).toBe('generic error')
  })

  it('delete catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.delete.mockRejectedValueOnce(new Error('not found'))
    await userController.delete({ params: { id: 'x' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('addRating catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.addRating.mockRejectedValueOnce(new Error('invalid rating'))
    await userController.addRating({ params: { id: 'u1' }, body: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('getRatings catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.getRatings.mockRejectedValueOnce(new Error('fail'))
    await userController.getRatings({ params: { id: 'u1' }, query: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('deleteRating catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.removeRating.mockRejectedValueOnce(new Error('not found'))
    await userController.deleteRating({ params: { id: 'u1', ratingId: 'r1' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('getUserById catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.getById.mockRejectedValueOnce(new Error('db error'))
    await userController.getUserById({ params: { id: 'x' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('getFollows catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.getFollows.mockRejectedValueOnce(new Error('fail'))
    await userController.getFollows({ params: { id: 'u1' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('getFeed catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.getFeed.mockRejectedValueOnce(new Error('fail'))
    await userController.getFeed({ params: { id: 'u1' }, query: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('follow catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.followUser.mockRejectedValueOnce(new Error('fail'))
    await userController.follow({ params: { id: 't' }, user: { id: 'me' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('unfollow catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.unfollowUser.mockRejectedValueOnce(new Error('fail'))
    await userController.unfollow({ params: { id: 't' }, user: { id: 'me' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('addItem catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.addItemToUser.mockRejectedValueOnce(new Error('fail'))
    await userController.addItem({ params: { id: 'u1' }, body: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('deleteItem catches error and returns 400', async () => {
    const res = mockRes()
    userServiceMock.removeItemFromUser.mockRejectedValueOnce(new Error('fail'))
    await userController.deleteItem({ params: { id: 'u1', itemId: 'i1' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
