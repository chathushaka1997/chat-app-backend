import mongoose, { Connection } from 'mongoose';


export let connectionData: Connection;
export default async function databaseSetup() {
  const uri = process.env.MONGOOSE_URI;

  if (!uri) {
    throw new Error('MONGOOSE_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(uri, {});
    console.log('Successfully connected to MongoDB');
    connectionData = mongoose.connection;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      throw new Error(`Error connecting to MongoDB: unknown error`);
    }
  }
}
