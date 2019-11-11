import Dexie from 'dexie';

const db = new Dexie('RecipesDB');
db.version(1).stores({
  recipes: '++id'
});
export default db

export const keys = [
	{title: "Record ID", 					field: "id"},
	{title: "Recipe ID", 					field: "recipe_id"},
	{title: "Title", 							field: "title"},
	{title: "Cuisine", 						field: "cuisine"},
	{title: "Course", 						field: "course"},
	{title: "Preparation time", 	field: "time_prepare"},
	{title: "Cooking Time", 			field: "time_cook"},
	{title: "Joint Time", 				field: "time_all"},
]