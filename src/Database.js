import Dexie from 'dexie';

const db = new Dexie('RecipesDB');

db.version(1).stores({
  recipes: '++id'
});

export default db;
