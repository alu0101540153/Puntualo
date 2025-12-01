import {Response, Request} from 'express'
import {itemService} from '../services'

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

  create: async(req:Request, res:Response)=>{
    try {
      const data = await itemService.create(req.body);
      return res.json(data);
    } catch (error:any) {
      res.status(400).json({
        message: error.message
      })
    }
  },

  update: async(req:Request, res:Response)=>{
    try {
      const {id} = req.params;
      const data = await itemService.update(id, req.body);
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
      const data = await itemService.delete(id);
      return res.json(data);
    } catch (error:any) {
      res.status(400).json({
        message: error.message
      })
    }
  },
  getById: async(req:Request, res:Response)=>{
    try {
      const {id} = req.params;
      const data = await itemService.getById(id);
      if(!data) return res.status(404).json({ message: 'Item not found' })
      return res.json(data);
    } catch (error:any) {
      res.status(400).json({
        message: error.message
      })
    }
  },
  getFriendsRatings: async (req: Request, res: Response) => {
    try {
      // verifyToken middleware attaches req.user { id }
      const me = (req as any).user
      if (!me || !me.id) return res.status(401).json({ message: 'Not authenticated' })
      const itemId = req.params.id
      if (!itemId) return res.status(400).json({ message: 'Item id required' })

      const data = await itemService.getFriendsRatingsForItem(me.id, itemId)
      return res.json({ items: data, total: Array.isArray(data) ? data.length : 0 })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },
  getTop: async (req: Request, res: Response) => {
    try {
      const { type, limit } = req.query
      const t = type ? String(type) : undefined
      const l = limit ? Number(limit) : 5
      const data = await itemService.getTop(t, l)
      return res.json(data)
    } catch (error: any) {
      return res.status(400).json({ message: error.message })
    }
  },
}
