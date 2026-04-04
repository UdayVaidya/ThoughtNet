import 'dotenv/config.js';
import mongoose from 'mongoose';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  try {
    await mongoose.connection.collection('users').dropIndex('username_1');
    console.log("Dropped stale 'username_1' index successfully.");
  } catch (err) {
    if (err.code === 27) {
      console.log("Index 'username_1' does not exist, nothing to drop.");
    } else {
      console.error("Error dropping index:", err.message);
    }
  }
  await mongoose.disconnect();
  process.exit(0);
};

run();
