import axios from 'axios';
import { ItemType } from '../models/enums';
import { itemService } from './item.service';

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
  searchBooksByTitle: async (title: string) => {
    if (!title) throw new Error('Title is required');

    const q = `intitle:${title}`;
  // Pedimos un máximo de 8 resultados para limitar el tamaño de la respuesta
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8`;

    const { data } = await axios.get(url);

    // Si no hay items, devolvemos la respuesta completa tal cual
    if (!data) return { total: 0, items: [], raw: data };

    // Mapeo ligero por compatibilidad
  const items = (data.items || []).slice(0, 8).map((it: any) => {
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

    // Devolvemos tanto el mapeo como la respuesta completa de Google en `raw`
    return { total: data.totalItems || items.length, items, raw: data };
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
