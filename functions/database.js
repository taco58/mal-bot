const { MongoClient } = require('mongodb');

const uri = require("./atlas_uri"); 
const dbName = "anime_bot";
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}

const main = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(error);
  }
}

main();

async function getCollection() {
  const db = client.db(dbName);
  return db.collection('users');
}
module.exports = {getCollection};



