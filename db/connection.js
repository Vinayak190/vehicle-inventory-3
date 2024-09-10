const { MongoClient } = require('mongodb');

const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventorySystemV2';
if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not found in environment variables. Using default local URI.');
}
const dbName = 'inventorySystemV2'; // Changed database name

let client;
let db;

async function connectToDatabase() {
  if (db) return db;
  
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
  
  db = client.db(dbName);
  return db;
}

async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connectToDatabase, closeDatabaseConnection };