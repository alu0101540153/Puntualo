import { Request, Response } from 'express';
import { searchService } from '../services';

export const searchController = {
  // GET /?title=...
  searchBooks: async (req: Request, res: Response) => {
    try {
      const title = (req.query.title as string) || '';
      if (!title) return res.status(400).json({ message: 'Query param "title" is required' });

      const result = await searchService.searchBooksByTitle(title);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  ,

  // POST /books/:googleId -> consulta Google Books por ID y guarda el libro en la BD
  fetchAndStoreBook: async (req: Request, res: Response) => {
    try {
      const googleId = req.params.googleId as string;
      if (!googleId) return res.status(400).json({ message: 'Param "googleId" is required' });

      const result = await searchService.fetchAndStoreBookByGoogleId(googleId);

      // Devolvemos 201 Created con la info de Google y el documento creado
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
