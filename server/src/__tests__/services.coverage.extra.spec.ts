import { describe, it, expect, vi, afterEach } from 'vitest'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
  vi.resetModules()
  vi.restoreAllMocks()
})

describe('authService coverage', () => {
  it('login throws when user not found', async () => {
    const findOne = vi.fn().mockResolvedValue(null)
    vi.doMock('../models', () => ({ __esModule: true, UserModel: { findOne } }))
    vi.doMock('argon2', () => ({ __esModule: true, default: {}, verify: vi.fn() }))
    vi.doMock('jsonwebtoken', () => ({ __esModule: true, default: {}, sign: vi.fn() }))
    const { authService } = await import('../services/auth.service')
    await expect(authService.login('a@test.com', 'pw')).rejects.toThrow('Usuario no encontrado')
  })

  it('login throws when password invalid', async () => {
    const user = { password: 'hash', toObject: () => ({ password: 'hash', email: 'a@test.com' }) }
    const findOne = vi.fn().mockResolvedValue(user)
    const verify = vi.fn().mockResolvedValue(false)
    vi.doMock('../models', () => ({ __esModule: true, UserModel: { findOne } }))
    vi.doMock('argon2', () => ({ __esModule: true, default: { verify }, verify }))
    vi.doMock('jsonwebtoken', () => ({ __esModule: true, default: { sign: vi.fn() }, sign: vi.fn() }))
    const { authService } = await import('../services/auth.service')
    await expect(authService.login('a@test.com', 'pw')).rejects.toThrow('Contraseña incorrecta')
  })

  it('generateToken signs payload', async () => {
    const sign = vi.fn().mockReturnValue('token')
    vi.doMock('argon2', () => ({ __esModule: true, default: { verify: vi.fn() }, verify: vi.fn() }))
    vi.doMock('jsonwebtoken', () => ({ __esModule: true, default: { sign }, sign }))
    vi.doMock('../models', () => ({ __esModule: true, UserModel: { findOne: vi.fn().mockResolvedValue({}) } }))
    const { authService } = await import('../services/auth.service')
    const token = authService.generateToken({ _id: '123', email: 'a@test.com' })
    expect(token).toBe('token')
    expect(sign).toHaveBeenCalled()
  })
})

describe('itemService coverage', () => {
  it('findByExternalId includes itemType when provided', async () => {
    const findOne = vi.fn()
    vi.doMock('../models', () => ({ __esModule: true, ItemModel: { findOne } }))
    const { itemService } = await import('../services/item.service')
    await itemService.findByExternalId('abc', 'movie')
    expect(findOne).toHaveBeenCalledWith({ externalId: 'abc', itemType: 'movie' })
    await itemService.findByExternalId('abc')
    expect(findOne).toHaveBeenCalledWith({ externalId: 'abc' })
  })
})

describe('BookService coverage', () => {
  it('searchBooksByTitle throws on empty title', async () => {
    const { BookService } = await import('../services/item_book.service')
    await expect(BookService.searchBooksByTitle('', 1)).rejects.toThrow('Title is required')
  })

  it('searchBooksByTitle maps response', async () => {
    const axiosGet = vi.fn().mockResolvedValue({ data: { totalItems: 1, items: [{ id: '1', volumeInfo: { title: 'T', authors: ['A'], publisher: 'P', publishedDate: 'D', description: 'Desc', pageCount: 10, categories: ['C'], imageLinks: { thumbnail: 'img' }, infoLink: 'link' } }] } })
    vi.doMock('axios', () => ({ __esModule: true, default: { get: axiosGet } }))
    const { BookService } = await import('../services/item_book.service')
    const res = await BookService.searchBooksByTitle('title', 1)
    expect(res.items[0]).toMatchObject({ id: '1', title: 'T' })
  })

  it('fetchBookByGoogleId returns existing item', async () => {
    const existing = { id: 'x' }
    const findByExternalId = vi.fn().mockResolvedValue(existing)
    const create = vi.fn()
    vi.doMock('../services/item.service', () => ({ __esModule: true, itemService: { findByExternalId, create } }))
    vi.doMock('axios', () => ({ __esModule: true, default: { get: vi.fn() } }))
    const { BookService } = await import('../services/item_book.service')
    const res = await BookService.fetchBookByGoogleId('gid')
    expect(res.fromDb).toBe(true)
    expect(create).not.toHaveBeenCalled()
  })

  it('fetchBookByGoogleId creates when missing', async () => {
    const findByExternalId = vi.fn().mockResolvedValue(null)
    const create = vi.fn().mockResolvedValue({ _id: '1' })
    const axiosGet = vi.fn().mockResolvedValue({ data: { id: 'gid', volumeInfo: { title: 'New', authors: ['A'], categories: ['C'], description: 'D', imageLinks: { thumbnail: 'img' } } } })
    vi.doMock('../services/item.service', () => ({ __esModule: true, itemService: { findByExternalId, create } }))
    vi.doMock('axios', () => ({ __esModule: true, default: { get: axiosGet } }))
    const { BookService } = await import('../services/item_book.service')
    const res = await BookService.fetchBookByGoogleId('gid')
    expect(res.fromDb).toBe(false)
    expect(create).toHaveBeenCalled()
  })
})

