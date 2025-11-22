const mongoose = require('mongoose');

const uri = "mongodb+srv://ratsri17:Rat17Sri@cluster0.cj5jxri.mongodb.net/?appName=Cluster0";
const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  dbName: 'blood-donation-db'
};

const connectDB = async () => {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
