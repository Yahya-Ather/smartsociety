import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_society';
    await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default mongoose;
