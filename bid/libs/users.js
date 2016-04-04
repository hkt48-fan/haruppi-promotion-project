import low from 'lowdb';
import storage from 'lowdb/file-sync';
const db= low(__dirname + '/../data/users.json', { storage });

export default db;
