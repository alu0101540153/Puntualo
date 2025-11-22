import { Request, Response } from 'express';
import { BookService, MovieService, SeriesService } from '../services';

export const searchController = {
  // GET /?title=...
  searchBooks: async (req: Request, res: Response) => {
    try {
      const title = (req.query.title as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10) || 1;
      if (!title) return res.status(400).json({ message: 'Query param "title" is required' });

      const result = await BookService.searchBooksByTitle(title, page);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  ,

  // GET /movies?title=...
  searchMovies: async (req: Request, res: Response) => {
    try {
      const title = (req.query.title as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10) || 1;
      if (!title) return res.status(400).json({ message: 'Query param "title" is required' });

      const result = await MovieService.searchMoviesByTitle(title, page);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // POST /books/:googleId -> consulta Google Books por ID y guarda el libro en la BD
  fetchBook: async (req: Request, res: Response) => {
    try {
      const googleId = req.params.googleId as string;
      if (!googleId) return res.status(400).json({ message: 'Param "googleId" is required' });

      const result = await BookService.fetchBookByGoogleId(googleId);

      // Devolvemos 201 Created con la info de Google y el documento creado
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  ,

  // POST /movies/:tmdbId -> consulta TMDB por ID y guarda la película en la BD
  fetchMovie: async (req: Request, res: Response) => {
    try {
      const tmdbId = req.params.tmdbId as string;
      if (!tmdbId) return res.status(400).json({ message: 'Param "tmdbId" is required' });

      const result = await MovieService.fetchMovieByTmdbId(tmdbId);

      // Devolvemos 201 Created con la info de TMDB y el documento creado
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  ,

  // GET /series?title=...
  searchSeries: async (req: Request, res: Response) => {
    try {
      const title = (req.query.title as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10) || 1;
      if (!title) return res.status(400).json({ message: 'Query param "title" is required' });

      const result = await SeriesService.searchShowsByTitle(title, page);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // POST /series/:tmdbId -> consulta TMDB por ID y guarda la serie en la BD
  fetchSeries: async (req: Request, res: Response) => {
    try {
      const tmdbId = req.params.tmdbId as string;
      if (!tmdbId) return res.status(400).json({ message: 'Param "tmdbId" is required' });

      const result = await SeriesService.fetchShowByTmdbId(tmdbId);

      // Devolvemos 201 Created con la info de TMDB y el documento creado
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
