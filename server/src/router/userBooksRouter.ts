// src/router/userBookRouter.ts
import { Router } from "express";
import { body, param } from "express-validator";
import { authenticate } from "../middleware/auth";
import { handleImputErrors } from "../middleware/validation";
import { addUserBook, getUserBooks, updateUserBook, deleteUserBook, searchBooks, getUserBooksList } from "../handlers/userBookHandlers";

const userBookRouter = Router();

// Add a book to the user's collection
userBookRouter.post(
    '/add',
    authenticate,
    body('bookId')
        .notEmpty()
        .withMessage('Book ID is required'),
    handleImputErrors,
    addUserBook
);

// Get all books of the authenticated user
userBookRouter.get(
    '/mybooks',
    authenticate,
    handleImputErrors,
    getUserBooks
);


// Update a user's book (rating or description)
userBookRouter.put(
    '/update',
    authenticate,
    body('id')
        .notEmpty()
        .withMessage('UserBook ID is required'),
    body('rating')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Rating must be between 1 and 10'),
    body('description')
        .optional()
        .isString(),
    handleImputErrors,
    updateUserBook
);

// Delete a book from the user's collection
userBookRouter.delete(
    '/delete',
    authenticate,
    body('bookId')
        .notEmpty()
        .withMessage('UserBook ID is required'),
    handleImputErrors,
    deleteUserBook
);


// Search books in Google Books by title (GET, query param)
// http://localhost:4000/api/user-books/search
userBookRouter.get(
    '/search',
    body('title')
        .notEmpty()
        .withMessage('Title is required'),
    handleImputErrors,
    searchBooks
);

// list all books of a user
userBookRouter.post(
    '/list',
    body('handle')
        .notEmpty()
        .withMessage('User handle is required'),
    body('sortType')
        .optional()
        .isString()
        .withMessage('Sort type must be a string'),
    handleImputErrors,
    getUserBooksList
);



export default userBookRouter;
