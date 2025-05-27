import express from "express";
import {
    verifyANDregisterUser,
    sendOTP,
    login,
    updateProfile,
    updatePassword,
    forgotPassword,
    logout,
    resetPassword
} from "../controllers/user/user_c";

import { authenticateToken } from "../middlewares/authMiddelware";

import {
    password_Validation,
    registration_Validation,
    updateInfo_Validation
} from "../middlewares/dataValidator";



const router = express.Router();

router.route('/register').post(registration_Validation, verifyANDregisterUser);
router.route('/send-otp').post(sendOTP);
router.route('/login').post(login);
router.route('/update-profile').put(authenticateToken, updateInfo_Validation, updateProfile);
router.route('/update-password').put(authenticateToken, password_Validation, updatePassword);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/logout').post(authenticateToken, logout);

export default router;