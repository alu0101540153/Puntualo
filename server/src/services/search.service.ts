import axios from 'axios';
import { itemService } from './item.service';
import { ItemType } from '../models/enums';

/*
  searchService

  - searchBooksByTitle: realiza una búsqueda por título en la Google Books API
    y devuelve tanto los items mapeados como la respuesta completa en `raw`.

  - fetchAndStoreBookByGoogleId: consulta la Google Books API por un volumen
    específico (usando su ID de Google Books), construye una entidad `Item`
    de tipo `book` y la almacena en la colección `items` usando `itemService.create`.

  Nota: los datos vienen de una fuente externa (Google). No se aplica sanitización
  profunda aquí — considerar validar/sanitizar campos antes de exponerlos en la API
  o de mostrarlos en el cliente.
*/

export const searchService = {
  searchBooksByTitle: async (title: string) => {
    if (!title) throw new Error('Title is required');

    const q = `intitle:${title}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=40`;

    const { data } = await axios.get(url);

    // Si no hay items, devolvemos la respuesta completa tal cual
    if (!data) return { total: 0, items: [], raw: data };

    // Mapeo ligero por compatibilidad
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
        thumbnail: v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null,
        infoLink: v.infoLink || ''
      };
    });

    // Devolvemos tanto el mapeo como la respuesta completa de Google en `raw`
    return { total: data.totalItems || items.length, items, raw: data };
  },

  // Consulta un volumen por su ID de Google Books y lo guarda en la colección `items`.
  fetchAndStoreBookByGoogleId: async (googleId: string) => {
    if (!googleId) throw new Error('googleId is required');

    const url = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleId)}`;
    const { data } = await axios.get(url).catch((err) => {
      // Propagar error con mensaje más claro
      throw new Error(`Google Books API error: ${err?.response?.status || err.message}`);
    });

    if (!data) throw new Error('Book not found');

    const v = data.volumeInfo || {};

    // Construimos la entidad acorde a item.model
    const entity: any = {
      itemType: ItemType.BOOK,
      title: v.title || 'Untitled',
      data: {
        type: 'book',
        cover: v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || '',
        description: v.description || '',
        author: (v.authors || []).join(', '),
        externalId: data.id || googleId
      }
    };

    // Guardamos en la base de datos usando el servicio existente de items
    const created = await itemService.create(entity);

    // Devolvemos tanto la respuesta cruda de Google como el documento creado en DB
    return { google: data, created };
  }
};
