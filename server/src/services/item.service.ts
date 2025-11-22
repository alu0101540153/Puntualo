import { ItemModel } from '../models'
import { ItemType } from '../models/enums'

export const itemService = {
  getAll: async()=>{
    return await ItemModel.find();
  },

  // Get items belonging to a specific user
  findByUser: async(userId: string)=>{
    return await ItemModel.find({ owner: userId });
  },
  
  // Get items belonging to a specific user filtered by itemType
  findByUserAndType: async(userId: string, itemType: string)=>{
    return await ItemModel.find({ owner: userId, itemType });
  },

  findByExternalId: async (externalId: string, itemType?: ItemType | string) => {
    const query: any = { externalId };
    if (itemType) {
      query.itemType = itemType;
    }
    return await ItemModel.findOne(query);
  },

  // Create an item and attach owner if provided
  create: async(entity: any, ownerId?: string)=>{
    const payload = ownerId ? { ...entity, owner: ownerId } : entity;
    return await ItemModel.create(payload);
  },

  // Update only if the item belongs to the provided ownerId. Returns the updated doc.
  update: async(id:string, body:object, ownerId?: string)=>{
    if (ownerId) {
      return await ItemModel.findOneAndUpdate({ _id: id, owner: ownerId }, body, { new: true });
    }
    return await ItemModel.findByIdAndUpdate(id, body, { new: true });
  },

  // Delete only if the item belongs to the provided ownerId.
  delete: async(id:string, ownerId?: string)=>{
    if (ownerId) {
      return await ItemModel.findOneAndDelete({ _id: id, owner: ownerId });
    }
    return await ItemModel.findByIdAndDelete(id);
  }
}