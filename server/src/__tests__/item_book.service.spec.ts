import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('axios', () => ({ default: { get: vi.fn() } }))
import axios from 'axios'

// Mock itemService and ItemModel used in BookService
vi.mock('../services/item.service', () => ({
  itemService: {
    findByExternalId: vi.fn(),
    create: vi.fn(),
  }
}))
vi.mock('../models', () => {
  return {
    ItemModel: {
      countDocuments: vi.fn(),
      find: vi.fn(() => ({ skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) })),
    }
  }
})

import { itemService } from '../services/item.service'
import { ItemModel } from '../models'
import { BookService } from '../services/item_book.service'

describe('BookService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searchBooksByTitle uses Google Books and maps results', async () => {
    ;(axios.get as any).mockResolvedValue({ data: {
      totalItems: 2,
      items: [
        { id: 'g1', volumeInfo: { title: 'B1', authors: ['A1'], categories: ['C1'], imageLinks: { thumbnail: 't1' }, infoLink: 'L1' } },
        { id: 'g2', volumeInfo: { title: 'B2' } }
      ]
    } })
    const res = await BookService.searchBooksByTitle('harry', 1)
    expect(axios.get).toHaveBeenCalled()
    expect(res.items.length).toBe(2)
    expect(res.total).toBe(2)
  })

  it('searchBooksByTitle without title reads from DB with optional genre', async () => {
    ;(ItemModel.countDocuments as any).mockResolvedValue(1)
    ;(ItemModel.find as any).mockReturnValue({
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{ _id: 'i1', title: 'Stored', data: { description: 'd', genres: ['Drama'], cover: 'c' } }])
    })

    const res = await BookService.searchBooksByTitle('', 1, 'Drama')
    expect(ItemModel.countDocuments).toHaveBeenCalled()
    expect(ItemModel.find).toHaveBeenCalled()
    expect(res.items[0].title).toBe('Stored')
  })

  it('fetchBookByGoogleId returns from DB when exists', async () => {
    ;(itemService.findByExternalId as any).mockResolvedValue({ _id: 'existing' })
    const res = await BookService.fetchBookByGoogleId('gid')
    expect(res.fromDb).toBe(true)
    expect(res.item).toEqual({ _id: 'existing' })
  })

  it('fetchBookByGoogleId fetches Google and creates when not existing', async () => {
    ;(itemService.findByExternalId as any).mockResolvedValue(null)
    ;(axios.get as any).mockResolvedValue({ data: {
      id: 'gid',
      volumeInfo: { title: 'Book', authors: ['Auth'], categories: ['Drama'], description: 'D', imageLinks: { thumbnail: 'T' } }
    } })
    ;(itemService.create as any).mockResolvedValue({ _id: 'new' })

    const res = await BookService.fetchBookByGoogleId('gid')
    expect(itemService.create).toHaveBeenCalled()
    expect(res.item).toEqual({ _id: 'new' })
    expect(res.fromDb).toBe(false)
  })
})
