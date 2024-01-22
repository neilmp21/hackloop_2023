const mongoose = require('mongoose');

// Connect to MongoDB
async function connectToMongo() {
  try {
    await mongoose.connect("mongodb://localhost:27017/app", { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Define MongoDB schema and model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

module.exports = { connectToMongo, User };
