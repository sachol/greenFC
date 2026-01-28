
import { GoogleGenAI, Type } from "@google/genai";
import { MENU_ITEMS } from "../constants";
import { RecommendationResponse } from "../types";

/**
 * 사용자가 입력한 API 키가 실제로 작동하는지 테스트합니다.
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey || apiKey.length < 20) return false;
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    // 최소한의 토큰으로 모델 응답 테스트
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Connection test",
      config: { maxOutputTokens: 1 }
    });
    return !!response.text;
  } catch (error) {
    console.error("API Key Validation Failed:", error);
    return false;
  }
};

export const getGeminiRecommendation = async (condition: string, apiKey: string): Promise<RecommendationResponse> => {
  if (!apiKey) {
    throw new Error("인증이 필요합니다.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const menuNames = MENU_ITEMS.map(item => item.name).join(", ");

  const systemInstruction = `
    당신은 '그린FC' 프로 축구팀의 전담 영양 코치입니다.
    오늘의 훈련 상황과 선수들의 컨디션에 가장 적합한 메뉴 하나를 추천해야 합니다.
    
    [필수 규칙]
    1. 반드시 다음 메뉴 중 하나만 선택: ${menuNames}
    2. 선수들에게 기운을 북돋아주는 전문가다운 말투 사용.
    3. 반드시 JSON 형식으로만 응답: {"menuName": "...", "reason": "..."}
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

    const result = JSON.parse(response.text || "{}");
    return result as RecommendationResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    const randomItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
    return {
      menuName: randomItem.name,
      reason: "AI 코치와 연결이 지연되고 있으나, 오늘 컨디션에는 이 메뉴가 최고입니다!"
    };
  }
};
