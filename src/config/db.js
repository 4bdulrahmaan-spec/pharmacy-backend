import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to primary MongoDB: ${error.message}`);
        console.log("Attempting to spin up a local memory database as fallback...");
        try {
            const mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            const memoryConn = await mongoose.connect(memoryUri);
            console.log(`Local Memory MongoDB Connected: ${memoryConn.connection.host}`);
        } catch (memError) {
            console.error(`Fallback Memory Database also failed: ${memError.message}`);
            process.exit(1);
        }
    }
};

export default connectDB;
