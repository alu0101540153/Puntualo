import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'

const itemServiceMock = { getAll: vi.fn(), create: vi.fn(), getById: vi.fn(), update: vi.fn(), delete: vi.fn() }
vi.mock('../services', () => ({ itemService: itemServiceMock }))

const itemController = await import('../controllers/item.controller').then(m => m.itemController)

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

describe('item.controller error branches', () => {
  it('getAllItem catches error and returns 400', async () => {
    const res = mockRes()
    itemServiceMock.getAll.mockRejectedValueOnce(new Error('db fail'))
    await itemController.getAllItem({} as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.body.message).toBe('db fail')
  })

  it('create catches error and returns 400', async () => {
    const res = mockRes()
    itemServiceMock.create.mockRejectedValueOnce(new Error('invalid'))
    await itemController.create({ body: {} } as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('getById catches error and returns 400', async () => {
    const res = mockRes()
    itemServiceMock.getById.mockRejectedValueOnce(new Error('not found'))
    await itemController.getById({ params: { id: 'x' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('update catches error and returns 400', async () => {
    const res = mockRes()
    itemServiceMock.update.mockRejectedValueOnce(new Error('fail'))
    await itemController.update({ params: { id: 'x' }, body: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('delete catches error and returns 400', async () => {
    const res = mockRes()
    itemServiceMock.delete.mockRejectedValueOnce(new Error('fail'))
    await itemController.delete({ params: { id: 'x' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
