import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { connect, disconnect } from '../../database/mongo'
import { NotificationModel } from '../notification.model'

describe('Notification Model', () => {
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

  it('should have notification schema defined', () => {
    expect(NotificationModel).toBeDefined()
    expect(typeof NotificationModel).toBe('function')
  })

  it('should create a notification instance', () => {
    const notificationData = {
      user: '507f1f77bcf86cd799439011',
      type: 'follow_request',
      message: 'Test notification',
      read: false
    }
    const notification = new NotificationModel(notificationData)
    expect(notification.message).toBe(notificationData.message)
    expect(notification.read).toBe(false)
  })

  it('should have required fields', () => {
    const schema = NotificationModel.schema.obj
    expect(schema).toHaveProperty('user')
    expect(schema).toHaveProperty('message')
    expect(schema).toHaveProperty('read')
  })

  it('should default read to false', () => {
    const notification = new NotificationModel({
      user: '507f1f77bcf86cd799439011',
      message: 'Test',
      type: 'info'
    })
    expect(notification.read).toBe(false)
  })
})
