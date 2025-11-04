import React, { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import { generateRecipesAndImages } from './services/geminiService';
import type { Recipe } from './types';

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

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

    try {
      const ingredientsString = ingredients.join(', ');
      const generatedRecipes = await generateRecipesAndImages(ingredientsString);
      setRecipes(generatedRecipes);
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

              <form onSubmit={handleSubmit} className="flex gap-2">
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
                  <p className="mt-4 text-lg">AI sedang meracik resep spesial untukmu...</p>
                </div>
              )}

              {recipes.length > 0 && !isLoading && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {recipes.map((recipe, index) => (
                      <RecipeCard 
                        key={index} 
                        recipe={recipe}
                        onView={() => setSelectedRecipe(recipe)}
                      />
                    ))}
                  </div>

                  <div className="text-center mt-12">
                    <button
                      onClick={handleReset}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-dark-text font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2 mx-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.691V5.006h4.992" />
                      </svg>
                      <span>Mulai Lagi</span>
                    </button>
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