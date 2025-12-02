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
  searchShowsByTitle: async (title: string, page = 1, genre?: string) => {
    const apiKey = TMDB_API_KEY;
    if (!apiKey) throw new Error('TMDB_API_KEY is required');

    // TMDB devuelve 20 resultados por página. Queremos paginar en 10 items por página
    const serverPage = Math.max(1, page);
    const tmdbPage = Math.ceil(serverPage / 2);

    // handle genre mapping (alias -> TMDB genre name) and lookup TV genre id
    let genreId: number | null = null;
    const slug = genre ? String(genre).toLowerCase() : '';
    const GENRE_ALIASES: Record<string, string> = {
      'sci-fi': 'Science Fiction',
      'science fiction': 'Science Fiction',
      'action': 'Action',
      'drama': 'Drama',
      'comedy': 'Comedy',
      'thriller': 'Thriller',
      'romance': 'Romance',
      'animation': 'Animation',
      'documentary': 'Documentary'
    };
    const normalizedGenre = GENRE_ALIASES[slug] ? GENRE_ALIASES[slug].toLowerCase() : slug;
    if (normalizedGenre) {
      try {
        if (!globalThis.__tmdbTvGenreMap) {
          // @ts-ignore
          globalThis.__tmdbTvGenreMap = {};
        }
        // @ts-ignore
        const map: Record<string, number> = globalThis.__tmdbTvGenreMap;
        if (!map[normalizedGenre]) {
          const listUrl = `https://api.themoviedb.org/3/genre/tv/list?api_key=${encodeURIComponent(apiKey)}&language=es-ES`;
          const { data: listData } = await axios.get(listUrl);
          const genresArr = listData?.genres || [];
          for (const g of genresArr) {
            if (g && g.name) {
              map[String(g.name).toLowerCase()] = g.id;
            }
          }
        }
        // @ts-ignore
        genreId = globalThis.__tmdbTvGenreMap[normalizedGenre] || null;
      } catch (err) {
        genreId = null;
      }
    }

    // If title provided, use search endpoint; otherwise use discover/tv
    let url: string;
    if (title && title.trim()) {
      url = `https://api.themoviedb.org/3/search/tv?api_key=${encodeURIComponent(
        apiKey
      )}&query=${encodeURIComponent(title)}&page=${tmdbPage}&language=es-ES`;
    } else {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${encodeURIComponent(apiKey)}&page=${tmdbPage}&language=es-ES`;
      if (genreId) url += `&with_genres=${encodeURIComponent(String(genreId))}`;
    }

    const { data } = await axios.get(url);
    if (!data) return { total: 0, items: [], raw: data };

    const results = data.results || [];
    const offset = ((serverPage - 1) % 2) * 10;
    const pageSlice = results.slice(offset, offset + 10);

    // If we used search (title present) and a genreId exists, filter the pageSlice
    let finalSlice = pageSlice;
    if (title && title.trim() && typeof genreId === 'number') {
      finalSlice = pageSlice.filter((it: any) => Array.isArray(it.genre_ids) && it.genre_ids.includes(genreId));
    }

    const items = finalSlice.map((it: any) => ({
      id: it.id,
      title: it.name || it.original_name || '',
      release_date: it.first_air_date || '',
      overview: it.overview || '',
      genres: it.genre_ids || [],
      thumbnail: it.poster_path ? `https://image.tmdb.org/t/p/w500${it.poster_path}` : null,
      infoLink: `https://www.themoviedb.org/tv/${it.id}`
    }));

    // cap total similar to movies
    const TMDB_MAX_PAGES = 500;
    const tmdbPages = Number(data.total_pages || Math.ceil((data.total_results || 0) / 20));
    const effectiveTmdbPages = Math.min(tmdbPages, TMDB_MAX_PAGES);
    const effectiveTotal = Math.min(Number(data.total_results || 0), effectiveTmdbPages * 20);
    return { total: effectiveTotal || items.length, items, raw: data };
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
    )}?api_key=${encodeURIComponent(apiKey)}&append_to_response=credits&language=es-ES`;

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
