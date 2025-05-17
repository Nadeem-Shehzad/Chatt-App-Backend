import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
   try {
      const connectionString = process.env.DB_CONNECTION_STRING;
      if (!connectionString) {
         throw new Error('Database connection string is not defined in the environment variables.');
      }

      const connect = await mongoose.connect(connectionString);
      if (connect) {
         console.log(`db connected --> ${connect.connection.name}`);
      }
   } catch (error) {
      console.log(`error in db connection --> ${error}`);
   }
}