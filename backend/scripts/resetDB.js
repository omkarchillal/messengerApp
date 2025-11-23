import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");
        return mongoose.connection;
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    }
};

const resetDB = async () => {
    try {
        const conn = await connectDB();
        
        // Drop the users collection to remove old indexes
        const collections = await conn.db.listCollections().toArray();
        const usersCollectionExists = collections.some(col => col.name === 'users');
        
        if (usersCollectionExists) {
            console.log("📥 Dropping users collection...");
            await conn.db.dropCollection('users');
            console.log("✅ Users collection dropped");
        } else {
            console.log("ℹ️ Users collection does not exist");
        }
        
        console.log("✅ Database reset completed. The collection will be recreated on next app start.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

resetDB();
