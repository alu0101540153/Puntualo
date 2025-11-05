import { Router } from "express";
import { body } from "express-validator"
import { createAccount, login } from "../handlers/userHandlers";
import { handleImputErrors } from "../middleware/validation";

const authRouter = Router();

/**
 * POST http://localhost:4000/api/users/auth/register
 * Register a new user account.
 * Validates the following fields in the request body:
 * - handle: must not be empty
 * - name: must not be empty
 * - email: must be a valid email
 * - password: must be at least 8 characters long
 */
authRouter.post('/auth/register', 
    body('handle')
            .notEmpty()
            .withMessage('The handle is required'),
    body('name')
            .notEmpty()
            .withMessage('The name is required'),
    body('email')
            .isEmail()
            .withMessage('Invalid email'),
    body('password')
            .isLength({min: 8})
            .withMessage('The password must be at least 8 characters long'),

    handleImputErrors,
    createAccount
)

/**
 * POST http://localhost:4000/api/users/auth/login
 * Login an existing user.
 * Validates the following fields in the request body:
 * - email: must be a valid email
 * - password: must not be empty
 */
authRouter.post('/auth/login',
        body('email')
                .isEmail()
                .withMessage('Invalid email'),
        body('password')
                .notEmpty()
                .withMessage('The password is required'),
        handleImputErrors,
        login
)

export default authRouter
