import { Request, Response } from 'express';
import { BookService, MovieService, SeriesService } from '../services';
import { UserModel } from '../models';

export const searchController = {
  // GET /?title=...
  searchBooks: async (req: Request, res: Response) => {
    try {
      const title = (req.query.title as string) || '';
      const genre = (req.query.genre as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10) || 1;
      const result = await BookService.searchBooksByTitle(title, page, genre || undefined);
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
      const genre = (req.query.genre as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10) || 1;

      // Allow empty title: when title is empty we will use TMDB discover endpoint
      const result = await MovieService.searchMoviesByTitle(title, page, genre || undefined);
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
      const genre = (req.query.genre as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10) || 1;
      const result = await SeriesService.searchShowsByTitle(title, page, genre || undefined);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // GET /search/friends?handle=&page=   --> search by username (handle)
  searchFriends: async (req: Request, res: Response) => {
    try {
      const handle = (req.query.handle as string) || '';
      const page = parseInt((req.query.page as string) || '1', 10) || 1;
      const perPage = 10;

      const filter = handle
        ? { handle: { $regex: handle, $options: 'i' } }
        : {};

      const total = await UserModel.countDocuments(filter);
      const pages = Math.ceil(total / perPage) || 1;
      const skip = (page - 1) * perPage;

      const items = await UserModel.find(filter)
        .select('name handle')
        .skip(skip)
        .limit(perPage)
        .lean();

      res.json({ items, total, page, pages, perPage });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  ,

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
