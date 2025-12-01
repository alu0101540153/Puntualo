import axios from 'axios';
import { ItemType } from '../models/enums';
import { itemService } from './item.service';
import { ItemModel } from '../models';

/*
  BookService

  - searchBooksByTitle: realiza una búsqueda por título en la Google Books API
    y devuelve tanto los items mapeados como la respuesta completa en `raw`.

  - fetchAndStoreBookByGoogleId: consulta la Google Books API por un volumen
    específico (usando su ID de Google Books), construye una entidad `Item`
    de tipo `book` y la almacena en la colección `items` usando `itemService.create`.

  Nota: los datos vienen de una fuente externa (Google). No se aplica sanitización
  profunda aquí — considerar validar/sanitizar campos antes de exponerlos en la API
  o de mostrarlos en el cliente.
*/

export const BookService = {
  searchBooksByTitle: async (title: string, page = 1, genre?: string) => {
    // If title provided, use Google Books API as before.
    const maxResults = 10;
    if (title && title.trim()) {
      const q = `intitle:${title}`;
      const startIndex = (Math.max(1, page) - 1) * maxResults;
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        q
      )}&startIndex=${startIndex}&maxResults=${maxResults}`;

      const { data } = await axios.get(url);
      if (!data) return { total: 0, items: [], raw: data };

      const items = (data.items || []).map((it: any) => {
        const v = it.volumeInfo || {};
        return {
          id: it.id,
          title: v.title || '',
          authors: v.authors || [],
          publisher: v.publisher || '',
          publishedDate: v.publishedDate || '',
          description: v.description || '',
          pageCount: v.pageCount || null,
          categories: v.categories || [],
          genres: v.categories || [],
          thumbnail: v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null,
          infoLink: v.infoLink || ''
        };
      });

      return { total: data.totalItems || items.length, items, raw: data };
    }

    // No title provided: return items from our DB filtered by book type, paginated
    const serverPage = Math.max(1, page);
    const start = (serverPage - 1) * maxResults;
    let baseFilter: any = { $or: [ { itemType: 'book' }, { 'data.type': 'book' } ] };
    // apply genre filter when provided (case-insensitive match inside data.genres array)
    if (genre && genre.trim()) {
      // escape regex special chars
      const esc = String(genre).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${esc}$`, 'i');
      baseFilter = { $and: [ baseFilter, { 'data.genres': { $in: [regex] } } ] };
    }

    const total = await ItemModel.countDocuments(baseFilter);
    const docs = await ItemModel.find(baseFilter).skip(start).limit(maxResults).lean();

    const items = (docs || []).map((d: any) => ({
      id: d._id,
      title: d.title || '',
      authors: [],
      publisher: '',
      publishedDate: '',
      description: d.data?.description || '',
      pageCount: null,
      categories: d.data?.genres || [],
      genres: d.data?.genres || [],
      thumbnail: d.data?.cover || '',
      infoLink: ''
    }));

    return { total: total || items.length, items, raw: { source: 'db' } };
  },


  fetchBookByGoogleId: async (googleId: string) => {
    if (!googleId) throw new Error('googleId is required');

  // 1) Comprobar si ya existe en la BD por externalId (solo books)
  const existing = await itemService.findByExternalId(googleId, ItemType.BOOK);
    if (existing) {
      // Si ya existe, devolvemos el item almacenado y no intentamos crear duplicados
      return { item: existing, raw: null, fromDb: true };
    }

    // 2) Si no existe, consultar Google Books y crear el registro
    const url = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleId)}`;

    const { data } = await axios.get(url);

    // Si no hay datos, devolvemos null en item y el raw tal cual
    if (!data) return { item: null, raw: data };

    const v = data.volumeInfo || {};

    // Construir la entidad para persistir en la colección `items`
    const entity: any = {
      itemType: ItemType.BOOK,
      title: v.title || 'Untitled',
      data: {
        type: 'book',
        cover: v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || '',
        description: v.description || '',
        author: Array.isArray(v.authors) ? v.authors.join(', ') : (v.authors || '').toString(),
        genres: v.categories || []
      },
      // Guardamos el ID de Google como externalId para futuras búsquedas
      externalId: data.id
    };

    // Persistir en la BD
    const created = await itemService.create(entity);

    // Devolver el item creado y la respuesta cruda de Google
    return { item: created, raw: data, fromDb: false };
  }
};
