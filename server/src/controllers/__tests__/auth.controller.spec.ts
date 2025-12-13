import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { authController } from '../auth.controller'
import { authService } from '../../services/auth.service'
import { userService, sendRegisterEmail } from '../../services'

vi.mock('../../services/auth.service')
vi.mock('../../services')

describe('authController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    mockReq = {
      body: {}
    }
    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  describe('login', () => {
    it('should login successfully', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' }
      const mockResult = { user: { _id: '1', email: 'test@example.com' }, token: 'test-token' }
      vi.mocked(authService.login).mockResolvedValue(mockResult)

      await authController.login(mockReq as Request, mockRes as Response)

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(jsonMock).toHaveBeenCalledWith(mockResult)
    })

    it('should return 401 for invalid credentials', async () => {
      mockReq.body = { email: 'test@example.com', password: 'wrong' }
      const error = new Error('Usuario no encontrado')
      vi.mocked(authService.login).mockRejectedValue(error)

      await authController.login(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Usuario no encontrado' })
    })

    it('should return 400 for other errors', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password' }
      const error = new Error('Database error')
      vi.mocked(authService.login).mockRejectedValue(error)

      await authController.login(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        handle: 'johndoe'
      }
      const mockUser = {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        handle: 'johndoe',
        toObject: () => ({
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          handle: 'johndoe'
        })
      }
      vi.mocked(userService.create).mockResolvedValue(mockUser as any)
      vi.mocked(authService.generateToken).mockReturnValue('test-token')
      vi.mocked(sendRegisterEmail).mockResolvedValue(undefined)

      await authController.register(mockReq as Request, mockRes as Response)

      expect(userService.create).toHaveBeenCalledWith(mockReq.body)
      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        user: expect.objectContaining({
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        }),
        token: 'test-token'
      })
    })

    it('should return 409 for duplicate email', async () => {
      mockReq.body = { email: 'duplicate@example.com', password: 'pass' }
      const error: any = new Error('Duplicate key')
      error.code = 11000
      error.keyValue = { email: 'duplicate@example.com' }
      vi.mocked(userService.create).mockRejectedValue(error)

      await authController.register(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(409)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Ya existe un usuario registrado con ese correo electrónico.',
        field: 'email'
      })
    })

    it('should return 409 for duplicate handle', async () => {
      mockReq.body = { email: 'test@example.com', handle: 'existinghandle' }
      const error: any = new Error('Duplicate key')
      error.code = 11000
      error.keyValue = { handle: 'existinghandle' }
      vi.mocked(userService.create).mockRejectedValue(error)

      await authController.register(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(409)
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'El nombre de usuario ya está en uso.',
        field: 'handle'
      })
    })

    it('should return 400 for validation errors', async () => {
      mockReq.body = { email: 'invalid' }
      const error = new Error('Validation failed')
      vi.mocked(userService.create).mockRejectedValue(error)

      await authController.register(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Validation failed' })
    })
  })
})
