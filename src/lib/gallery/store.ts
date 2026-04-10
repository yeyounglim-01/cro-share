import type { KnitChartData } from '@/types/knit';

export interface GalleryItem {
  id: string;
  chart: KnitChartData;
  title: string;
  author: string;
  tags: string[];
  likes: number;
  likedByMe: boolean;
  createdAt: string;
  description?: string;
}

const KEY = 'knitpattern-gallery';

export function loadGallery(): GalleryItem[] {
  if (typeof window === 'undefined') return MOCK_GALLERY;
  try {
    const raw = localStorage.getItem(KEY);
    const stored: GalleryItem[] = raw ? JSON.parse(raw) : [];
    // merge with mock (mock first, user patterns after)
    const userIds = new Set(stored.map(s => s.id));
    const mocks = MOCK_GALLERY.filter(m => !userIds.has(m.id));
    return [...stored, ...mocks];
  } catch {
    return MOCK_GALLERY;
  }
}

export function saveToGallery(item: GalleryItem) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const stored: GalleryItem[] = raw ? JSON.parse(raw) : [];
    const idx = stored.findIndex(s => s.id === item.id);
    if (idx >= 0) stored[idx] = item; else stored.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch { /* ignore */ }
}

export function toggleLike(id: string): GalleryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const stored: GalleryItem[] = raw ? JSON.parse(raw) : [];
    const idx = stored.findIndex(s => s.id === id);
    if (idx >= 0) {
      stored[idx].likedByMe = !stored[idx].likedByMe;
      stored[idx].likes += stored[idx].likedByMe ? 1 : -1;
      localStorage.setItem(KEY, JSON.stringify(stored));
    }
    return stored;
  } catch { return []; }
}

// ── Mock gallery data ──────────────────────────────────────────────────
function makeCell(stitchId: string, yarnColor?: string) {
  return { stitchId, yarnColor };
}

function makeGrid(w: number, h: number, fn: (r: number, c: number) => { stitchId: string; yarnColor?: string }) {
  return Array.from({ length: h }, (_, r) => Array.from({ length: w }, (_, c) => fn(r, c)));
}

const COLORS = {
  cream: '#F5F2EB', ivory: '#E8E0D8', sand: '#D4C9BD',
  charcoal: '#3C3C3C', taupe: '#8B7B70', terracotta: '#B8846D',
  olive: '#7D8B6B', moss: '#6B7B5C', navy: '#3B4B5C',
  copper: '#A67B4B', burgundy: '#8B5A4B', lavender: '#9B8BAB',
  white: '#FFFFFF',
};

