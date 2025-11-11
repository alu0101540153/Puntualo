import { ItemModel } from '../models'
import { ItemType } from '../models/enums'

export const itemService = {
  getAll: async()=>{
    return await ItemModel.find();
  },


  findByExternalId: async (externalId: string, itemType?: ItemType | string) => {
    const query: any = { externalId };
    if (itemType) {
      query.itemType = itemType;
    }
    return await ItemModel.findOne(query);
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
