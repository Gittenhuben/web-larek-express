import { Router } from 'express';

import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/products';
import validateProduct from '../middlewares/validators/product';
import validateProductUpdate from '../middlewares/validators/productUpdate';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateProduct, createProduct);
router.patch('/:productId', auth, validateProductUpdate, updateProduct);
router.delete('/:productId', auth, deleteProduct);

export default router;
