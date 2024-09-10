const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://vinayak:vinumongo@cluster-test.4idly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-test';
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