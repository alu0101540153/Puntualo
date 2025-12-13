import { describe, it, expect } from 'vitest'

describe('index exports', () => {
  it('controllers index exports', async () => {
    const controllers = await import('../controllers')
    expect(controllers).toBeDefined()
    expect(controllers.itemController).toBeDefined()
    expect(controllers.userController).toBeDefined()
  })

  it('services index exports', async () => {
    const services = await import('../services')
    expect(services.itemService).toBeDefined()
    expect(services.userService).toBeDefined()
    expect(services.BookService).toBeDefined()
    expect(services.MovieService).toBeDefined()
    expect(services.SeriesService).toBeDefined()
    expect(services.sendEmail).toBeDefined()
    expect(services.sendRegisterEmail).toBeDefined()
    expect(services.sendFollowEmail).toBeDefined()
    expect(services.sendTemplateEmail).toBeDefined()
  })

  it('models index exports', async () => {
    const models = await import('../models')
    expect(models.ItemModel).toBeDefined()
    expect(models.UserModel).toBeDefined()
  })
})
