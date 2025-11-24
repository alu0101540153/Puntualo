import { Router } from 'express';
import { searchController } from '../controllers/search.controller';

const router = Router();

// GET /books?title=... -> devuelve libros que coinciden con el título
router.get('/books', searchController.searchBooks);

// GET /friends?name=... -> busca usuarios (paginado, 10 por página)
router.get('/friends', searchController.searchFriends);

// GET /movies?title=... -> devuelve películas que coinciden con el título (TMDB)
router.get('/movies', searchController.searchMovies);

// GET /series?title=... -> devuelve series que coinciden con el título (TMDB)
router.get('/series', searchController.searchSeries);

// POST /books/:googleId -> busca en Google Books por ID y guarda el libro en la BD
router.post('/books/:googleId', searchController.fetchBook);

// POST /movies/:tmdbId -> busca en TMDB por ID y guarda la película en la BD
router.post('/movies/:tmdbId', searchController.fetchMovie);

// POST /series/:tmdbId -> busca en TMDB por ID y guarda la serie en la BD
router.post('/series/:tmdbId', searchController.fetchSeries);

export default router;
