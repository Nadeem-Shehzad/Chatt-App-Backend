import { body } from 'express-validator';


export const registration_Validation = [
    body('username')
        .notEmpty().withMessage('Name Required!')
        .trim()
        .isLength({ min: 2 }).withMessage('Min 2 chars required!')
        .isLength({ max: 18 }).withMessage('Max 18 chars allowed!')
        .matches(/^[a-zA-Z]+$/)
        .withMessage('Name can only contain alphabetic characters (no numbers or special characters)'),

    body('email')
        .notEmpty().withMessage('Email Required!')
        .isEmail().withMessage('Invalid Email Format!')
        .trim(),

    body('password')
        .notEmpty().withMessage('Password Required!')
        .trim()
        .isLength({ min: 4 }).withMessage('Minimum 4 chars required!')
        .isLength({ max: 16 }).withMessage('Maximum 16 chars allowed!'),
];


export const login_Validation = [
    body('email')
        .notEmpty().withMessage('Email Required!')
        .isEmail().withMessage('Invalid Email Format!')
        .trim(),

    body('password')
        .notEmpty().withMessage('Password Required!')
        .trim()
        .isLength({ min: 4 }).withMessage('Minimum 4 chars required!')
        .isLength({ max: 16 }).withMessage('Maximum 16 chars allowed!'),
];


export const password_Validation = [
    body('oldPassword')
        .notEmpty().withMessage('oldPassword Required!')
        .trim()
        .isLength({ min: 4 }).withMessage('Minimum 4 chars required!')
        .isLength({ max: 16 }).withMessage('Maximum 16 chars allowed!'),

    body('newPassword')
        .notEmpty().withMessage('newPassword Required!')
        .trim()
        .isLength({ min: 4 }).withMessage('Minimum 4 chars required!')
        .isLength({ max: 16 }).withMessage('Maximum 16 chars allowed!'),
];


export const updateInfo_Validation = [
    body('username')
        .optional()
        .notEmpty().withMessage('Name Required!')
        .trim()
        .isLength({ min: 2 }).withMessage('Min 2 chars required!')
        .isLength({ max: 18 }).withMessage('Max 18 chars allowed!')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain alphabetic characters (no numbers or special characters)'),

    body('email')
        .optional()
        .notEmpty().withMessage('Email Required!')
        .isEmail().withMessage('Invalid Email Format!')
        .trim(),

    body('password')
        .optional()
        .notEmpty().withMessage('Password Required!')
        .trim()
        .isLength({ min: 4 }).withMessage('Minimum 4 chars required!')
        .isLength({ max: 16 }).withMessage('Maximum 16 chars allowed!'),
];