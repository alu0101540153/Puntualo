import { Response, Request } from 'express'

import { userService } from '../services'

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
      res.status(400).json({
        message: error.message
      })
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
  
}
