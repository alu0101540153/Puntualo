import { describe, it, expect } from 'vitest'
import * as controllers from '../controllers'

import { itemController } from '../controllers/item.controller'
import { userController } from '../controllers/user.controller'

describe('controllers index exports', () => {
  it('re-exports controllers', () => {
    expect(controllers.itemController).toBe(itemController)
    expect(controllers.userController).toBe(userController)
  })
})
