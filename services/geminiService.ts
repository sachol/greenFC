
import { GoogleGenAI, Type } from "@google/genai";
import { MENU_ITEMS } from "../constants";
import { RecommendationResponse } from "../types";

export const getGeminiRecommendation = async (condition: string): Promise<RecommendationResponse> => {
  // 매 호출 시 최신 API 키(window.aistudio에서 제공된 것)를 사용하기 위해 함수 내부에서 인스턴스화
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Requested entity was not found. Please select an API key.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const menuNames = MENU_ITEMS.map(item => item.name).join(", ");

  const systemInstruction = `
    당신은 '그린FC'라는 프로 축구팀의 전담 영양 코치입니다.
    선수들이 고강도 운동을 마친 직후입니다. 근육 회복과 에너지 보충에 최적인 점심 메뉴를 골라주세요.
    
    메뉴 리스트: [${menuNames}]
    
    규칙:
    1. 반드시 리스트에 있는 이름만 사용하세요.
    2. 선수들의 기분이나 날씨 상황(condition)을 반영하세요.
    3. 말투는 카리스마 있고 든든하며, 선수들을 격려하는 코치 스타일로 하세요.
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

    const result = JSON.parse(response.text || "{}") as RecommendationResponse;
    return result;

  } catch (error: any) {
    if (error.message?.includes("entity was not found")) {
        // API 키 오류 발생 시 런타임에서 감지하여 상위 컴포넌트에서 재설정을 유도할 수 있음
        throw new Error("API_KEY_EXPIRED_OR_INVALID");
    }
    const randomItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
    return {
      menuName: randomItem.name,
      reason: "오늘 훈련 상태를 보니 이 메뉴가 최고의 보약입니다! 코치를 믿고 드세요!"
    };
  }
};
