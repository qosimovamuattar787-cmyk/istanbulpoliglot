
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Level, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuizQuestions = async (
  languages: Language[],
  level: Level,
  unit: number
): Promise<Question[]> => {
  const languagesList = languages.join(', ');
  
  const prompt = `Siz "Yeni Istanbul" turk tili darsliklari bo'yicha mutaxassis botsiz.
  Vazifa: O'zbek tilidagi so'zni (masalan: "Kitob") bering va uning ${languagesList} tillaridagi tarjimalarini topish bo'yicha quiz yarating.
  Kitob darajasi: ${level}, Unit: ${unit}.
  
  Qoidalarni buzish taqiqlanadi:
  1. Jami 30 ta savol generatsiya qiling.
  2. Har bir savol uchun EXACTLY 4 ta variant (options) bo'lishi shart.
  3. Variantlar (options) ichidagi "text" maydoni HECH QACHON bo'sh bo'lmasin.
  4. Har bir variant matnida (text) o'sha so'zning tanlangan tillardagi (${languagesList}) tarjimalari bir qatorda yozilsin. 
     Masalan: "Book / Kniga / Kitap"
  5. "word" maydoniga FAQAT o'zbekcha so'zni yozing.
  6. FAQAT JSON formatida javob bering.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            sourceLanguage: { type: Type.STRING },
            targetLanguage: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  language: { type: Type.STRING }
                },
                required: ['text', 'language']
              },
              minItems: 4,
              maxItems: 4
            },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ['word', 'options', 'correctIndex', 'explanation']
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI javob bermadi");
  const data = JSON.parse(text);
  return data as Question[];
};
