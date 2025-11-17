import {Response, Request} from 'express'
import {itemService, userService} from '../services'

export const itemController = {
  getAllItem: async(req:Request, res:Response)=>{
    try {
      const data = await itemService.getAll();
      return res.json(data);
    } catch (error:any) {
      res.status(400).json({
        message: error.message
      })
    }
  },

  // Get items for the authenticated user
  getMyItems: async(req:Request, res:Response)=>{
    try {
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ message: 'No autenticado' });
      const data = await itemService.findByUser(authUser.id);
      return res.json(data);
    } catch (error:any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Create endpoint now adds a rated-item to the authenticated user (embedded),
  // instead of creating a document in the Item collection.
  create: async(req:Request, res:Response)=>{
    try {
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ message: 'No autenticado' });

      // Expected body: { itemType, score?, comment?, status?, itemData }
      const { itemType, score, comment, status, itemData } = req.body;
      if (!itemType) return res.status(400).json({ message: 'itemType requerido' });

      const user = await userService.rateItem(authUser.id, undefined, itemType, { score, comment, status, itemData });
      return res.json(user);
    } catch (error:any) {
      res.status(400).json({
        message: error.message
      })
    }
  },

  update: async(req:Request, res:Response)=>{
    try {
      const {id} = req.params;
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ message: 'No autenticado' });
      const data = await itemService.update(id, req.body, authUser.id);
      if (!data) return res.status(404).json({ message: 'Item no encontrado o no tienes permiso' });
      return res.json(data);
    } catch (error:any) {
      res.status(400).json({
        message: error.message
      })
    }
  },

  delete: async(req:Request, res:Response)=>{
    try {
      const {id} = req.params;
      const authUser = (req as any).user;
      if (!authUser) return res.status(401).json({ message: 'No autenticado' });
      const data = await itemService.delete(id, authUser.id);
      if (!data) return res.status(404).json({ message: 'Item no encontrado o no tienes permiso' });
      return res.json(data);
    } catch (error:any) {
      res.status(400).json({
        message: error.message
      })
    }
  },
}
