import React, { useState, useEffect } from 'react';
import type { Recipe } from '../types';

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Reset copy state when a new recipe is opened
    if (recipe) {
      setIsCopied(false);
    }
  }, [recipe]);

  if (!recipe) return null;

  const handleCopy = () => {
    const recipeText = `
Nama Resep: ${recipe.name}

Bahan-bahan:
${recipe.ingredients.map(item => `- ${item}`).join('\n')}

Langkah Memasak:
${recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Tips Tambahan:
${recipe.tips || 'Tidak ada'}
    `.trim();

    navigator.clipboard.writeText(recipeText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Gagal menyalin resep.');
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-64 object-cover rounded-t-2xl" />
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="p-6 md:p-8 text-gray-800 dark:text-dark-text">
          <div className="flex justify-between items-start mb-4 gap-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{recipe.name}</h2>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isCopied
                  ? 'bg-green-600 text-white focus:ring-green-500'
                  : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-dark-text focus:ring-light-accent dark:focus:ring-dark-accent'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isCopied ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                )}
              </svg>
              <span>{isCopied ? 'Berhasil disalin!' : 'Salin Resep'}</span>
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-light-accent dark:text-dark-accent">Bahan-bahan</h3>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-light-accent dark:text-dark-accent">Langkah Memasak</h3>
            <ol className="list-decimal list-inside space-y-2">
              {recipe.steps.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
          </div>
          
          {recipe.tips && (
             <div>
                <h3 className="text-xl font-semibold mb-2 text-light-accent dark:text-dark-accent">Tips Tambahan</h3>
                <p className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">{recipe.tips}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
