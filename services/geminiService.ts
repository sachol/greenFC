
import { GoogleGenAI, Type } from "@google/genai";
import { MENU_ITEMS } from "../constants";
import { RecommendationResponse } from "../types";

export const getGeminiRecommendation = async (condition: string, apiKey: string): Promise<RecommendationResponse> => {
  if (!apiKey) {
    throw new Error("API 키가 제공되지 않았습니다.");
  }

  // 사용자가 입력한 API 키로 인스턴스 생성
  const ai = new GoogleGenAI({ apiKey });
  const menuNames = MENU_ITEMS.map(item => item.name).join(", ");

  const systemInstruction = `
    당신은 '그린FC'의 프로 축구팀 전담 영양 코치입니다. 
    메뉴: [${menuNames}] 중에서만 반드시 하나를 선택하세요.
    상황(condition)에 맞춰 선수들에게 기운을 북돋아주는 말투로 JSON 응답을 하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `상황 설명: ${condition}`,
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
    const randomItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
    return {
      menuName: randomItem.name,
      reason: "현재 통신 상태가 원활하지 않지만, 코치로서 이 메뉴를 강력 추천합니다!"
    };
  }
};