const MOCK_GALLERY: GalleryItem[] = [
  {
    id: 'mock-1',
    title: '미니멀 기하 삼각형',
    author: 'minimalist_knit',
    tags: ['기하학', '초급', '체크'],
    likes: 526,
    likedByMe: false,
    createdAt: '2026-04-05',
    description: '모던한 느낌의 기하학적 삼각형 패턴. 뉴트럴톤으로 어떤 옷과도 어울립니다.',
    chart: {
      id: 'mock-1',
      name: '미니멀 기하 삼각형',
      mode: 'image',
      width: 20, height: 20,
      yarnPalette: [
        { id: 'A', color: COLORS.charcoal, label: '차콜', labelEn: 'Charcoal' },
        { id: 'B', color: COLORS.ivory, label: '아이보리', labelEn: 'Ivory' },
      ],
      cells: makeGrid(20, 20, (r, c) => {
        const tri = ((r % 4) + (c % 4)) % 2;
        return makeCell('k', tri === 0 ? COLORS.charcoal : COLORS.ivory);
      }),
    },
  },
  {
    id: 'mock-2',
    title: '그래디언트 톤온톤',
    author: 'градиент_craft',
    tags: ['스트라이프', '초급', '컬러워크'],
    likes: 612,
    likedByMe: false,
    createdAt: '2026-04-02',
    description: '따뜻한 톤의 그래디언트. 부드럽고 우아한 색감 변화.',
    chart: {
      id: 'mock-2',
      name: '그래디언트 톤온톤',
      mode: 'image',
      width: 24, height: 18,
      yarnPalette: [
        { id: 'A', color: COLORS.cream, label: 'A실', labelEn: 'Yarn A' },
        { id: 'B', color: COLORS.sand, label: 'B실', labelEn: 'Yarn B' },
        { id: 'C', color: COLORS.taupe, label: 'C실', labelEn: 'Yarn C' },
      ],
      cells: makeGrid(24, 18, (r) => {
        if (r < 6) return makeCell('k', COLORS.cream);
        if (r < 12) return makeCell('k', COLORS.sand);
        return makeCell('k', COLORS.taupe);
      }),
    },
  },
  {
    id: 'mock-3',
    title: '테라코타 체크',
    author: 'earthstone_knit',
    tags: ['체크', '초급', '컬러워크'],
    likes: 489,
    likedByMe: false,
    createdAt: '2026-03-31',
    description: '따뜻하고 자연스러운 테라코타 컬러의 클래식 체크.',
    chart: {
      id: 'mock-3',
      name: '테라코타 체크',
      mode: 'image',
      width: 18, height: 18,
      yarnPalette: [
        { id: 'A', color: COLORS.terracotta, label: '테라', labelEn: 'Terra' },
        { id: 'B', color: COLORS.cream, label: '크림', labelEn: 'Cream' },
      ],
      cells: makeGrid(18, 18, (r, c) => {
        const check = (Math.floor(r / 3) + Math.floor(c / 3)) % 2;
        return makeCell('k', check === 0 ? COLORS.terracotta : COLORS.cream);
      }),
    },
  },
  {
    id: 'mock-4',
    title: '클래식 아이보리 케이블',
    author: 'heritage_knit',
    tags: ['케이블', '중급', '텍스처'],
    likes: 734,
    likedByMe: false,
    createdAt: '2026-03-28',
    description: '시간이 지나도 변하지 않는 아이보리 케이블 패턴. 정교한 텍스처 표현.',
    chart: {
      id: 'mock-4',
      name: '아이보리 케이블',
      mode: 'draw',
      width: 14, height: 24,
      yarnPalette: [],
      cells: makeGrid(14, 24, (r, c) => {
        if (c <= 1 || c >= 12) return makeCell('p');
        if (c >= 5 && c <= 8 && r % 8 === 0) return makeCell('2-2rc');
        if (c >= 5 && c <= 8) return makeCell('k');
        return makeCell('p');
      }),
    },
  },
  {
    id: 'mock-5',
    title: '올리브 다이아몬드 레이스',
    author: 'nature_studio',
    tags: ['레이스', '중급', '다이아몬드'],
    likes: 398,
    likedByMe: false,
    createdAt: '2026-03-25',
    description: '자연스러운 올리브 컬러의 정교한 레이스 다이아몬드.',
    chart: {
      id: 'mock-5',
      name: '올리브 다이아몬드 레이스',
      mode: 'draw',
      width: 16, height: 20,
      yarnPalette: [],
      cells: makeGrid(16, 20, (r, c) => {
        const cx = 8, cy = 10;
        const dist = Math.abs(r - cy) + Math.abs(c - cx);
        if (dist === 0) return makeCell('yo');
        if (dist % 4 === 0 && dist <= 10) return makeCell('yo');
        if (dist % 4 === 1) return makeCell('k2tog');
        if (dist % 4 === 3) return makeCell('ssk');
        return makeCell('k');
      }),
    },
  },
  {
    id: 'mock-6',
    title: '차콜 페어아일 노르딕',
    author: 'nordic_studio',
    tags: ['노르딕', '고급', '페어아일'],
    likes: 567,
    likedByMe: false,
    createdAt: '2026-03-22',
    description: '모던한 해석의 노르딕 패턴. 차콜과 크림의 고전적 조합.',
    chart: {
      id: 'mock-6',
      name: '차콜 페어아일 노르딕',
      mode: 'image',
      width: 20, height: 20,
      yarnPalette: [
        { id: 'A', color: COLORS.charcoal, label: '차콜', labelEn: 'Charcoal' },
        { id: 'B', color: COLORS.cream, label: '크림', labelEn: 'Cream' },
      ],
      cells: makeGrid(20, 20, (r, c) => {
        const pattern = (r % 5 === 0 && c % 4 === 0) || (r % 5 === 2 && c % 4 === 2);
        return makeCell('k', pattern ? COLORS.cream : COLORS.charcoal);
      }),
    },
  },
  {
    id: 'mock-7',
    title: '모스 격자 무늬',
    author: 'geometric_knit',
    tags: ['격자', '초급', '컬러워크'],
    likes: 445,
    likedByMe: false,
    createdAt: '2026-03-19',
    description: '부드러운 모스 그린 격자 패턴. 세련되고 고급스러운 느낌.',
    chart: {
      id: 'mock-7',
      name: '모스 격자 무늬',
      mode: 'image',
      width: 22, height: 16,
      yarnPalette: [
        { id: 'A', color: COLORS.moss, label: '모스', labelEn: 'Moss' },
        { id: 'B', color: COLORS.ivory, label: '아이보리', labelEn: 'Ivory' },
      ],
      cells: makeGrid(22, 16, (r, c) => {
        const grid = (Math.floor(r / 2) + Math.floor(c / 2)) % 2;
        return makeCell('k', grid === 0 ? COLORS.moss : COLORS.ivory);
      }),
    },
  },
  {
    id: 'mock-8',
    title: '버건디 삼각형 모티프',
    author: 'artisan_knit',
    tags: ['모티프', '중급', '기하학'],
    likes: 523,
    likedByMe: false,
    createdAt: '2026-03-16',
    description: '따뜻한 버건디 색상의 기하학적 삼각형 모티프 패턴.',
    chart: {
      id: 'mock-8',
      name: '버건디 삼각형 모티프',
      mode: 'image',
      width: 18, height: 18,
      yarnPalette: [
        { id: 'A', color: COLORS.burgundy, label: '버건디', labelEn: 'Burgundy' },
        { id: 'B', color: COLORS.cream, label: '크림', labelEn: 'Cream' },
      ],
      cells: makeGrid(18, 18, (r, c) => {
        const tri = (r % 6 < 3) ? ((c % 6) < 3 ? 1 : 0) : ((c % 6) < 3 ? 0 : 1);
        return makeCell('k', tri === 1 ? COLORS.burgundy : COLORS.cream);
      }),
    },
  },
  {
    id: 'mock-9',
    title: '라벤더 톤온톤 스트라이프',
    author: 'soft_palette',
    tags: ['스트라이프', '초급', '컬러워크'],
    likes: 401,
    likedByMe: false,
    createdAt: '2026-03-13',
    description: '부드러운 라벤더 컬러의 톤온톤 스트라이프. 우아한 느낌.',
    chart: {
      id: 'mock-9',
      name: '라벤더 톤온톤',
      mode: 'image',
      width: 20, height: 14,
      yarnPalette: [
        { id: 'A', color: COLORS.lavender, label: '라벤더', labelEn: 'Lavender' },
        { id: 'B', color: COLORS.cream, label: '크림', labelEn: 'Cream' },
      ],
      cells: makeGrid(20, 14, (r) => {
        const stripe = r % 3;
        return makeCell('k', stripe === 0 ? COLORS.lavender : COLORS.cream);
      }),
    },
  },
  {
    id: 'mock-10',
    title: '네이비 텍스처 케이블',
    author: 'classic_studio',
    tags: ['케이블', '중급', '텍스처'],
    likes: 612,
    likedByMe: false,
    createdAt: '2026-03-10',
    description: '진정성 있는 네이비 컬러의 정교한 텍스처 케이블.',
    chart: {
      id: 'mock-10',
      name: '네이비 텍스처 케이블',
      mode: 'draw',
      width: 16, height: 20,
      yarnPalette: [],
      cells: makeGrid(16, 20, (r, c) => {
        if (c <= 2 || c >= 13) return makeCell('p');
        if (c >= 6 && c <= 9 && r % 6 === 0) return makeCell('2-2rc');
        if (c >= 6 && c <= 9) return makeCell('k');
        return makeCell('p');
      }),
    },
  },
];
