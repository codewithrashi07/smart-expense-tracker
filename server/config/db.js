const mongoose = require('mongoose');

let isInMemory = false;
let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && uri !== 'your_mongodb_connection_string') {
    try {
      console.log('Attempting connection to MongoDB Atlas / configured URI...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
      isInMemory = false;
      return conn;
    } catch (err) {
      console.warn(`[MongoDB] Warning: Could not connect to remote URI: ${err.message}`);
    }
  }

  // Try In-Memory MongoDB Server if available
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      binary: {
        skipMD5: true,
      }
    });
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    isInMemory = true;
    console.log(`[MongoDB] Connected to In-Memory MongoDB instance at: ${memoryUri}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Notice: MongoMemoryServer binary unavailable (${err.message}).`);
    console.log('[MongoDB] Running in standalone API mode. Set MONGO_URI in server/.env to persist data to MongoDB Atlas.');
    return null;
  }
};

const getDBStatus = () => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    state: stateMap[mongoose.connection.readyState] || (isInMemory ? 'in-memory' : 'disconnected'),
    isInMemory,
    host: mongoose.connection.host || 'none',
    database: mongoose.connection.name || 'none',
  };
};

module.exports = { connectDB, getDBStatus };
