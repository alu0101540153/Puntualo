import { Router } from "express";
import { body } from "express-validator"
import { getUser, updateProfile, getUserByHandle, searchByHandle, followUser, unfollowUser, loadFeed } from "../handlers/userHandlers";
import { handleImputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const userRouter = Router();

/**
 * GET http://localhost:4000/api/users/user
 * Get the currently authenticated user's profile.
 * Requires authentication via JWT.
 */
userRouter.get('/user', authenticate, getUser)

/**
 * PATCH http://localhost:4000/api/users/user
 * Update the authenticated user's profile.
 * Validates that 'handle' is provided in the request body.
 * Requires authentication via JWT.
 */
userRouter.patch('/user', 
        body('handle')
                .notEmpty()
                .withMessage('The handle is required'),
        handleImputErrors,
        authenticate, 
        updateProfile
)



/**
 * POST http://localhost:4000/api/users/search
 * Check if a handle (username) is available.
 * Validates that 'handle' is provided in the request body.
 */
userRouter.post('/search', 
        body('handle')
                .notEmpty()
                .withMessage('The handle is required'),
        handleImputErrors,
        searchByHandle
)

/**
 * POST http://localhost:4000/api/users/follow
 * Follow a user by their handle.
 * Requires authentication via JWT.
 */
userRouter.post('/follow', 
        authenticate,
        body('handle')
                .notEmpty()
                .withMessage('The handle is required'),
        handleImputErrors,
        followUser
); 

// feed
userRouter.get('/feed', 
        authenticate, 
        handleImputErrors,
        loadFeed
);

userRouter.post('/unfollow', 
        authenticate,
        body('handle')
                .notEmpty()
                .withMessage('The handle is required'),
        handleImputErrors,
        unfollowUser
);

/**
 * GET http://localhost:4000/api/users/:handle
 * Retrieve a user's public profile by their handle (username).
 * Does not require authentication.
 */
userRouter.get('/search/:handle', getUserByHandle)

export default userRouter
