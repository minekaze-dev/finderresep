
import React from 'react';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onView: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onView }) => {
  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{recipe.name}</h3>
        <p className="text-gray-600 dark:text-dark-text text-sm flex-grow mb-4">{recipe.summary}</p>
        <button
          onClick={onView}
          className="mt-auto w-full bg-light-accent dark:bg-dark-accent text-gray-800 dark:text-black font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent dark:focus:ring-dark-accent"
        >
          Lihat Resep Lengkap
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
