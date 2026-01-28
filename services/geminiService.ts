
import { GoogleGenAI, Type } from "@google/genai";
import { MENU_ITEMS } from "../constants";
import { RecommendationResponse } from "../types";

/**
 * 사용자가 입력한 API 키가 실제로 작동하는지 테스트합니다.
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey || trimmedKey.length < 20) {
    console.warn("Invalid API Key format: Too short.");
    return false;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: trimmedKey });
    // 간단한 인사말로 API 연결 테스트 (가장 가벼운 모델 사용)
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hi",
      config: {
        // 지침 준수: maxOutputTokens 설정 시 thinkingBudget 함께 설정하거나 제거
        maxOutputTokens: 10,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    const isSuccess = !!response.text;
    if (!isSuccess) console.error("API response has no text content.");
    return isSuccess;
  } catch (error: any) {
    // 상세 에러 로그 출력 (401: Invalid Key, 403: API Not Enabled 등)
    console.error("Gemini API Key Validation Error:", error);
    console.info("Please check if Gemini API is enabled for this project at https://aistudio.google.com/");
    return false;
  }
};

export const getGeminiRecommendation = async (condition: string, apiKey: string): Promise<RecommendationResponse> => {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    throw new Error("인증이 필요합니다.");
  }

  const ai = new GoogleGenAI({ apiKey: trimmedKey });
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

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return result as RecommendationResponse;
  } catch (error) {
    console.error("Gemini Recommendation API Error:", error);
    const randomItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
    return {
      menuName: randomItem.name,
      reason: "AI 코치와 연결이 지연되고 있으나, 오늘 컨디션에는 이 메뉴가 최고입니다!"
    };
  }
};
