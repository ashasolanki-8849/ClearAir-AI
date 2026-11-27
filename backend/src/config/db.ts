import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Ensure standard DNS servers (Google & Cloudflare) for MongoDB SRV record resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore if network environment restricts custom DNS
}

let isConnected = false;
let memoryServerInstance: any = null;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      console.log(' Connecting to MongoDB Atlas / configured URI...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      } as any);
      isConnected = true;
      console.log(` MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
      return;
    } catch (err: any) {
      console.warn(` Failed to connect to configured MONGODB_URI: ${err.message}`);
      console.log('ℹ️ Attempting in-memory MongoDB fallback for local development...');
    }
  }

  // Graceful fallback to mongodb-memory-server for local dev
  try {
    const memModule = 'mongodb-memory-server';
    const memoryServerPkg: any = await import(memModule);
    const MongoMemoryServer = memoryServerPkg.MongoMemoryServer;
    memoryServerInstance = await MongoMemoryServer.create();
    const uri = memoryServerInstance.getUri();
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log(` Local In-Memory MongoDB running and connected at ${uri}`);
    console.log('ℹ️ Tip: Configure MONGODB_URI in server/.env to use persistent MongoDB Atlas.');
  } catch (memErr: any) {
    console.error(' MongoDB Connection Error: Could not start in-memory or external MongoDB.', memErr);
    throw memErr;
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
  isConnected = false;
};
