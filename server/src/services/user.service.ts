import { UserModel } from '../models'
import argon2 from 'argon2'

export const userService = {
  getAll: async () => {
    return await UserModel.find()
  },

  create: async (entity: any) => {
    // 🔒 Hasheamos la contraseña antes de guardar
    if (entity.password) {
      entity.password = await argon2.hash(entity.password)
    }
    return await UserModel.create(entity)
  },

  update: async (id: string, body: any) => {
    // Si hay contraseña nueva, también la hasheamos
    if (body.password) {
      body.password = await argon2.hash(body.password)
    }
    return await UserModel.findByIdAndUpdate(id, body, { new: true, runValidators: true })
  },

  delete: async (id: string) => {
    return await UserModel.findByIdAndDelete(id)
  },

  // 🔹 Seguimiento entre usuarios
  addFollow: async (followerId: string, targetId: string) => {
    if (followerId === targetId) throw new Error('No puedes seguirte a ti mismo');
    return await UserModel.findByIdAndUpdate(
      followerId,
      { $addToSet: { follows: targetId } },
      { new: true }
    )
  },

  removeFollow: async (followerId: string, targetId: string) => {
    return await UserModel.findByIdAndUpdate(
      followerId,
      { $pull: { follows: targetId } },
      { new: true }
    )
  },

  // 🔹 Ratings
  rateItem: async (userId: string, itemId: string | undefined, itemType: string, payload: { score?: number; comment?: string; status?: string; itemData?: any }) => {
    const { score, comment, status, itemData } = payload;
    if (score !== undefined && (score < 0 || score > 10)) throw new Error('Score debe estar entre 0 y 10');

    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    let existing: any | undefined;
    if (itemId) {
      existing = (user as any).ratedItems?.find((r: any) => String(r.itemId) === String(itemId));
    } else if (itemData && itemData.externalId) {
      existing = (user as any).ratedItems?.find((r: any) => (r.itemData && r.itemData.externalId) === itemData.externalId);
    }

    if (existing) {
      if (score !== undefined) existing.score = score;
      if (comment !== undefined) existing.comment = comment;
      if (status !== undefined) existing.status = status;
      existing.lastModified = new Date();
      if (itemData) existing.itemData = itemData;
    } else {
      (user as any).ratedItems = (user as any).ratedItems || [];
      const entry: any = { itemType, score: score ?? 0, comment: comment ?? '', status: status ?? 'watching', lastModified: new Date() };
      if (itemId) entry.itemId = itemId;
      if (itemData) entry.itemData = itemData;
      (user as any).ratedItems.push(entry);
    }

    await user.save();
    return user;
  },

  unrateItem: async (userId: string, itemId: string) => {
    return await UserModel.findByIdAndUpdate(userId, { $pull: { ratedItems: { itemId } } }, { new: true });
  },

  unrateByExternalId: async (userId: string, externalId: string) => {
    return await UserModel.findByIdAndUpdate(userId, { $pull: { ratedItems: { 'itemData.externalId': externalId } } }, { new: true });
  },

  getRatings: async (userId: string, sortBy: string = 'date', order: string = 'desc') => {
    const user = await UserModel.findById(userId).populate('ratedItems.itemId').lean()
    if (!user) return []
    const items = (user.ratedItems || []) as any[]
    const dir = order === 'asc' ? 1 : -1

    if (sortBy === 'score') {
      items.sort((a: any, b: any) => {
        const sa = (a && a.score != null) ? Number(a.score) : 0
        const sb = (b && b.score != null) ? Number(b.score) : 0
        return dir * (sa - sb)
      })
    } else {
      items.sort((a: any, b: any) => {
        const ta = a && a.lastModified ? new Date(a.lastModified).getTime() : 0
        const tb = b && b.lastModified ? new Date(b.lastModified).getTime() : 0
        return dir * (ta - tb)
      })
    }

    return items
  },

  getByIdWithRated: async (id: string) => {
    return await UserModel.findById(id).populate('ratedItems.itemId');
  },

  getFeed: async (userId: string, page = 1, limit = 20) => {
    const user = await UserModel.findById(userId).lean();
    if (!user) throw new Error('Usuario no encontrado');

    const follows = (user as any).follows || [];
    if (follows.length === 0) return [];

    const followedUsers = await UserModel.find({ _id: { $in: follows } })
      .select('name handle ratedItems')
      .populate('ratedItems.itemId')
      .lean();

    const feed: any[] = [];

    followedUsers.forEach((fu: any) => {
      const rated = fu.ratedItems || [];
      rated.forEach((r: any) => {
        if (r.itemType === 'book') {
          const item = r.itemId || r.itemData || null;
          feed.push({
            user: { id: fu._id, name: fu.name, handle: fu.handle },
            item,
            score: r.score,
            comment: r.comment,
            status: r.status,
            lastModified: r.lastModified
          });
        }
      });
    });

    feed.sort((a, b) => {
      const da = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const db = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return db - da;
    });

    const total = feed.length;
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 20);
    const start = (p - 1) * l;
    const end = start + l;
    const items = feed.slice(start, end);

    return { items, total, page: p, limit: l };
  },

  // 🔹 Usuarios recientes
  getRecentUsers: async (page = 1, limit = 10) => {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Math.min(100, Number(limit) || 10));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      UserModel.find()
        .select('-password')
        .sort({ _id: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      UserModel.countDocuments()
    ]);

    return { items, total, page: p, limit: l };
  },

  searchUsers: async (term: string, page = 1, limit = 10) => {
    const q = (term || '').trim();
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Math.min(100, Number(limit) || 10));
    const skip = (p - 1) * l;

    const matchStage: any = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      matchStage.$or = [{ name: regex }, { handle: regex }, { email: regex }];
    }

    const pipeline: any[] = [];
    if (q) pipeline.push({ $match: matchStage });
    pipeline.push({ $sort: { _id: -1 } });
    pipeline.push({ $group: { _id: { $toLower: '$name' }, doc: { $first: '$$ROOT' } } });
    pipeline.push({ $replaceRoot: { newRoot: '$doc' } });

    const countAgg = await UserModel.aggregate([...pipeline, { $count: 'count' }]);
    const total = (countAgg && countAgg[0] && countAgg[0].count) ? countAgg[0].count : 0;

    const itemsAgg = await UserModel.aggregate([
      ...pipeline,
      { $project: { password: 0 } },
      { $skip: skip },
      { $limit: l }
    ]);

    return { items: itemsAgg, total, page: p, limit: l };
  }
}
