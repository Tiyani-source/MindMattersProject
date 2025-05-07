import express from "express";
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from "../controllers/wishlistController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const wishlistRouter = express.Router();

// Wishlist routes with user authentication
wishlistRouter.get("/", verifyToken, getWishlist);
wishlistRouter.post("/", verifyToken, addToWishlist);
wishlistRouter.delete("/clear", verifyToken, clearWishlist);
wishlistRouter.delete("/:productId", verifyToken, removeFromWishlist);

export default wishlistRouter;