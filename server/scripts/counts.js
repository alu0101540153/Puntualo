const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'Puntualo';

async function run() {
  try {
    await mongoose.connect(uri, { dbName, connectTimeoutMS: 10000 });
    const conn = mongoose.connection;

    const users = await conn.collection('users').countDocuments();
    const items = await conn.collection('items').countDocuments();

    const movies = await conn.collection('items').countDocuments({ $or: [ { itemType: 'movie' }, { 'data.type': 'movie' } ] });
    const series = await conn.collection('items').countDocuments({ $or: [ { itemType: 'series' }, { 'data.type': 'series' } ] });
    const books = await conn.collection('items').countDocuments({ $or: [ { itemType: 'book' }, { 'data.type': 'book' } ] });

    console.log(JSON.stringify({ users, items, movies, series, books, checkedAt: new Date().toISOString() }, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error connecting or querying MongoDB:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
