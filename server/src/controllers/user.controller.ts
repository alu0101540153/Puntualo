import { Response, Request } from 'express'

import { userService } from '../services'
import { recommendationService } from '../services'

export const userController = {
  getAllUser: async (req: Request, res: Response) => {
    try {
      const data = await userService.getAll();
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({
        message: error.message
      })
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const data = await userService.create(req.body);
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({
        message: error.message
      })
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await userService.update(id, req.body);
      return res.json(data);
    } catch (error: any) {
        // Si es error de contraseña incorrecta
        if (error && error.name === 'UnauthorizedError') {
          return res.status(401).json({ message: String(error.message || 'Contraseña incorrecta') })
        }

        // If service throws a ConflictError (e.g. handle already used), return 409 with a simple message
        if (error && (error.name === 'ConflictError' || /Handle ya en uso/i.test(String(error.message || '')))) {
          return res.status(409).json({ message: String(error.message || 'Conflict') })
        }

        // Default error
        res.status(400).json({ message: error.message })
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await userService.delete(id);
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({
        message: error.message
      })
    }
  },
  addRating: async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // user id
      const payload = req.body;
      const data = await userService.addRating(id, payload);
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
  ,
  getRatings: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const sortBy = (req.query.sortBy as string) || 'date'
      const order = (req.query.order as string) || 'desc'
      const data = await userService.getRatings(id, sortBy, order)
      return res.json(data)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
  ,
  deleteRating: async (req: Request, res: Response) => {
    try {
      const { id, ratingId } = req.params
      const data = await userService.removeRating(id, ratingId)
      return res.json(data)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
  ,
  getUserById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const data = await userService.getById(id)
      if (!data) return res.status(404).json({ message: 'User not found' })
      return res.json(data)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  getFollows: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const items = await userService.getFollowing(id)
      return res.json(items)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  getFollowers: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const items = await userService.getFollowers(id)
      return res.json(items)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  getFollowing: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const items = await userService.getFollowing(id)
      return res.json(items)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },
  getFeed: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const page = Number(req.query.page || 1) || 1
      const limit = Number(req.query.limit || 20) || 20
      const data = await userService.getFeed(id, page, limit)
      return res.json(data)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
  ,
  follow: async (req: Request, res: Response) => {
    try {
      const { id } = req.params // target to follow
      const me = (req as any).user
      if (!me || !me.id) return res.status(401).json({ message: 'Not authenticated' })
      const data = await userService.followUser(me.id, id)
      return res.json(data)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  unfollow: async (req: Request, res: Response) => {
    try {
      const { id } = req.params // target to unfollow
      const me = (req as any).user
      if (!me || !me.id) return res.status(401).json({ message: 'Not authenticated' })
      const data = await userService.unfollowUser(me.id, id)
      return res.json(data)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  addItem: async (req: Request, res: Response) => {
    try {
      const { id } = req.params // user id (must be owner)
      const payload = req.body
      const data = await userService.addItemToUser(id, payload)
      return res.json(data)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  deleteItem: async (req: Request, res: Response) => {
    try {
      const { id, itemId } = req.params // id=user id, itemId=subdocument id
      const data = await userService.removeItemFromUser(id, itemId)
      return res.json(data)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
  ,
  getRecommendations: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const page = Number(req.query.page || 1) || 1
      const limit = Number(req.query.limit || 20) || 20
      // For now we recalculate on demand (future: cache and recalc every X additions)
      const result = await recommendationService.getRecommendationsForUser(id, { page, limit })
      return res.json(result)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
  
}
