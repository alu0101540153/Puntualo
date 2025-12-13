import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { BookService } from '../services/item_book.service'
import { itemService } from '../services/item.service'
import { ItemType } from '../models/enums'

type MockAxios = typeof axios & { get: ReturnType<typeof vi.fn> }
const mockedAxios = axios as MockAxios

vi.mock('axios', () => {
  const get = vi.fn()
  return { default: { get }, get }
})

vi.mock('../services/item.service', () => {
  return {
    itemService: {
      findByExternalId: vi.fn(),
      create: vi.fn()
    }
  }
})

const findByExternalId = itemService.findByExternalId as unknown as ReturnType<typeof vi.fn>
const createItem = itemService.create as unknown as ReturnType<typeof vi.fn>

describe('BookService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searchBooksByTitle maps results', async () => {
    mockedAxios.get.mockResolvedValue({ data: {
      totalItems: 2,
      items: [
        { id: 'g1', volumeInfo: { title: 'Book 1', authors: ['A'], categories: ['Fiction'], imageLinks: { thumbnail: 't1' } } },
        { id: 'g2', volumeInfo: { title: 'Book 2', authors: ['B'] } },
      ]
    } })

    const res = await BookService.searchBooksByTitle('title', 1)
    expect(res.total).toBe(2)
    expect(res.items[0].id).toBe('g1')
    expect(mockedAxios.get).toHaveBeenCalled()
  })

  it('fetchBookByGoogleId returns existing item without create', async () => {
    findByExternalId.mockResolvedValue({ _id: 'abc', title: 'Existing' })
    const res = await BookService.fetchBookByGoogleId('gid')
    expect(res.fromDb).toBe(true)
    expect(createItem).not.toHaveBeenCalled()
  })

  it('fetchBookByGoogleId creates item when not existing', async () => {
    findByExternalId.mockResolvedValue(null)
    mockedAxios.get.mockResolvedValue({ data: { id: 'gid', volumeInfo: { title: 'New Book', authors: ['A'], categories: ['F'], imageLinks: { thumbnail: 't' } } } })
    createItem.mockResolvedValue({ _id: 'new' })

    const res = await BookService.fetchBookByGoogleId('gid')
    expect(res.item).toEqual({ _id: 'new' })
    expect(createItem).toHaveBeenCalled()
    const payload = createItem.mock.calls[0][0]
    expect(payload.itemType).toBe(ItemType.BOOK)
    expect(payload.externalId).toBe('gid')
  })
})
