import Dexie from 'dexie';

const db = new Dexie('RecipesDB');
db.version(1).stores({
  recipes: '++id'
});
export default db

export const keys = [
	{
		title: 'Record ID',
		field: 'id',
		selector: false
	},
	{	
		title: 'Recipe ID', 			
		field: 'recipe_id',
		selectorType: 'data',
		selector: 'wprm-recipe-container',
		selectorData: 'data-recipe-id',
		dataType: 'num'
	},
	{	
		title: 'Title', 				
		field: 'title',
		selectorType: 'class',
		selector: 'wprm-recipe-name',
		dataType: 'string'
	},
	{	
		title: 'Cuisine', 				
		field: 'cuisine',
		selectorType: 'class',
		selector: 'wprm-recipe-cuisine',
		dataType: 'string'
	},
	{	
		title: 'Course', 				
		field: 'course',
		selectorType: 'class',
		selector: 'wprm-recipe-course',
		dataType: 'string'
	},
	{	
		title: 'Prep Time', 	
		field: 'time_prepare',
		selectorType: 'time',
		selector: 'wprm-recipe-prep-time-container',
		dataType: 'num'
	},
	{	
		title: 'Cook Time', 		
		field: 'time_cook',
		selectorType: 'time',
		selector: 'wprm-recipe-cook-time-container',
		dataType: 'num'
	},
	{	
		title: 'Other Time', 		
		field: 'time_other',
		selectorType: 'time',
		selector: 'wprm-recipe-custom-time-container',
		dataType: 'num'
	},
	{	
		title: 'Total Time', 			
		field: 'time_all',
		selectorType: 'time',
		selector: 'wprm-recipe-total-time-container',
		dataType: 'num'
	},
	{	
		title: 'Calories', 			
		field: 'calories',
		selectorType: 'class',
		selector: 'wprm-recipe-calories',
		dataType: 'num'
	},
	{	
		title: 'Rating', 			
		field: 'rating',
		selectorType: 'class',
		selector: 'wprm-recipe-rating-average',
		dataType: 'float'
	},
	{	
		title: 'Votes', 			
		field: 'votes',
		selectorType: 'class',
		selector: 'wprm-recipe-rating-count',
		dataType: 'num'
	},
	{	
		title: 'Yield', 			
		field: 'yield',
		selectorType: 'class',
		selector: 'wprm-recipe-servings',
		dataType: 'float'
	},
	{	
		title: 'Yield unit', 			
		field: 'yield_unit',
		selectorType: 'class',
		selector: 'wprm-recipe-servings-unit',
		dataType: 'string'
	},
	{	
		title: 'Keywords', 			
		field: 'keywords',
		selectorType: 'class',
		selector: 'wprm-recipe-keyword',
		dataType: 'string'
	},
]

export const TIME_SELECTOR_M = 'wprm-recipe-details-minutes'
export const TIME_SELECTOR_H = 'wprm-recipe-details-hours'









