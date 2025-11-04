import { createClient } from '@supabase/supabase-js';
import type { Recipe } from '../types';

const supabaseUrl = 'https://ecnqqnunfezhwpezrzqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbnFxbnVuZmV6aHdwZXpyenFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzg2MDAsImV4cCI6MjA3NzgxNDYwMH0.vMAcaLEK1dKO4XBXIEEhvnhMLBgh6XTJuKkg07JH4OE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a consistent, sorted key from a list of ingredients.
 * This ensures that ['nasi', 'telur'] and ['telur', 'nasi'] produce the same key.
 * @param ingredients Array of ingredient strings.
 * @returns A sorted, comma-separated string.
 */
const createIngredientsKey = (ingredients: string[]): string => {
  return [...ingredients].sort().join(',');
};

/**
 * Finds recipes in the Supabase cache based on ingredients.
 * @param ingredients Array of ingredient strings.
 * @returns A promise that resolves to an array of Recipe objects or null if not found.
 */
export const findRecipesByIngredients = async (ingredients: string[]): Promise<Recipe[] | null> => {
  const key = createIngredientsKey(ingredients);
  try {
    const { data, error } = await supabase
      .from('recipes_cache')
      .select('recipe_data')
      .eq('ingredients_key', key)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116: "Query returned no rows" which is expected
        console.error('Supabase find error:', error);
      }
      return null;
    }

    return data?.recipe_data || null;
  } catch (err) {
    console.error('Error finding recipes in cache:', err);
    return null;
  }
};

/**
 * Saves a newly generated set of recipes to the Supabase cache.
 * @param ingredients Array of ingredient strings used to generate the recipes.
 * @param recipes Array of Recipe objects to save.
 */
export const saveRecipes = async (ingredients: string[], recipes: Recipe[]): Promise<void> => {
  const key = createIngredientsKey(ingredients);
  try {
    const { error } = await supabase
      .from('recipes_cache')
      .insert({ ingredients_key: key, recipe_data: recipes });

    if (error) {
      console.error('Supabase save error:', error);
    } else {
        console.log('Successfully saved recipes to cache with key:', key);
    }
  } catch (err) {
    console.error('Error saving recipes to cache:', err);
  }
};
