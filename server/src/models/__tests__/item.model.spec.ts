import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { connect, disconnect } from '../../database/mongo'
import { ItemModel } from '../item.model'

describe('Item Model', () => {
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

  it('should have item schema defined', () => {
    expect(ItemModel).toBeDefined()
    expect(typeof ItemModel).toBe('function')
  })

  it('should create an item instance', () => {
    const itemData = {
      title: 'Test Movie',
      itemType: 'movie',
      externalId: 'tmdb123'
    }
    const item = new ItemModel(itemData)
    expect(item.title).toBe(itemData.title)
    expect(item.itemType).toBe(itemData.itemType)
  })

  it('should have required fields', () => {
    const schema = ItemModel.schema.obj
    expect(schema).toHaveProperty('title')
    expect(schema).toHaveProperty('itemType')
  })

  it('should have data field for flexible storage', () => {
    const schema = ItemModel.schema.obj
    expect(schema).toHaveProperty('data')
  })
})
