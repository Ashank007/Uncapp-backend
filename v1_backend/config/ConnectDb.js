import mongoose from 'mongoose';

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName:"UnCappd"
    });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

export default ConnectDB;