describe('MovieService coverage', () => {
  it('searchMoviesByTitle requires API key', async () => {
    process.env.TMDB_API_KEY = ''
    const { MovieService } = await import('../services/item_movie.service')
    await expect(MovieService.searchMoviesByTitle('t', 1)).rejects.toThrow('TMDB_API_KEY is required')
  })

  it('fetchMovieByTmdbId uses existing item when found', async () => {
    process.env.TMDB_API_KEY = 'key'
    const findByExternalId = vi.fn().mockResolvedValue({ id: 'old' })
    vi.doMock('../services/item.service', () => ({ __esModule: true, itemService: { findByExternalId, create: vi.fn() } }))
    vi.doMock('axios', () => ({ __esModule: true, default: { get: vi.fn() } }))
    const { MovieService } = await import('../services/item_movie.service')
    const res = await MovieService.fetchMovieByTmdbId('1')
    expect(res.fromDb).toBe(true)
  })

  it('fetchMovieByTmdbId creates new item', async () => {
    process.env.TMDB_API_KEY = 'key'
    const findByExternalId = vi.fn().mockResolvedValue(null)
    const create = vi.fn().mockResolvedValue({ _id: 'new' })
    const axiosGet = vi.fn().mockResolvedValue({ data: { id: 2, title: 'Movie', genres: [{ name: 'Drama' }], credits: { cast: [{ name: 'A' }] }, poster_path: '/p', overview: 'desc', release_date: 'd' } })
    vi.doMock('../services/item.service', () => ({ __esModule: true, itemService: { findByExternalId, create } }))
    vi.doMock('axios', () => ({ __esModule: true, default: { get: axiosGet } }))
    const { MovieService } = await import('../services/item_movie.service')
    const res = await MovieService.fetchMovieByTmdbId('2')
    expect(res.fromDb).toBe(false)
    expect(create).toHaveBeenCalled()
  })
})

describe('SeriesService coverage', () => {
  it('fetchShowByTmdbId falls back to DB hit', async () => {
    process.env.TMDB_API_KEY = 'key'
    const findByExternalId = vi.fn().mockResolvedValue(null)
    const create = vi.fn().mockResolvedValue({ _id: 'series' })
    const axiosGet = vi.fn().mockResolvedValue({ data: { id: 3, name: 'Show', genres: [{ name: 'G' }], credits: { cast: [{ name: 'C' }] }, poster_path: '/p', overview: 'o', first_air_date: '2020', number_of_seasons: 2, networks: [{ name: 'N' }] } })
    vi.doMock('../services/item.service', () => ({ __esModule: true, itemService: { findByExternalId, create } }))
    vi.doMock('axios', () => ({ __esModule: true, default: { get: axiosGet } }))
    const { SeriesService } = await import('../services/item_series.service')
    const res = await SeriesService.fetchShowByTmdbId('3')
    expect(res.fromDb).toBe(false)
    expect(create).toHaveBeenCalled()
  })
})

