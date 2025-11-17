import { Response, Request } from 'express'

import { userService, itemService } from '../services'

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

  follow: async (req: Request, res: Response) => {
    try {
      const targetId = req.params.id;
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ message: 'No autenticado' });
      const data = await userService.addFollow(authUser.id, targetId);
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  unfollow: async (req: Request, res: Response) => {
    try {
      const targetId = req.params.id;
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ message: 'No autenticado' });
      const data = await userService.removeFollow(authUser.id, targetId);
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all books of a given user
  getBooks: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await itemService.findByUserAndType(id, 'book');
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get user by id with rated items populated
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await userService.getByIdWithRated(id);
      if (!data) return res.status(404).json({ message: 'Usuario no encontrado' });
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get feed for a user (books rated by people the user follows)
  getFeed: async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // user id for whom we compute feed
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const data = await userService.getFeed(id, page, limit);
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Rate an item (add/update rating for authenticated user)
  rateItem: async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ message: 'No autenticado' });
      const { id } = req.params; // itemId
      const { score, comment, status, itemType } = req.body;
      const data = await userService.rateItem(authUser.id, id, itemType, { score, comment, status });
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Rate an item with embedded item data (no Item document) - protected
  rateEmbedded: async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ message: 'No autenticado' });
      const { itemType, score, comment, status, itemData } = req.body;
      if (!itemType) return res.status(400).json({ message: 'itemType requerido' });
      const data = await userService.rateItem(authUser.id, undefined, itemType, { score, comment, status, itemData });
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Remove rating for an item
  unrateItem: async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ message: 'No autenticado' });
      const { id } = req.params; // itemId
      const data = await userService.unrateItem(authUser.id, id);
      return res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
