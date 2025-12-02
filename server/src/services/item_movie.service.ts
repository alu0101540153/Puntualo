import axios from 'axios';
import { ItemType } from '../models/enums';
import { itemService } from './item.service';
import { TMDB_API_KEY } from '../config';

/*
  MovieService

  - searchMoviesByTitle: busca películas en TMDB por título y devuelve un mapeo
    ligero junto con la respuesta cruda en `raw`.

  - fetchMovieByTmdbId: consulta TMDB por el ID de la película (añadiendo credits),
    construye una entidad `Item` de tipo `movie` y la almacena en la BD usando
    `itemService.create`.

  Requiere la variable de entorno TMDB_API_KEY.
*/

export const MovieService = {
  // Accepts optional title and optional genre name. If title is provided we use
  // the /search/movie endpoint; when title is empty we use /discover/movie and
  // optionally filter by genre using TMDB genre IDs (we fetch and cache the
  // mapping from name -> id).
  searchMoviesByTitle: async (title: string, page = 1, genre?: string) => {
    const apiKey = TMDB_API_KEY;
    if (!apiKey) throw new Error('TMDB_API_KEY is required');

    // TMDB devuelve 20 resultados por página. Queremos paginar en 10 items por página
    // mapeando cada página del servidor a la página de TMDB.
    const serverPage = Math.max(1, page);
    const tmdbPage = Math.ceil(serverPage / 2);

    // helper: fetch genre id by name (cached)
    let genreId: number | null = null;
    const slug = genre ? String(genre).toLowerCase() : '';
    // map common slugs to TMDB genre names
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
        if (!globalThis.__tmdbGenreMap) {
          // @ts-ignore
          globalThis.__tmdbGenreMap = {};
        }
        // @ts-ignore
        const map: Record<string, number> = globalThis.__tmdbGenreMap;
        if (!map[normalizedGenre]) {
          const listUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${encodeURIComponent(apiKey)}&language=es-ES`;
          const { data: listData } = await axios.get(listUrl);
          const genresArr = listData?.genres || [];
          for (const g of genresArr) {
            if (g && g.name) {
              map[String(g.name).toLowerCase()] = g.id;
            }
          }
        }
        // @ts-ignore
        genreId = globalThis.__tmdbGenreMap[normalizedGenre] || null;
      } catch (err) {
        // ignore genre lookup errors – we'll continue without genre filtering
        genreId = null;
      }
    }

    if (title && title.trim()) {
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(
        apiKey
      )}&query=${encodeURIComponent(title)}&page=${tmdbPage}&language=es-ES`;

      const { data } = await axios.get(url);
      if (!data) return { total: 0, items: [], raw: data };

      const results = data.results || [];
      const offset = ((serverPage - 1) % 2) * 10;
      let pageSlice = results.slice(offset, offset + 10);

      // If a genre filter was requested, filter the page slice by genre id
      if (genreId) {
        pageSlice = pageSlice.filter((it: any) => Array.isArray(it.genre_ids) && it.genre_ids.includes(genreId));
      }

      const items = pageSlice.map((it: any) => ({
        id: it.id,
        title: it.title || it.original_title || '',
        release_date: it.release_date || '',
        overview: it.overview || '',
        genres: it.genre_ids || [],
        thumbnail: it.poster_path ? `https://image.tmdb.org/t/p/w500${it.poster_path}` : null,
        infoLink: `https://www.themoviedb.org/movie/${it.id}`
      }));

      // TMDB puede reportar un número muy grande en `total_results`. Limitar el
      // número efectivo de páginas evita mostrar una paginación inmanejable en
      // el cliente. TMDB suele limitar el paginado; aplicamos un tope razonable.
      const TMDB_MAX_PAGES = 500
      const tmdbPages = Number(data.total_pages || Math.ceil((data.total_results || 0) / 20))
      const effectiveTmdbPages = Math.min(tmdbPages, TMDB_MAX_PAGES)
      const effectiveTotal = Math.min(Number(data.total_results || 0), effectiveTmdbPages * 20)
      return { total: effectiveTotal || items.length, items, raw: data };
    }

    // No title provided -> use discover endpoint (supports with_genres)
    let discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${encodeURIComponent(apiKey)}&page=${tmdbPage}&language=es-ES`;
    if (genreId) {
      discoverUrl += `&with_genres=${encodeURIComponent(String(genreId))}`;
    }

    const { data: discData } = await axios.get(discoverUrl);
    if (!discData) return { total: 0, items: [], raw: discData };

    const results = discData.results || [];
    const offset = ((serverPage - 1) % 2) * 10;
    const pageSlice = results.slice(offset, offset + 10);

    const items = pageSlice.map((it: any) => ({
      id: it.id,
      title: it.title || it.original_title || '',
      release_date: it.release_date || '',
      overview: it.overview || '',
      genres: (it.genre_ids || []),
      thumbnail: it.poster_path ? `https://image.tmdb.org/t/p/w500${it.poster_path}` : null,
      infoLink: `https://www.themoviedb.org/movie/${it.id}`
    }));

    const TMDB_MAX_PAGES = 500
    const tmdbPages = Number(discData.total_pages || Math.ceil((discData.total_results || 0) / 20))
    const effectiveTmdbPages = Math.min(tmdbPages, TMDB_MAX_PAGES)
    const effectiveTotal = Math.min(Number(discData.total_results || 0), effectiveTmdbPages * 20)
    return { total: effectiveTotal || items.length, items, raw: discData };
  },

  fetchMovieByTmdbId: async (tmdbId: string) => {
    if (!tmdbId) throw new Error('tmdbId is required');

  // 1) Comprobar si ya existe en la BD por externalId (solo movies)
  const existing = await itemService.findByExternalId(tmdbId.toString(), ItemType.MOVIE);
    if (existing) {
      return { item: existing, raw: null, fromDb: true };
    }

    const apiKey = TMDB_API_KEY;
    if (!apiKey) throw new Error('TMDB_API_KEY is required');

    // Consultar detalles + credits
    const url = `https://api.themoviedb.org/3/movie/${encodeURIComponent(
      tmdbId
    )}?api_key=${encodeURIComponent(apiKey)}&append_to_response=credits&language=es-ES`;

    const { data } = await axios.get(url);
    if (!data) return { item: null, raw: data };

    const genres = (data.genres || []).map((g: any) => g.name);
    const cast = (data.credits?.cast || []).slice(0, 5).map((c: any) => c.name);

    const entity: any = {
      itemType: ItemType.MOVIE,
      title: data.title || data.original_title || 'Untitled',
      data: {
        type: 'movie',
        cover: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
        description: data.overview || '',
        cast,
        genres,
        release_date: data.release_date || ''
      },
      // Guardar el ID de TMDB como externalId (como string)
      externalId: data.id.toString()
    };

    const created = await itemService.create(entity);

    return { item: created, raw: data, fromDb: false };
  }
};