describe('mail services coverage', () => {
  it('sendEmail skips when no API key', async () => {
    process.env.SENDGRID_API_KEY = ''
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.doMock('axios', () => ({ __esModule: true, default: { post: vi.fn(), isAxiosError: () => false } }))
    const mod = await import('../services/mail.service')
    await mod.sendEmail('a@test.com', 'sub', '<p>h</p>')
    expect(infoSpy).toHaveBeenCalled()
  })

  it('sendEmail logs axios error details', async () => {
    process.env.SENDGRID_API_KEY = 'k'
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const axiosError = { isAxiosError: true, response: { status: 400, data: { errors: ['bad'] } } }
    const post = vi.fn().mockRejectedValue(axiosError)
    vi.doMock('axios', () => ({ __esModule: true, default: Object.assign(post, { post, isAxiosError: (err: any) => err && err.isAxiosError }) }))
    const mod = await import('../services/mail.service')
    await mod.sendEmail('a@test.com', 'sub', '<p>h</p>')
    expect(errorSpy).toHaveBeenCalled()
  })

  it('sendTemplateEmail skips without API key', async () => {
    process.env.SENDGRID_API_KEY = ''
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const mod = await import('../services/mail_template.service')
    await mod.sendTemplateEmail('a@test.com', 'tpl', {}, [])
    expect(infoSpy).toHaveBeenCalled()
  })
})

describe('mail assets coverage', () => {
  it('getAssetDataUri uses ASSETS_BASE_URL when provided', async () => {
    vi.doMock('../config', () => ({ __esModule: true, ASSETS_BASE_URL: 'https://cdn/assets/' }))
    const { getAssetDataUri } = await import('../services/mail_assets.service')
    const url = await getAssetDataUri('img.png')
    expect(url).toBe('https://cdn/assets/img.png')
  })
})

describe('email templates coverage', () => {
  it('sendRegisterEmail uses template path and falls back', async () => {
    process.env.SENDGRID_REGISTER_TEMPLATE_ID = 'tpl'
    process.env.SENDGRID_API_KEY = 'k'
    const sendTemplateEmail = vi.fn().mockRejectedValue(new Error('fail'))
    const sendEmail = vi.fn().mockResolvedValue(undefined)
    const getAssetDataUri = vi.fn().mockResolvedValue('data:img')
    const getAssetBase64 = vi.fn().mockResolvedValue({ base64: 'b64', mime: 'image/png', filename: 'f.png' })
    vi.doMock('../config', () => ({ __esModule: true, SENDGRID_REGISTER_TEMPLATE_ID: 'tpl', SENDGRID_API_KEY: 'k', MAIL_SENDER_EMAIL: 'a@test.com', MAIL_SENDER_NAME: 'Test' }))
    vi.doMock('../services/mail_template.service', () => ({ __esModule: true, sendTemplateEmail }))
    vi.doMock('../services/mail.service', () => ({ __esModule: true, default: sendEmail, sendEmail }))
    vi.doMock('../services/mail_assets.service', () => ({ __esModule: true, getAssetDataUri, getAssetBase64 }))
    const { sendRegisterEmail } = await import('../services/email_register.service')
    await sendRegisterEmail('user@test.com', 'User')
    expect(sendTemplateEmail).toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalled()
  })

  it('sendFollowEmail sends template when ID present', async () => {
    process.env.SENDGRID_FOLLOW_TEMPLATE_ID = 'tpl'
    process.env.SENDGRID_API_KEY = 'k'
    const sendTemplateEmail = vi.fn().mockResolvedValue({})
    const sendEmail = vi.fn().mockResolvedValue(undefined)
    const getAssetDataUri = vi.fn().mockResolvedValue('data:img')
    const getAssetBase64 = vi.fn().mockResolvedValue({ base64: 'b64', mime: 'image/png', filename: 'f.png' })
    vi.doMock('../config', () => ({ __esModule: true, SENDGRID_FOLLOW_TEMPLATE_ID: 'tpl', SENDGRID_API_KEY: 'k', MAIL_SENDER_EMAIL: 'a@test.com', MAIL_SENDER_NAME: 'Test' }))
    vi.doMock('../services/mail_template.service', () => ({ __esModule: true, sendTemplateEmail }))
    vi.doMock('../services/mail.service', () => ({ __esModule: true, default: sendEmail, sendEmail }))
    vi.doMock('../services/mail_assets.service', () => ({ __esModule: true, getAssetDataUri, getAssetBase64 }))
    const { sendFollowEmail } = await import('../services/email_follow.service')
    await sendFollowEmail('target@test.com', 'Target', 'Follower')
    expect(sendTemplateEmail).toHaveBeenCalled()
  })
})

describe('services index coverage', () => {
  it('exports expected services', async () => {
    const mod = await import('../services')
    expect(mod).toHaveProperty('itemService')
    expect(mod).toHaveProperty('BookService')
    expect(mod).toHaveProperty('sendFollowEmail')
  })
})
