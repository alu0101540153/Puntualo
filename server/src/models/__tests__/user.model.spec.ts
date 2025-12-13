import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { connect, disconnect } from '../../database/mongo'
import { UserModel } from '../user.model'

describe('User Model', () => {
  beforeAll(async () => {
    try {
      await connect()
    } catch (e) {
      console.log('DB connection failed in test')
    }
  })

  afterAll(async () => {
    try {
      await disconnect()
    } catch (e) {
      console.log('DB disconnect failed in test')
    }
  })

  it('should have user schema defined', () => {
    expect(UserModel).toBeDefined()
    expect(typeof UserModel).toBe('function')
  })

  it('should have required fields', () => {
    const schema = UserModel.schema.obj
    expect(schema).toHaveProperty('email')
    expect(schema).toHaveProperty('password')
    expect(schema).toHaveProperty('name')
  })

  it('should create a user instance', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      handle: 'testuser'
    }
    const user = new UserModel(userData)
    expect(user.name).toBe(userData.name)
    expect(user.email).toBe(userData.email)
  })

  it('should have timestamps', () => {
    const schema = UserModel.schema.obj
    expect(UserModel.schema.options.timestamps).toBe(true)
  })
})
