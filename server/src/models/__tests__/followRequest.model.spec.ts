import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { connect, disconnect } from '../../database/mongo'
import { FollowRequestModel } from '../followRequest.model'

describe('FollowRequest Model', () => {
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

  it('should have follow request schema defined', () => {
    expect(FollowRequestModel).toBeDefined()
    expect(typeof FollowRequestModel).toBe('function')
  })

  it('should create a follow request instance', () => {
    const requestData = {
      from: '507f1f77bcf86cd799439011',
      to: '507f1f77bcf86cd799439012',
      status: 'pending'
    }
    const followRequest = new FollowRequestModel(requestData)
    expect(followRequest.status).toBe('pending')
  })

  it('should have required fields', () => {
    const schema = FollowRequestModel.schema.obj
    expect(schema).toHaveProperty('from')
    expect(schema).toHaveProperty('to')
    expect(schema).toHaveProperty('status')
  })

  it('should default status to pending', () => {
    const followRequest = new FollowRequestModel({
      from: '507f1f77bcf86cd799439011',
      to: '507f1f77bcf86cd799439012'
    })
    expect(followRequest.status).toBe('pending')
  })
})
