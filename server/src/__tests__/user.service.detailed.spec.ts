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

describe('userService detailed tests', () => {
  describe('getAll', () => {
    it('returns empty array when no users', async () => {
      const users = await userService.getAll()
      expect(users).toHaveLength(0)
    })

    it('returns all users', async () => {
      await UserModel.create({ name: 'User1', email: 'u1@test.com', handle: 'u1', password: 'pass' })
      await UserModel.create({ name: 'User2', email: 'u2@test.com', handle: 'u2', password: 'pass' })
      const users = await userService.getAll()
      expect(users).toHaveLength(2)
    })
  })

  describe('create', () => {
    it('creates user with minimal fields', async () => {
      const user = await userService.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      expect(user.email).toBe('test@test.com')
    })

    it('hashes password on creation', async () => {
      const user = await userService.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'plaintext' })
      expect(user.password).not.toBe('plaintext')
    })

    it('creates user with avatarBgColor', async () => {
      const user = await userService.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass', avatarBgColor: '#FF0000' })
      expect(user.avatarBgColor).toBe('#FF0000')
    })
  })

  describe('update', () => {
    it('updates user name', async () => {
      const user = await UserModel.create({ name: 'Old', email: 'test@test.com', handle: 'test', password: 'pass' })
      const updated = await userService.update(user._id.toString(), { name: 'New' })
      expect(updated?.name).toBe('New')
    })

    it('updates user email', async () => {
      const user = await UserModel.create({ name: 'User', email: 'old@test.com', handle: 'test', password: 'pass' })
      const updated = await userService.update(user._id.toString(), { email: 'new@test.com' })
      expect(updated?.email).toBe('new@test.com')
    })

    it('normalizes handle to lowercase', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const updated = await userService.update(user._id.toString(), { handle: 'NewHandle' })
      expect(updated?.handle).toBe('newhandle')
    })

    it('trims whitespace from handle', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const updated = await userService.update(user._id.toString(), { handle: '  trimmed  ' })
      expect(updated?.handle).toBe('trimmed')
    })
  })

  describe('delete', () => {
    it('deletes existing user', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      await userService.delete(user._id.toString())
      const found = await UserModel.findById(user._id)
      expect(found).toBeNull()
    })

    it('returns null when deleting non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString()
      const result = await userService.delete(fakeId)
      expect(result).toBeNull()
    })
  })

  describe('followUser', () => {
    it('adds target to follows array', async () => {
      const user1 = await UserModel.create({ name: 'User1', email: 'u1@test.com', handle: 'u1', password: 'pass' })
      const user2 = await UserModel.create({ name: 'User2', email: 'u2@test.com', handle: 'u2', password: 'pass' })
      const result = await userService.followUser(user1._id.toString(), user2._id.toString())
      const followIds = result?.follows?.map((id: any) => id.toString()) || []
      expect(followIds).toContain(user2._id.toString())
    })

    it('does not duplicate follows', async () => {
      const user1 = await UserModel.create({ name: 'User1', email: 'u1@test.com', handle: 'u1', password: 'pass' })
      const user2 = await UserModel.create({ name: 'User2', email: 'u2@test.com', handle: 'u2', password: 'pass' })
      await userService.followUser(user1._id.toString(), user2._id.toString())
      await userService.followUser(user1._id.toString(), user2._id.toString())
      const user = await UserModel.findById(user1._id)
      expect(user?.follows).toHaveLength(1)
    })

    it('can follow multiple users', async () => {
      const user1 = await UserModel.create({ name: 'User1', email: 'u1@test.com', handle: 'u1', password: 'pass' })
      const user2 = await UserModel.create({ name: 'User2', email: 'u2@test.com', handle: 'u2', password: 'pass' })
      const user3 = await UserModel.create({ name: 'User3', email: 'u3@test.com', handle: 'u3', password: 'pass' })
      await userService.followUser(user1._id.toString(), user2._id.toString())
      await userService.followUser(user1._id.toString(), user3._id.toString())
      const user = await UserModel.findById(user1._id)
      expect(user?.follows).toHaveLength(2)
    })
  })

  describe('unfollowUser', () => {
    it('removes target from follows array', async () => {
      const user1 = await UserModel.create({ name: 'User1', email: 'u1@test.com', handle: 'u1', password: 'pass' })
      const user2 = await UserModel.create({ name: 'User2', email: 'u2@test.com', handle: 'u2', password: 'pass' })
      await userService.followUser(user1._id.toString(), user2._id.toString())
      await userService.unfollowUser(user1._id.toString(), user2._id.toString())
      const user = await UserModel.findById(user1._id)
      expect(user?.follows).toHaveLength(0)
    })

    it('handles unfollowing when not following', async () => {
      const user1 = await UserModel.create({ name: 'User1', email: 'u1@test.com', handle: 'u1', password: 'pass' })
      const user2 = await UserModel.create({ name: 'User2', email: 'u2@test.com', handle: 'u2', password: 'pass' })
      const result = await userService.unfollowUser(user1._id.toString(), user2._id.toString())
      expect(result?.follows).toHaveLength(0)
    })
  })

  describe('addItemToUser', () => {
    it('adds item with itemId', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addItemToUser(user._id.toString(), { itemId, itemType: 'book', title: 'Test Book' })
      expect(result?.items).toHaveLength(1)
      expect(result?.items[0].title).toBe('Test Book')
    })

    it('adds item with externalId', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const result = await userService.addItemToUser(user._id.toString(), { externalId: 'ext123', itemType: 'movie', title: 'Test Movie' })
      expect(result?.items).toHaveLength(1)
      expect(result?.items[0].externalId).toBe('ext123')
    })

    it('adds item with addedAt timestamp', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const result = await userService.addItemToUser(user._id.toString(), { itemType: 'series', title: 'Test Series' })
      expect(result?.items[0].addedAt).toBeInstanceOf(Date)
    })
  })

  describe('removeItemFromUser', () => {
    it('removes item by subdocument id', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const updated = await userService.addItemToUser(user._id.toString(), { itemType: 'book', title: 'Test' })
      const itemSubId = updated?.items[0]._id.toString()
      await userService.removeItemFromUser(user._id.toString(), itemSubId!)
      const final = await UserModel.findById(user._id)
      expect(final?.items).toHaveLength(0)
    })
  })

  describe('addRating', () => {
    it('adds rating with score', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 7.5 })
      expect(result?.ratedItems[0].score).toBe(7.5)
    })

    it('adds rating with comment', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 8, comment: 'Great!' })
      expect(result?.ratedItems[0].comment).toBe('Great!')
    })

    it('adds rating with status', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'movie', score: 9, status: 'completed' })
      expect(result?.ratedItems[0].status).toBe('completed')
    })

    it('normalizes decimal score', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 7.777 })
      expect(result?.ratedItems[0].score).toBe(7.8)
    })

    it('sets lastModified on new rating', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 7 })
      expect(result?.ratedItems[0].lastModified).toBeInstanceOf(Date)
    })

    it('updates lastModified when updating rating', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 5 })
      await new Promise(resolve => setTimeout(resolve, 10))
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 9 })
      expect(result?.ratedItems[0].score).toBe(9)
    })

    it('handles score of 0', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 0 })
      expect(result?.ratedItems[0].score).toBe(0)
    })

    it('handles score of 10', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 10 })
      expect(result?.ratedItems[0].score).toBe(10)
    })

    it('handles empty string score', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: '' as any })
      expect(result?.ratedItems[0].score).toBeUndefined()
    })

    it('handles null score', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const result = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: null as any })
      expect(result?.ratedItems[0].score).toBeUndefined()
    })
  })

  describe('getRatings', () => {
    it('returns empty array for user with no ratings', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const ratings = await userService.getRatings(user._id.toString())
      expect(ratings).toEqual([])
    })

    it('sorts by date descending by default', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const id1 = new mongoose.Types.ObjectId()
      const id2 = new mongoose.Types.ObjectId()
      await userService.addRating(user._id.toString(), { itemId: id1, itemType: 'book', score: 5 })
      await new Promise(resolve => setTimeout(resolve, 10))
      await userService.addRating(user._id.toString(), { itemId: id2, itemType: 'book', score: 8 })
      const ratings = await userService.getRatings(user._id.toString(), 'date', 'desc')
      expect(ratings[0].score).toBe(8)
    })

    it('sorts by date ascending', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const id1 = new mongoose.Types.ObjectId()
      const id2 = new mongoose.Types.ObjectId()
      await userService.addRating(user._id.toString(), { itemId: id1, itemType: 'book', score: 5 })
      await new Promise(resolve => setTimeout(resolve, 10))
      await userService.addRating(user._id.toString(), { itemId: id2, itemType: 'book', score: 8 })
      const ratings = await userService.getRatings(user._id.toString(), 'date', 'asc')
      expect(ratings[0].score).toBe(5)
    })
  })

  describe('removeRating', () => {
    it('removes rating by id', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const updated = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 5 })
      const ratingId = updated?.ratedItems[0]._id.toString()
      await userService.removeRating(user._id.toString(), ratingId!)
      const final = await UserModel.findById(user._id)
      expect(final?.ratedItems).toHaveLength(0)
    })
  })

  describe('deleteRating', () => {
    it('deletes rating successfully', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const itemId = new mongoose.Types.ObjectId()
      const updated = await userService.addRating(user._id.toString(), { itemId, itemType: 'book', score: 5 })
      const ratingId = updated?.ratedItems[0]._id.toString()
      await userService.deleteRating(user._id.toString(), ratingId!)
      const final = await UserModel.findById(user._id)
      expect(final?.ratedItems).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('returns user with populated fields', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const result = await userService.getById(user._id.toString())
      expect(result?.name).toBe('User')
    })

    it('excludes password field', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const result = await userService.getById(user._id.toString()) as any
      expect(result?.password).toBeUndefined()
    })
  })

  describe('getFollows', () => {
    it('returns follows with populated data', async () => {
      const user1 = await UserModel.create({ name: 'User1', email: 'u1@test.com', handle: 'u1', password: 'pass' })
      const user2 = await UserModel.create({ name: 'User2', email: 'u2@test.com', handle: 'u2', password: 'pass' })
      await userService.followUser(user1._id.toString(), user2._id.toString())
      const follows = await userService.getFollows(user1._id.toString())
      expect(follows).toHaveLength(1)
    })
  })

  describe('getFeed', () => {
    it('returns paginated feed', async () => {
      const user1 = await UserModel.create({ name: 'User1', email: 'u1@test.com', handle: 'u1', password: 'pass' })
      const user2 = await UserModel.create({ name: 'User2', email: 'u2@test.com', handle: 'u2', password: 'pass' })
      await userService.followUser(user1._id.toString(), user2._id.toString())
      const feed = await userService.getFeed(user1._id.toString(), 1, 10)
      expect(feed.page).toBe(1)
      expect(feed.limit).toBe(10)
    })

    it('calculates correct skip for page 2', async () => {
      const user = await UserModel.create({ name: 'User', email: 'test@test.com', handle: 'test', password: 'pass' })
      const feed = await userService.getFeed(user._id.toString(), 2, 20)
      expect(feed.page).toBe(2)
    })
  })
})
