import low from 'lowdb';
import storage from 'lowdb/file-sync';
const db = low(__dirname + '/../data/transactions.json', { storage });

export default db;
