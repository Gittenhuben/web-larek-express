import { Router } from 'express';

import createOrder from '../controllers/orders';
import validateOrder from '../middlewares/validators/order';

const router = Router();

router.post('/', validateOrder, createOrder);

export default router;
