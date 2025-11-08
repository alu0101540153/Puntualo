import { UserModel } from '../models'

export const userService = {
  getAll: async () => {
    return await UserModel.find();
  },

  create: async (entity: object) => {
    return await UserModel.create(entity);
  },

  update: async (id: string, body: object) => {
    return await UserModel.findByIdAndUpdate(id, body);
  },

  delete: async (id: string) => {
    return await UserModel.findByIdAndDelete(id);
  }
}
