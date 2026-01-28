
import { MenuItem } from './types';

// 더욱 안정적인 이미지 로딩을 위해 Unsplash 고화질 이미지와 wsrv.nl 프록시 조합 사용
const getProxyUrl = (url: string) => `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=600&h=600&fit=cover&output=webp&q=80`;

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'sundubu',
    name: '순두부찌개',
    // 고화질 순두부찌개 느낌의 이미지
    image: getProxyUrl('https://images.unsplash.com/photo-1583000292276-646ca0572b93?auto=format&fit=crop&q=80&w=600'),
    color: 'bg-red-500',
    tags: ['매콤', '부드러움', '단백질']
  },
  {
    id: 'kimchi',
    name: '김치찌개',
    // 얼큰한 김치찌개 느낌의 이미지
    image: getProxyUrl('https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=600'),
    color: 'bg-orange-500',
    tags: ['얼큰', '한국인의맛', '든든']
  },
  {
    id: 'dongtae',
    name: '동태탕',
    // 시원한 해산물 찌개 느낌의 이미지
    image: getProxyUrl('https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=600'),
    color: 'bg-blue-500',
    tags: ['시원', '해산물', '피로회복']
  },
  {
    id: 'seonji',
    name: '선지해장국',
    // 진한 국밥/해장국 느낌의 이미지
    image: getProxyUrl('https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=600'),
    color: 'bg-red-900',
    tags: ['철분왕', '에너지', '전통의맛']
  }
];
