import { ItemModel } from '../models'

export const itemService = {
  getAll: async()=>{
    return await ItemModel.find();
  },

  create: async(entity: object)=>{
    return await ItemModel.create(entity);
  },

  update: async(id:string, body:object)=>{
    return await ItemModel.findByIdAndUpdate(id, body);
  },

  delete: async(id:string)=>{
    return await ItemModel.findByIdAndDelete(id);
  }
}
