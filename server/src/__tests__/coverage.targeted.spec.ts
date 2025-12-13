import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

import { itemController, userController } from '../controllers'
import { searchController } from '../controllers/search.controller'
import { authController } from '../controllers/auth.controller'
import { itemService, userService, BookService, MovieService, SeriesService } from '../services'
import { authService } from '../services/auth.service'
import { UserModel } from '../models'

const createRes = () => {
  const status = vi.fn().mockReturnThis()
  const json = vi.fn().mockReturnThis()
  return { status, json }
}

describe('controllers coverage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('itemController getAllItem handles error', async () => {
    vi.spyOn(itemService, 'getAll').mockRejectedValue(new Error('err'))
    const res = createRes()
    await itemController.getAllItem({} as any, res as any)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'err' })
  })

  it('itemController getById returns 404 when not found', async () => {
    vi.spyOn(itemService, 'getById').mockResolvedValue(null)
    const req = { params: { id: '1' } } as any
    const res = createRes()
    await itemController.getById(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' })
  })

  it('itemController update handles error', async () => {
    vi.spyOn(itemService, 'update').mockRejectedValue(new Error('boom'))
    const req = { params: { id: '1' }, body: {} } as any
    const res = createRes()
    await itemController.update(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'boom' })
  })

  it('userController update conflict returns 409', async () => {
    const conflict = new Error('Handle ya en uso') as any
    conflict.name = 'ConflictError'
    vi.spyOn(userService, 'update').mockRejectedValue(conflict)
    const req = { params: { id: '1' }, body: {} } as any
    const res = createRes()
    await userController.update(req, res)
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ message: 'Handle ya en uso' })
  })

  it('userController getUserById returns 404', async () => {
    vi.spyOn(userService, 'getById').mockResolvedValue(null)
    const req = { params: { id: '1' } } as any
    const res = createRes()
    await userController.getUserById(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' })
  })

  it('userController follow without auth returns 401', async () => {
    const req = { params: { id: 'target' } } as any
    const res = createRes()
    await userController.follow(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('userController follow handles error', async () => {
    vi.spyOn(userService, 'followUser').mockRejectedValue(new Error('fail'))
    const req = { params: { id: 'target' }, user: { id: 'me' } } as any
    const res = createRes()
    await userController.follow(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'fail' })
  })

  it('searchController searchBooks missing title returns 400', async () => {
    const req = { query: {} } as any
    const res = createRes()
    await searchController.searchBooks(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Query param "title" is required' })
  })

  it('searchController fetchBook missing id returns 400', async () => {
    const req = { params: {} } as any
    const res = createRes()
    await searchController.fetchBook(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Param "googleId" is required' })
  })

  it('searchController fetchMovie missing id returns 400', async () => {
    const req = { params: {} } as any
    const res = createRes()
    await searchController.fetchMovie(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Param "tmdbId" is required' })
  })

  it('searchController fetchSeries missing id returns 400', async () => {
    const req = { params: {} } as any
    const res = createRes()
    await searchController.fetchSeries(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Param "tmdbId" is required' })
  })

  it('authController login maps auth error to 401', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(new Error('contraseña incorrecta'))
    const req = { body: { email: 'a', password: 'b' } } as any
    const res = createRes()
    await authController.login(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('authController register duplicate returns 409', async () => {
    const dup: any = new Error('dup')
    dup.code = 11000
    dup.keyValue = { email: 'a@test.com' }
    vi.spyOn(userService, 'create').mockRejectedValue(dup)
    const req = { body: { email: 'a@test.com', password: 'x' } } as any
    const res = createRes()
    await authController.register(req, res)
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ message: 'Ya existe un usuario registrado con ese correo electrónico.', field: 'email' })
  })

  it('authController register generic error returns 400', async () => {
    vi.spyOn(userService, 'create').mockRejectedValue(new Error('bad'))
    const req = { body: { email: 'a@test.com', password: 'x' } } as any
    const res = createRes()
    await authController.register(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'bad' })
  })

  it('searchController errors return 500', async () => {
    vi.spyOn(BookService, 'searchBooksByTitle').mockRejectedValue(new Error('fail'))
    const req = { query: { title: 'a', page: '1' } } as any
    const res = createRes()
    await searchController.searchBooks(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'fail' })
  })

  it('searchController searchBooks returns data', async () => {
    vi.spyOn(BookService, 'searchBooksByTitle').mockResolvedValue({ ok: true })
    const req = { query: { title: 'abc', page: '2' } } as any
    const res = createRes()
    await searchController.searchBooks(req, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('searchController searchMovies handles missing title', async () => {
    const req = { query: {} } as any
    const res = createRes()
    await searchController.searchMovies(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('searchController searchMovies returns data', async () => {
    vi.spyOn(MovieService, 'searchMoviesByTitle').mockResolvedValue({ ok: true })
    const req = { query: { title: 'abc', page: '1' } } as any
    const res = createRes()
    await searchController.searchMovies(req, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('searchController searchSeries returns data', async () => {
    vi.spyOn(SeriesService, 'searchShowsByTitle').mockResolvedValue({ ok: true })
    const req = { query: { title: 'abc', page: '1' } } as any
    const res = createRes()
    await searchController.searchSeries(req, res)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('searchController fetchBook returns 201', async () => {
    vi.spyOn(BookService, 'fetchBookByGoogleId').mockResolvedValue({ ok: true })
    const req = { params: { googleId: 'gid' } } as any
    const res = createRes()
    await searchController.fetchBook(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('searchController fetchMovie returns 201', async () => {
    vi.spyOn(MovieService, 'fetchMovieByTmdbId').mockResolvedValue({ ok: true })
    const req = { params: { tmdbId: 'mid' } } as any
    const res = createRes()
    await searchController.fetchMovie(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })

  it('searchController fetchSeries handles errors', async () => {
    vi.spyOn(SeriesService, 'fetchShowByTmdbId').mockRejectedValue(new Error('series fail'))
    const req = { params: { tmdbId: 'sid' } } as any
    const res = createRes()
    await searchController.fetchSeries(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'series fail' })
  })

  it('searchController searchFriends returns paginated data', async () => {
    vi.spyOn(UserModel, 'countDocuments').mockResolvedValue(1 as any)
    vi.spyOn(UserModel, 'find').mockReturnValue({ select: vi.fn().mockReturnThis(), skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([{ name: 'a', handle: 'b' }]) } as any)
    const req = { query: { handle: 'a', page: '1' } } as any
    const res = createRes()
    await searchController.searchFriends(req, res)
    expect(res.json).toHaveBeenCalledWith({ items: [{ name: 'a', handle: 'b' }], total: 1, page: 1, pages: 1, perPage: 10 })
  })

  it('authController login defaults to 400 on generic error', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(new Error('other'))
    const req = { body: { email: 'x', password: 'y' } } as any
    const res = createRes()
    await authController.login(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'other' })
  })

  it('controllers index exports are defined', async () => {
    const mod = await import('../controllers/index')
    expect(mod).toHaveProperty('itemController')
    expect(mod).toHaveProperty('userController')
  })
})

describe('config coverage', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('loads .env.test when NODE_ENV=test', async () => {
    process.env.NODE_ENV = 'test'
    const configMock = vi.fn()
    vi.doMock('dotenv', () => ({ config: configMock }))
    await import('../config')
    expect(configMock).toHaveBeenCalled()
  })

  it('skips env file when production', async () => {
    process.env.NODE_ENV = 'production'
    const configMock = vi.fn()
    vi.doMock('dotenv', () => ({ config: configMock }))
    await import('../config')
    expect(configMock).not.toHaveBeenCalled()
  })

  it('loads default .env for dev', async () => {
    process.env.NODE_ENV = 'development'
    const configMock = vi.fn()
    vi.doMock('dotenv', () => ({ config: configMock }))
    await import('../config')
    expect(configMock).toHaveBeenCalled()
  })

  it('loads .env when NODE_ENV undefined', async () => {
    delete process.env.NODE_ENV
    const configMock = vi.fn()
    vi.doMock('dotenv', () => ({ config: configMock }))
    await import('../config')
    expect(configMock).toHaveBeenCalled()
  })

  it('loads .env when NODE_ENV=staging', async () => {
    process.env.NODE_ENV = 'staging'
    const configMock = vi.fn()
    vi.doMock('dotenv', () => ({ config: configMock }))
    await import('../config')
    expect(configMock).toHaveBeenCalled()
  })
})

describe('database coverage', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('connectDB uses test URI and throws on failure in test env', async () => {
    process.env.NODE_ENV = 'test'
    const connect = vi.fn().mockRejectedValue(new Error('boom'))
    const set = vi.fn()
    const dropDatabase = vi.fn()
    const mockConn = { readyState: 1, dropDatabase }
    vi.doMock('mongoose', () => ({
      __esModule: true,
      default: { connection: mockConn, set, Schema: vi.fn() },
      connect,
      connection: mockConn,
      set,
      Schema: vi.fn()
    }))
    const { connectDB } = await import('../database')
    await expect(connectDB()).rejects.toThrow('boom')
    expect(set).toHaveBeenCalledWith('strictQuery', true)
  })

  it('dropTestDatabase drops when readyState=1', async () => {
    process.env.NODE_ENV = 'test'
    const connect = vi.fn()
    const set = vi.fn()
    const dropDatabase = vi.fn()
    const mockConn = { readyState: 1, dropDatabase }
    vi.doMock('mongoose', () => ({
      __esModule: true,
      default: { connection: mockConn, set, Schema: vi.fn() },
      connect,
      connection: mockConn,
      set,
      Schema: vi.fn()
    }))
    const { dropTestDatabase } = await import('../database')
    await dropTestDatabase()
    expect(dropDatabase).toHaveBeenCalled()
  })

  it('dropTestDatabase does nothing outside test env or when not ready', async () => {
    process.env.NODE_ENV = 'development'
    const connect = vi.fn()
    const set = vi.fn()
    const dropDatabase = vi.fn()
    const mockConn = { readyState: 0, dropDatabase }
    vi.doMock('mongoose', () => ({
      __esModule: true,
      default: { connection: mockConn, set },
      connect,
      connection: mockConn,
      set,
      Schema: vi.fn(),
      Types: { ObjectId: vi.fn() }
    }))
    const { dropTestDatabase } = await import('../database')
    await dropTestDatabase()
    expect(dropDatabase).not.toHaveBeenCalled()
  })

  it('dropTestDatabase skips when readyState!=1 in test env', async () => {
    process.env.NODE_ENV = 'test'
    const connect = vi.fn()
    const set = vi.fn()
    const dropDatabase = vi.fn()
    const mockConn = { readyState: 0, dropDatabase }
    vi.doMock('mongoose', () => ({
      __esModule: true,
      default: { connection: mockConn, set },
      connect,
      connection: mockConn,
      set,
      Schema: vi.fn(),
      Types: { ObjectId: vi.fn() }
    }))
    const { dropTestDatabase } = await import('../database')
    await dropTestDatabase()
    expect(dropDatabase).not.toHaveBeenCalled()
  })

  it('dropTestDatabase logs error on failure', async () => {
    process.env.NODE_ENV = 'test'
    const connect = vi.fn()
    const set = vi.fn()
    const dropDatabase = vi.fn(() => { throw new Error('drop fail') })
    const mockConn = { readyState: 1, dropDatabase }
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.doMock('mongoose', () => ({
      __esModule: true,
      default: { connection: mockConn, set },
      connect,
      connection: mockConn,
      set,
      Schema: vi.fn(),
      Types: { ObjectId: vi.fn() }
    }))
    const { dropTestDatabase } = await import('../database')
    await dropTestDatabase()
    expect(errorSpy).toHaveBeenCalled()
  })

  it('connectDB exits process on production failure', async () => {
    process.env.NODE_ENV = 'production'
    const set = vi.fn()
    const connect = vi.fn().mockRejectedValue(new Error('prod fail'))
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined as never))
    vi.doMock('mongoose', () => ({
      __esModule: true,
      default: { connection: {}, set },
      connect,
      connection: {},
      set,
      Schema: vi.fn(),
      Types: { ObjectId: vi.fn() }
    }))
    const { connectDB } = await import('../database')
    await connectDB()
    expect(connect).toHaveBeenCalled()
    expect(exitSpy).toHaveBeenCalled()
  })

  it('connectDB logs success', async () => {
    process.env.NODE_ENV = 'test'
    const set = vi.fn()
    const connect = vi.fn().mockResolvedValue(undefined)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.doMock('mongoose', () => ({
      __esModule: true,
      default: { connection: {}, set },
      connect,
      connection: {},
      set,
      Schema: vi.fn(),
      Types: { ObjectId: vi.fn() }
    }))
    const { connectDB } = await import('../database')
    await connectDB()
    expect(logSpy).toHaveBeenCalled()
  })

  it('dropTestDatabase logs success', async () => {
    process.env.NODE_ENV = 'test'
    const connect = vi.fn()
    const set = vi.fn()
    const dropDatabase = vi.fn()
    const mockConn = { readyState: 1, dropDatabase }
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.doMock('mongoose', () => ({
      __esModule: true,
      default: { connection: mockConn, set },
      connect,
      connection: mockConn,
      set,
      Schema: vi.fn(),
      Types: { ObjectId: vi.fn() }
    }))
    const { dropTestDatabase } = await import('../database')
    await dropTestDatabase()
    expect(logSpy).toHaveBeenCalled()
  })
})

describe('server coverage', () => {
  afterEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('listen handles success path', async () => {
    const listen = vi.fn((port: any, cb?: () => void) => { if (cb) cb() })
    const set = vi.fn()
    const use = vi.fn()
    const get = vi.fn()
    const app = { use, get, listen, set }

    vi.doMock('express', () => {
      const json = vi.fn()
      const Router = () => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), use: vi.fn(), patch: vi.fn() })
      const express = () => app
      express.json = json
      return { __esModule: true, default: express, json, Router }
    })
    vi.doMock('mongoose', () => {
      function SchemaMock(this: any, def?: any) { this.definition = def }
      ;(SchemaMock as any).Types = { ObjectId: vi.fn() }
      const model = vi.fn()
      return {
        __esModule: true,
        default: { model, models: {}, Schema: SchemaMock, connection: {}, set: vi.fn(), Types: (SchemaMock as any).Types },
        model,
        models: {},
        Schema: SchemaMock,
        Types: (SchemaMock as any).Types,
        connect: vi.fn(),
        set: vi.fn(),
        connection: {}
      }
    })
    vi.doMock('morgan', () => ({ __esModule: true, default: vi.fn(() => 'mw') }))
    vi.doMock('cors', () => ({ __esModule: true, default: vi.fn(() => 'mw') }))
    vi.doMock('../routes', () => ({ __esModule: true, routes: { ItemRoute: 'i', UserRoute: 'u', AuthRoute: 'a', SearchRoute: 's', TestRoute: 't' } }))
    vi.doMock('../database', () => ({ __esModule: true, connectDB: vi.fn().mockResolvedValue(undefined) }))
    vi.doMock('../config', () => ({ __esModule: true, PORT: '1234' }))

    const { Server } = await import('../server')
    const server = new Server()
    server.listen()
    await Promise.resolve()
    await Promise.resolve()
    expect(listen).toHaveBeenCalled()
  })

  it('listen handles db connection error', async () => {
    const listen = vi.fn()
    const set = vi.fn()
    const use = vi.fn()
    const get = vi.fn()
    const app = { use, get, listen, set }

    vi.doMock('express', () => {
      const json = vi.fn()
      const Router = () => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), use: vi.fn(), patch: vi.fn() })
      const express = () => app
      express.json = json
      return { __esModule: true, default: express, json, Router }
    })
    vi.doMock('mongoose', () => {
      function SchemaMock(this: any, def?: any) { this.definition = def }
      ;(SchemaMock as any).Types = { ObjectId: vi.fn() }
      const model = vi.fn()
      return {
        __esModule: true,
        default: { model, models: {}, Schema: SchemaMock, connection: {}, set: vi.fn(), Types: (SchemaMock as any).Types },
        model,
        models: {},
        Schema: SchemaMock,
        Types: (SchemaMock as any).Types,
        connect: vi.fn(),
        set: vi.fn(),
        connection: {}
      }
    })
    vi.doMock('morgan', () => ({ __esModule: true, default: vi.fn(() => 'mw') }))
    vi.doMock('cors', () => ({ __esModule: true, default: vi.fn(() => 'mw') }))
    vi.doMock('../routes', () => ({ __esModule: true, routes: { ItemRoute: 'i', UserRoute: 'u', AuthRoute: 'a', SearchRoute: 's', TestRoute: 't' } }))
    const connectMock = vi.fn().mockRejectedValue(new Error('db fail'))
    vi.doMock('../database', () => ({ __esModule: true, connectDB: connectMock }))
    vi.doMock('../config', () => ({ __esModule: true, PORT: '1234' }))

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { Server } = await import('../server')
    const server = new Server()
    await server.listen()
    await Promise.resolve()
    await Promise.resolve()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(connectMock).toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalled()
    expect(listen).not.toHaveBeenCalled()
  })
})
