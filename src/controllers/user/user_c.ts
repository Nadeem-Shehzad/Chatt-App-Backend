import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/user';
import { errorMsg, generateOTP, sendEmail } from '../../utils/utils';
import { validationResult } from 'express-validator';
import randomString from 'randomstring';



export const sendOTP = async (req: Request, res: Response) => {
   const { email } = req.body;
   const otp = generateOTP();

   try {
      // const user = await User.findOne({email});
      // if(user){
      //   throw new Error('Email Already Exists!');   
      // }

      const newUser = await User.findOneAndUpdate(
         { email },
         {
            otp,
            otpExpiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
         },
         { upsert: true, new: true }
      );

      const subject = 'Verify your account';
      const data = `<p>Your OTP is: <b>${otp}</b></p>`;

      await sendEmail({ to: email, subject, data });
      res.json({ success: true, message: 'OTP sent to email' });
   } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to send OTP' });
   }
}


export const verifyANDregisterUser = async (req: Request, res: Response): Promise<void> => {

   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      res.status(400).json({
         success: false,
         error: errorMsg(errors),
      });
      return;
   }

   // const { email, otp, username, password } = req.body;
   const { email, username, password, image } = req.body;

   try {
      // const user = await User.findOne({ email });

      // if (!user || user.otp !== otp || (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now())) {
      //    res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      //    return;
      // }

      // user.username = username;
      // user.password = await bcrypt.hash(password, 10);
      // user.isVerified = true;
      // user.otp = '';
      // user.otpExpiresAt = null;

      // await user.save();

      const bPassword = await bcrypt.hash(password, 10);      

      const user = await User.create({
        username,
        email,
        password: bPassword,
        image
      });

      res.json({ success: true, message: 'User registered successfully' });
   } catch (err) {
      res.status(500).json({ success: false, error: 'Registration failed' });
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
         { expiresIn: '1d' }
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


export const updateProfile = async (req: Request, res: Response): Promise<void> => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         res.status(400).json({
            success: false,
            error: errorMsg(errors),
         });
         return;
      }

      const userId = req.user?.userId;
      const dataToUpdate = req.body;

      const updatedData = await User.findByIdAndUpdate(
         userId,
         dataToUpdate,
         { new: true }
      );

      res.status(200).json(updatedData);

   } catch (error) {
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.', data: null });
      return;
   }
}


export const updatePassword = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = req.user?.userId; // Extract user ID from auth middleware
      const { oldPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
         res.status(404).json({ success: false, message: "User not found" });
         return;
      }

      if (!(user.password !== oldPassword)) {
         res.status(400).json({ success: false, message: "Incorrect old password" });
         return;
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({ success: true, message: "Password changed successfully!" });

   } catch (error) {
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.', data: null });
      return;
   }
}


export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
   try {

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
         res.status(404).json({ success: false, message: 'This email does not exists!' });
         return;
      }

      const rString = randomString.generate();

      await User.findByIdAndUpdate(
         user._id,
         {
            $set: {
               token: rString
            }
         }, { new: true }
      );

      const subject = 'Password Reset';
      const data = '<p> Hi ' + user.username + ', copy link <a href="http://localhost:4000/api/auth/reset-password?token=' + rString + '"> and reset your password';

      await sendEmail({ to: email, subject, data });

      res.status(200).json({ success: true, message: 'Please check your mail inbox. and reset your password' });

   } catch (error) {
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.', data: null });
      return;
   }
}


export const resetPassword = async (req: Request, res: Response): Promise<void> => {
   const token = req.query.token;

   const tokenData = await User.findOne({ token });
   if (tokenData) {
      const { newPassword } = req.body;
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const userData = await User.findByIdAndUpdate(
         tokenData._id,
         {
            $set: {
               password: hashedPassword,
               token: ''
            }
         },
         { new: true }
      );

      res.status(200).json({ success: true, message: 'Your Password has been reset', data: userData });
   } else {
      res.status(400).json({ success: true, message: 'The link has been expired!' });
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