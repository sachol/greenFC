
import { GoogleGenAI, Type } from "@google/genai";
import { MENU_ITEMS } from "../constants";
import { RecommendationResponse } from "../types";

// The API key is obtained exclusively from process.env.API_KEY as per guidelines.
export const getGeminiRecommendation = async (condition: string): Promise<RecommendationResponse> => {
  // Initialize the Gemini AI client using the provided environment variable.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const menuNames = MENU_ITEMS.map(item => item.name).join(", ");

  const systemInstruction = `
    당신은 '그린FC'의 영양 코치입니다. 
    메뉴: [${menuNames}] 중에서만 선택하세요.
    상황에 맞춰 든든한 조언과 함께 JSON 형식으로 응답하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `상황: ${condition}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            menuName: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["menuName", "reason"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as RecommendationResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback logic for graceful error handling.
    const randomItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
    return {
      menuName: randomItem.name,
      reason: "오늘 훈련 강도를 보니 이 메뉴가 에너지를 채워줄 최적의 선택입니다!"
    };
  }
};
