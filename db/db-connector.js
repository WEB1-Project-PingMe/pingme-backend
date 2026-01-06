require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

mongoose.connect('mongodb+srv://pingme_db_user:pO5bK18DYFvGzfco@cluster-web1-pingme.jlvqo7o.mongodb.net/pingme?retryWrites=true&w=majority');
console.log("Connected to db");


module.exports = mongoose;

/*
async function connectAndTest() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}
connectAndTest();
*/