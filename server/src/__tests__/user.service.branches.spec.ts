import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { connectDB, dropTestDatabase } from '../database'
import { UserModel } from '../models'
import { userService } from '../services/user.service'

beforeAll(async () => {
  await connectDB()
})

beforeEach(async () => {
  await dropTestDatabase()
})

afterAll(async () => {
  await dropTestDatabase()
  await mongoose.connection.close()
})

describe('user.service branches', () => {
  it('update throws ConflictError when handle already exists', async () => {
    const user1 = await UserModel.create({ name: 'User1', email: 'user1@test.com', handle: 'existing', password: 'pass' })
    const user2 = await UserModel.create({ name: 'User2', email: 'user2@test.com', handle: 'other', password: 'pass' })
    await expect(userService.update(user2._id.toString(), { handle: 'existing' })).rejects.toThrow('Handle ya en uso')
  })

  it('update hashes password when provided', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'old' })
    const updated = await userService.update(user._id.toString(), { password: 'newPass' })
    expect(updated?.password).not.toBe('newPass')
  })

  it('followUser returns same user when followerId equals targetId', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass' })
    const result = await userService.followUser(user._id.toString(), user._id.toString())
    expect(result?.follows).toHaveLength(0)
  })

  it('addRating handles invalid score gracefully', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass' })
    const itemId = 'test-item-id'
    const rating = { itemId, itemType: 'book', score: 'invalid', comment: 'test' }
    const result = await userService.addRating(user._id.toString(), rating)
    expect(result?.ratedItems).toHaveLength(1)
    expect(result?.ratedItems[0].score).toBeUndefined()
  })

  it('addRating normalizes score to [0,10] range', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass' })
    const mongoose = await import('mongoose')
    const itemId = new mongoose.default.Types.ObjectId()
    const result1 = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 15 })
    expect(result1?.ratedItems[0].score).toBe(10)
    const otherId = new mongoose.default.Types.ObjectId()
    const result2 = await userService.addRating(user._id.toString(), { itemId: otherId, itemType: 'book', score: -5 })
    expect(result2?.ratedItems[1].score).toBe(0)
  })

  it('addRating removes score when undefined', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass' })
    const itemId = 'test-item-id'
    const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: undefined })
    expect(result?.ratedItems[0].score).toBeUndefined()
  })

  it('addRating updates existing rating when itemId matches', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass' })
    const itemId = 'test-item-id'
    await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 5 })
    const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 8, comment: 'updated' })
    expect(result?.ratedItems).toHaveLength(1)
    expect(result?.ratedItems[0].score).toBe(8)
    expect(result?.ratedItems[0].comment).toBe('updated')
  })

  it('addRating falls back to push when no itemId', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass' })
    const result = await userService.addRating(user._id.toString(), { itemType: 'book', score: 5 })
    expect(result?.ratedItems).toHaveLength(1)
  })

  it('getRatings sorts by score when sortBy=score', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass' })
    const mongoose = await import('mongoose')
    const id1 = new mongoose.default.Types.ObjectId()
    const id2 = new mongoose.default.Types.ObjectId()
    await userService.addRating(user._id.toString(), { itemId: id1, itemType: 'book', score: 5 })
    await userService.addRating(user._id.toString(), { itemId: id2, itemType: 'book', score: 8 })
    const ratings = await userService.getRatings(user._id.toString(), 'score', 'desc')
    expect(ratings[0].score).toBe(8)
    expect(ratings[1].score).toBe(5)
  })

  it('getRatings sorts ascending when order=asc', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass' })
    const mongoose = await import('mongoose')
    const id1 = new mongoose.default.Types.ObjectId()
    const id2 = new mongoose.default.Types.ObjectId()
    await userService.addRating(user._id.toString(), { itemId: id1, itemType: 'book', score: 5 })
    await userService.addRating(user._id.toString(), { itemId: id2, itemType: 'book', score: 8 })
    const ratings = await userService.getRatings(user._id.toString(), 'score', 'asc')
    expect(ratings[0].score).toBe(5)
    expect(ratings[1].score).toBe(8)
  })

  it('getFeed returns empty when user not found', async () => {
    const fakeId = new (await import('mongoose')).default.Types.ObjectId().toString()
    const result = await userService.getFeed(fakeId)
    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
  })

  it('getFeed returns empty when user has no follows', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass', follows: [] })
    const result = await userService.getFeed(user._id.toString())
    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
  })

  it('getFeed handles invalid ObjectId in follows array', async () => {
    const user = await UserModel.create({ name: 'User', email: 'user@test.com', handle: 'user', password: 'pass' })
    // Manually update to bypass validation
    await UserModel.collection.updateOne({ _id: user._id }, { $set: { follows: ['invalid-id'] } })
    const result = await userService.getFeed(user._id.toString())
    expect(result.items).toEqual([])
  })

  it('getFollows returns empty array when user not found', async () => {
    const fakeId = new (await import('mongoose')).default.Types.ObjectId().toString()
    const result = await userService.getFollows(fakeId)
    expect(result).toEqual([])
  })
})
