import React, { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import { generateRecipesAndImages } from './services/geminiService';
import { findRecipesByIngredients, saveRecipes } from './services/supabaseService';
import type { Recipe } from './types';

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeSource, setRecipeSource] = useState<'ai' | 'cache' | null>(null);

  const suggestions = ['nasi', 'telur', 'kecap', 'ayam', 'mentega', 'santan', 'tempe', 'tahu', 'bawang merah', 'bawang putih', 'cabai'];

  const addIngredient = (ingredient: string) => {
    const formattedIngredient = ingredient.trim().toLowerCase();
    if (formattedIngredient && !ingredients.includes(formattedIngredient)) {
      setIngredients([...ingredients, formattedIngredient]);
    }
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && ingredients.length > 0) {
      setIngredients(ingredients.slice(0, -1));
    }
  };

  const removeIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0) {
      setError("Mohon masukkan bahan-bahan yang Anda miliki.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setRecipeSource(null);

    try {
      // 1. Check cache first
      const cachedRecipes = await findRecipesByIngredients(ingredients);
      if (cachedRecipes) {
        setRecipes(cachedRecipes);
        setRecipeSource('cache');
        console.log("Recipes loaded from cache.");
      } else {
        // 2. If not in cache, generate new recipes
        console.log("No cache hit. Generating new recipes with AI.");
        const ingredientsString = ingredients.join(', ');
        const generatedRecipes = await generateRecipesAndImages(ingredientsString);
        setRecipes(generatedRecipes);
        setRecipeSource('ai');
        
        // 3. Save the new recipes to the cache
        await saveRecipes(ingredients, generatedRecipes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);
  
  const handleSuggestionClick = (suggestion: string) => {
    addIngredient(suggestion);
  };

  const handleReset = () => {
    setRecipes([]);
    setIngredients([]);
    setInputValue('');
    setError(null);
    setRecipeSource(null);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen font-sans text-gray-800 dark:text-dark-text bg-white/[.65] dark:bg-[#1E1E1E]/[.65] backdrop-blur-sm">
        <div className="container mx-auto">
          <Header />
          <main className="px-4 py-8 md:py-12">
            <section className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Jangan Biarkan Sisa Makanan Terbuang
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
                Masukkan bahan-bahan yang ada di kulkasmu, dan biarkan AI kami menciptakan resep lezat untukmu.
              </p>

              <form onSubmit={handleSubmit} className="flex gap-2 items-start">
                <div className="flex-grow flex flex-wrap items-center gap-2 p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-card focus-within:ring-2 focus-within:ring-light-accent dark:focus-within:ring-dark-accent transition-shadow">
                   {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full pl-3 pr-1 py-1 text-sm font-medium animate-scale-in">
                      <span className="capitalize">{ingredient}</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="bg-gray-400 dark:bg-gray-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-500 transition-colors text-xs"
                        aria-label={`Hapus ${ingredient}`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={ingredients.length === 0 ? "Ketik bahan, lalu tekan Enter..." : "Tambah bahan lain..."}
                    className="flex-grow p-2 bg-transparent focus:outline-none min-w-[150px] text-gray-800 dark:text-dark-text"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="flex-shrink-0 bg-light-accent dark:bg-dark-accent text-gray-900 dark:text-black font-bold py-4 px-8 rounded-xl hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || ingredients.length === 0}
                >
                  Buat Resep AI
                </button>
              </form>
              {error && <p className="text-red-500 mt-4">{error}</p>}
              
              <div className="mt-4 flex flex-wrap justify-center items-center gap-2 max-w-full">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 font-medium">Saran cepat:</span>
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm capitalize bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-16 max-w-5xl mx-auto">
              {isLoading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent mx-auto"></div>
                  <p className="mt-4 text-lg">Mencari resep terbaik untukmu...</p>
                </div>
              )}

              {recipes.length > 0 && !isLoading && (
                <>
                  <div className="text-center mb-8 animate-fade-in">
                    {recipeSource === 'cache' && (
                      <p className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-3 rounded-lg inline-flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Resep ditemukan dari pencarian sebelumnya!</span>
                      </p>
                    )}
                    {recipeSource === 'ai' && (
                      <p className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-3 rounded-lg inline-flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                         </svg>
                        <span>Resep baru berhasil dibuat oleh AI!</span>
                      </p>
                    )}
                    <h2 className="text-3xl font-bold mt-4 text-gray-900 dark:text-white">Hasil Pencarian</h2>
                     <button
                      onClick={handleReset}
                      className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-light-accent dark:hover:text-dark-accent underline"
                    >
                      Cari Resep Lain
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                    {recipes.map((recipe, index) => (
                      <RecipeCard key={index} recipe={recipe} onView={() => setSelectedRecipe(recipe)} />
                    ))}
                  </div>
                </>
              )}
            </section>
          </main>
        </div>

        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      </div>
    </ThemeProvider>
  );
};

export default App;