import { Router } from 'express';

import validateUser from '../middlewares/validators/user';
import { loginUser, registerUser, refreshTokens, logoutUser, getUserInfo } from '../controllers/users';
import auth from '../middlewares/auth';

const router = Router();

router.post('/login', validateUser, loginUser);
router.post('/register', validateUser, registerUser);
router.get('/token', refreshTokens);
router.get('/logout', logoutUser);
router.get('/user', auth, getUserInfo);

export default router;
