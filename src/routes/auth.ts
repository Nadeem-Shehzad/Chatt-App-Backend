import express from "express";
import { registerUser, login, logout } from "../controllers/user/user_c";
import { authenticateToken } from "../middlewares/authMiddelware";


const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(login);
router.route('/logout').post(authenticateToken, logout);

export default router;