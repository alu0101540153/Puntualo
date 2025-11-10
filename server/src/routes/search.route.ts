import { Router } from 'express';
import { searchController } from '../controllers/search.controller';

const router = Router();

// GET /books?title=... -> devuelve libros que coinciden con el título
router.get('/books', searchController.searchBooks);

// POST /books/:googleId -> busca en Google Books por ID y guarda el libro en la BD
router.post('/books/:googleId', searchController.fetchAndStoreBook);

export default router;
