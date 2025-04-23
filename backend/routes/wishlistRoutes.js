import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import authUser from '../middleware/authUser.js'; // Import the authentication middleware

const wishlistRouter = express.Router();

// Get user's wishlist
wishlistRouter.get("/", authUser, getWishlist);

// Add item to wishlist
wishlistRouter.post("/", authUser, addToWishlist);

// Remove item from wishlist
wishlistRouter.delete("/:productId", authUser, removeFromWishlist);

export default wishlistRouter;