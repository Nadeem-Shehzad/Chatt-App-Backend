import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app: Application = express();

const PORT = process.env.PORT || 3000;


app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome in Chatt-App' });
});


app.listen(PORT, () => {
    console.log(`Server Running on port --> ${PORT}`);
});