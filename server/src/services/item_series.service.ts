import axios from 'axios';
import { ItemType } from '../models/enums';
import { itemService } from './item.service';
import { TMDB_API_KEY } from '../config';

/*
  SeriesService

  - searchShowsByTitle: busca series en TMDB por título y devuelve un mapeo
    ligero junto con la respuesta cruda en `raw`.

  - fetchShowByTmdbId: consulta TMDB por el ID de la serie (añadiendo credits),
    construye una entidad `Item` de tipo `series` y la almacena en la BD usando
    `itemService.create`.

  Requiere la variable de entorno TMDB_API_KEY.
*/

export const SeriesService = {
  searchShowsByTitle: async (title: string) => {
    if (!title) throw new Error('Title is required');

    const apiKey = TMDB_API_KEY;
    if (!apiKey) throw new Error('TMDB_API_KEY is required');

    // Pedimos la página 1 y limitaremos localmente a 8 resultados
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${encodeURIComponent(
      apiKey
    )}&query=${encodeURIComponent(title)}&page=1`;

    const { data } = await axios.get(url);
    if (!data) return { total: 0, items: [], raw: data };

    // Limitamos a los primeros 8 resultados
    const items = (data.results || []).slice(0, 8).map((it: any) => ({
      id: it.id,
      title: it.name || it.original_name || '',
      release_date: it.first_air_date || '',
      overview: it.overview || '',
      genres: it.genre_ids || [],
      thumbnail: it.poster_path ? `https://image.tmdb.org/t/p/w500${it.poster_path}` : null,
      infoLink: `https://www.themoviedb.org/tv/${it.id}`
    }));

    return { total: data.total_results || items.length, items, raw: data };
  },

  fetchShowByTmdbId: async (tmdbId: string) => {
    if (!tmdbId) throw new Error('tmdbId is required');

    // 1) Comprobar si ya existe en la BD por externalId (solo series)
    const existing = await itemService.findByExternalId(tmdbId.toString(), ItemType.SERIES);
    if (existing) {
      return { item: existing, raw: null, fromDb: true };
    }

    const apiKey = TMDB_API_KEY;
    if (!apiKey) throw new Error('TMDB_API_KEY is required');

    // Consultar detalles + credits
    const url = `https://api.themoviedb.org/3/tv/${encodeURIComponent(
      tmdbId
    )}?api_key=${encodeURIComponent(apiKey)}&append_to_response=credits`;

    const { data } = await axios.get(url);
    if (!data) return { item: null, raw: data };

    const genres = (data.genres || []).map((g: any) => g.name);
    const cast = (data.credits?.cast || []).slice(0, 5).map((c: any) => c.name);

    const entity: any = {
      itemType: ItemType.SERIES,
      title: data.name || data.original_name || 'Untitled',
      data: {
        type: 'series',
        cover: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
        description: data.overview || '',
        cast,
        genres,
        first_air_date: data.first_air_date || '',
        number_of_seasons: data.number_of_seasons || 0,
        networks: (data.networks || []).map((n: any) => n.name)
      },
      // Guardar el ID de TMDB como externalId (como string)
      externalId: data.id.toString()
    };

    const created = await itemService.create(entity);

    return { item: created, raw: data, fromDb: false };
  }
};
