
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Nama resep yang menarik dan singkat dalam Bahasa Indonesia.' },
    summary: { type: Type.STRING, description: 'Ringkasan singkat resep dalam 1-2 kalimat dalam Bahasa Indonesia.' },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Daftar semua bahan yang dibutuhkan dalam Bahasa Indonesia, termasuk bahan utama dari pengguna dan bumbu dasar tambahan yang mungkin Anda gunakan (seperti garam, gula, saus).'
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Langkah-langkah memasak secara berurutan dalam Bahasa Indonesia.'
    },
    tips: {
      type: Type.STRING,
      description: 'Tips tambahan atau variasi untuk resep ini dalam Bahasa Indonesia.'
    }
  }
};

const twoRecipesSchema = {
    type: Type.OBJECT,
    properties: {
        recipes: {
            type: Type.ARRAY,
            items: recipeSchema,
            description: 'Array berisi dua objek resep yang unik.'
        }
    }
};

/**
 * Membersihkan string JSON mentah yang mungkin dibungkus dalam blok kode Markdown.
 * @param rawText Teks mentah dari respons AI.
 * @returns String JSON yang sudah bersih.
 */
const cleanJsonString = (rawText: string): string => {
  const match = rawText.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    return match[1];
  }
  return rawText.trim();
};


export const generateRecipesAndImages = async (ingredients: string): Promise<Recipe[]> => {
  try {
    // 1. Generate two recipes as structured JSON
    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Buatkan dua resep unik yang bahan utamanya HANYA berasal dari daftar berikut: ${ingredients}. Anda diizinkan menambahkan bumbu dasar umum seperti air, garam, merica, gula, micin (MSG), saus, atau minyak goreng secukupnya untuk menyempurnakan rasa, meskipun tidak ada dalam daftar. Namun, jangan menambahkan bahan makanan utama lainnya (seperti sayuran, daging, atau karbohidrat lain) yang tidak ada dalam daftar. Pastikan semua bahan yang digunakan, termasuk bumbu tambahan, tercantum dalam daftar bahan resep. Ikuti skema JSON yang diberikan.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: twoRecipesSchema,
        },
    });
    
    console.log("Raw AI text response:", textResponse.text); // For debugging
    const cleanedJson = cleanJsonString(textResponse.text);
    const recipeData = JSON.parse(cleanedJson);


    if (!recipeData.recipes || recipeData.recipes.length === 0) {
        throw new Error("AI tidak dapat membuat resep dari bahan tersebut.");
    }
    
    // 2. Generate an image for each recipe
    const recipesWithImages: Recipe[] = await Promise.all(
        recipeData.recipes.map(async (recipe: Omit<Recipe, 'imageUrl'>) => {
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `Foto makanan profesional yang sangat realistis dari hidangan bernama "${recipe.name}", pencahayaan natural, tampilan lezat, gaya fotografi makanan.`,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '4:3'
                },
            });

            const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

            return { ...recipe, imageUrl };
        })
    );

    return recipesWithImages;
  } catch (error) {
    console.error("Error generating recipes and images:", error);
    throw new Error("Gagal berkomunikasi dengan AI. Coba lagi nanti.");
  }
};
