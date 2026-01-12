
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFabricRecommendation = async (userPrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بناءً على هذا الطلب: "${userPrompt}"، اقترح 3 أنواع من الأقمشة المناسبة مع شرح بسيط لسبب اختيار كل نوع باللغة العربية.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، حدث خطأ في الحصول على توصية الذكاء الاصطناعي.";
  }
};

export const analyzeDesignImage = async (base64Image: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `حلل هذه الصورة وأخبرني بنوع القماش المناسب لتنفيذ هذا الموديل. ${prompt}` }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return "لم نتمكن من تحليل الصورة حالياً.";
  }
};
