export interface MenuItem {
  id: string;
  name: string;
  image: string; // URL to image
  color: string; // Tailwind class for background
  tags: string[];
}

export interface RecommendationResponse {
  menuName: string;
  reason: string;
}

export enum SelectionMode {
  IDLE = 'IDLE',
  RANDOM_SPINNING = 'RANDOM_SPINNING',
  AI_THINKING = 'AI_THINKING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}