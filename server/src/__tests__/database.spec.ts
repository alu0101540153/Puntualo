import { describe, it, expect, vi, beforeEach } from 'vitest'

const dropDatabaseMock = vi.fn()
const connectMock = vi.fn()

vi.mock('mongoose', () => ({
  default: {
    set: vi.fn(),
    connection: { readyState: 1, dropDatabase: dropDatabaseMock }
  },
  connect: connectMock,
  Types: { ObjectId: vi.fn() }
}))

describe('database utilities', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.NODE_ENV = 'test'
    process.env.TEST_MONGO_URI = 'mongodb://localhost/test'
    process.env.TEST_DB_NAME = 'db_test'
  })

  it('connectDB connects with test URI', async () => {
    connectMock.mockResolvedValueOnce(undefined)
    const { connectDB } = await import('../database')
    await connectDB()
    expect(connectMock).toHaveBeenCalledWith('mongodb://localhost/test', { dbName: 'db_test' })
  })

  it('connectDB rethrows errors in test env', async () => {
    connectMock.mockRejectedValueOnce(new Error('fail'))
    const { connectDB } = await import('../database')
    await expect(connectDB()).rejects.toThrow('fail')
  })

  it('dropTestDatabase drops when ready', async () => {
    const { dropTestDatabase } = await import('../database')
    await dropTestDatabase()
    expect(dropDatabaseMock).toHaveBeenCalled()
  })
})
