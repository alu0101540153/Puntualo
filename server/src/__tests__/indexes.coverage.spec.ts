import { describe, it, expect } from 'vitest'

import * as controllersIndex from '../controllers/index'
import * as modelsIndex from '../models/index'

describe('indexes coverage', () => {
  it('controllers index exports expected controllers', () => {
    expect(controllersIndex).toHaveProperty('itemController')
    expect(controllersIndex).toHaveProperty('userController')
  })

  it('models index exports models', () => {
    expect(modelsIndex).toHaveProperty('ItemModel')
    expect(modelsIndex).toHaveProperty('UserModel')
  })
})
