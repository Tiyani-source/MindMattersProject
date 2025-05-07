import express from 'express';
import { getCart, addToCart, removeFromCart, clearCart, updateCartItemQuantity } from '../controllers/shoppingCartController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const shoppingCartRouter = express.Router();

// Cart routes with student authentication
shoppingCartRouter.get("/", verifyToken, getCart);
shoppingCartRouter.post("/", verifyToken, addToCart);
shoppingCartRouter.delete("/:productId", verifyToken, removeFromCart);
shoppingCartRouter.delete("/clear", verifyToken, clearCart);
shoppingCartRouter.patch("/:productId/quantity", verifyToken, updateCartItemQuantity);

export default shoppingCartRouter;