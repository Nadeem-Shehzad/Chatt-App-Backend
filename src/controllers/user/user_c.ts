import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/user';
import { sendSuccessResponse } from '../../utils/response';


export const registerUser = async (req: Request, res: Response): Promise<void> => {
   try {
      const { username, email, password } = req.body;

      const userAvailable = await User.findOne({ email: email });
      if (userAvailable) {
         res.status(400).json({ success: false, message: 'User Already Registered.', data: null });
         return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
         username,
         email,
         password: hashedPassword
      });

      sendSuccessResponse(res, 'User registered successfully', user, 201);
      return;
   } catch (error) {
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.', data: null });
      return;
   }
};


export const login = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });

      if (!user) {
         res.status(404).json({ success: false, message: 'User not Registered.', data: null });
         return;
      }

      const passwordMatched: boolean = await bcrypt.compare(password, user.password);
      if (!passwordMatched) {
         res.status(400).json({ success: false, message: 'Incorrect Password.', data: null });
         return;
      }

      if (!process.env.JWT_SECRET) {
         throw new Error('JWT_SECRET is not defined in environment variables');
      }
      const token = jwt.sign(
         {
            userId: user._id,
            email: user.email
         },
         process.env.JWT_SECRET as string,
         { expiresIn: '2h' }
      );

      await User.findByIdAndUpdate(
         user._id,
         {
            $set: { token: token }
         }, { new: true }
      );

      res.status(200).json({ success: true, message: 'User Logged In', data: token });
      return;

   } catch (error) {
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.', data: null });
      return;
   }
}


export const logout = async (req: Request, res: Response): Promise<void> => {
   try {

      const userId = req.user?.userId;

      await User.findByIdAndUpdate(
         userId,
         {
            $set: { token: '' }
         }, { new: true }
      );

      res.status(200).json({ success: true, message: 'User Logged Out', data: null });
      return;
   } catch (error) {
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.', data: null });
      return;
   }
}