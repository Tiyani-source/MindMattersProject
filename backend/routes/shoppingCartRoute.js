import express from 'express';
import { getCart, addToCart, removeFromCart, clearCart } from '../controllers/shoppingCartController.js';
import authUser from '../middleware/authUser.js';

const shoppingCartRouter = express.Router();

shoppingCartRouter.get("/", authUser, getCart);
shoppingCartRouter.post("/add", authUser, addToCart);
shoppingCartRouter.delete("/remove/:productId", authUser, removeFromCart);
shoppingCartRouter.delete("/clear", authUser, clearCart);

export default shoppingCartRouter;