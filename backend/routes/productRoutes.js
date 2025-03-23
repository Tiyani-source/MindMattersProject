import express from 'express';
import { getProducts, getProductById, addProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(upload.single('image'), addProduct);

router.route('/:id')
  .get(getProductById)
  .put(upload.single('image'), updateProduct)
  .delete(deleteProduct);

export default router;