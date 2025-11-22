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
}
