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

  // Add a user to the 'follows' array of followerId (avoid duplicates)
  addFollow: async (followerId: string, targetId: string) => {
    if (followerId === targetId) throw new Error('No puedes seguirte a ti mismo');
    return await UserModel.findByIdAndUpdate(
      followerId,
      { $addToSet: { follows: targetId } },
      { new: true }
    )
  },

  // Remove a user from the 'follows' array
  removeFollow: async (followerId: string, targetId: string) => {
    return await UserModel.findByIdAndUpdate(
      followerId,
      { $pull: { follows: targetId } },
      { new: true }
    )
  },

  // Return rated items for a user or full user with populated ratedItems
  getByIdWithRated: async (id: string) => {
    return await UserModel.findById(id).populate('ratedItems.itemId');
  },

  // Get feed for a user: collect rated books from users they follow,
  // populate item data and return flat list ordered by lastModified desc
  // Returns paginated feed. page and limit are 1-based and optional.
  getFeed: async (userId: string, page = 1, limit = 20) => {
    const user = await UserModel.findById(userId).lean();
    if (!user) throw new Error('Usuario no encontrado');

    const follows = (user as any).follows || [];
    if (follows.length === 0) return [];

    // Load followed users with their ratedItems populated
    const followedUsers = await UserModel.find({ _id: { $in: follows } })
      .select('name handle ratedItems')
      .populate('ratedItems.itemId')
      .lean();

    const feed: any[] = [];

    followedUsers.forEach((fu: any) => {
      const rated = fu.ratedItems || [];
      rated.forEach((r: any) => {
        // Only include books in the feed
        if (r.itemType === 'book') {
          // Use populated item document if present, otherwise fall back to embedded itemData
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

    // Sort by lastModified desc
    feed.sort((a, b) => {
      const da = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const db = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return db - da;
    });

    // Pagination (page is 1-based)
    const total = feed.length;
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 20);
    const start = (p - 1) * l;
    const end = start + l;
    const items = feed.slice(start, end);

    return { items, total, page: p, limit: l };
  },

  // Add or update a rating entry for a user's ratedItems array
  // itemId can be undefined when providing embedded itemData inside payload
  rateItem: async (userId: string, itemId: string | undefined, itemType: string, payload: { score?: number; comment?: string; status?: string; itemData?: any }) => {
    const { score, comment, status, itemData } = payload;
    // Ensure score range if provided
    if (score !== undefined && (score < 0 || score > 10)) throw new Error('Score debe estar entre 0 y 10');

    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    // Try to find existing rating either by itemId or by itemData.externalId when no itemId
    let existing: any | undefined;
    if (itemId) {
      existing = (user as any).ratedItems?.find((r: any) => String(r.itemId) === String(itemId));
    } else if (itemData && itemData.externalId) {
      existing = (user as any).ratedItems?.find((r: any) => (r.itemData && r.itemData.externalId) === itemData.externalId);
    }
    if (existing) {
      // update fields
      if (score !== undefined) existing.score = score;
      if (comment !== undefined) existing.comment = comment;
      if (status !== undefined) existing.status = status;
      existing.lastModified = new Date();
      // update itemData if provided
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

  // Remove rating for an item from user's ratedItems
  unrateItem: async (userId: string, itemId: string) => {
    return await UserModel.findByIdAndUpdate(userId, { $pull: { ratedItems: { itemId } } }, { new: true });
  },

  // Remove rating by embedded itemData.externalId
  unrateByExternalId: async (userId: string, externalId: string) => {
    return await UserModel.findByIdAndUpdate(userId, { $pull: { ratedItems: { 'itemData.externalId': externalId } } }, { new: true });
  }
}
