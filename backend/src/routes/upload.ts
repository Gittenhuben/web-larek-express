import { Router } from 'express';

import uploadFile from '../controllers/upload';
import fileMiddleware from '../middlewares/file';
import auth from '../middlewares/auth';

const router = Router();

router.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default router;
