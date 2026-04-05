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
  rose: '#E8A0A0', pink: '#F5C8D0', lavender: '#C8B0E0',
  sage: '#A8C8A8', cream: '#F5ECD8', blue: '#90B8D8',
  white: '#FFFFFF', darkRose: '#C06070',
};

const MOCK_GALLERY: GalleryItem[] = [
  {
    id: 'mock-1',
    title: '봄 체크 패턴',
    author: '뜨개소녀',
    tags: ['체크', '봄', '초급'],
    likes: 142,
    likedByMe: false,
    createdAt: '2026-03-20',
    description: '봄에 어울리는 파스텔 체크 패턴이에요',
    chart: {
      id: 'mock-1',
      name: '봄 체크 패턴',
      mode: 'image',
      width: 16, height: 16,
      yarnPalette: [
        { id: 'A', color: COLORS.rose, label: 'A실', labelEn: 'Yarn A' },
        { id: 'B', color: COLORS.cream, label: 'B실', labelEn: 'Yarn B' },
      ],
      cells: makeGrid(16, 16, (r, c) => makeCell('k',
        (Math.floor(r / 4) + Math.floor(c / 4)) % 2 === 0 ? COLORS.rose : COLORS.cream
      )),
    },
  },
  {
    id: 'mock-2',
    title: '라벤더 다이아몬드',
    author: 'knitlover',
    tags: ['다이아몬드', '중급', '레이스'],
    likes: 89,
    likedByMe: false,
    createdAt: '2026-03-18',
    chart: {
      id: 'mock-2',
      name: '라벤더 다이아몬드',
      mode: 'draw',
      width: 14, height: 18,
      yarnPalette: [],
      cells: makeGrid(14, 18, (r, c) => {
        const cx = 7, cy = 9;
        const dist = Math.abs(r - cy) + Math.abs(c - cx);
        if (dist === 0) return makeCell('yo');
        if (dist % 4 === 0 && dist <= 8) return makeCell('yo');
        if (dist % 4 === 1) return makeCell('k2tog');
        if (dist % 4 === 3) return makeCell('ssk');
        return makeCell('k');
      }),
    },
  },
  {
    id: 'mock-3',
    title: '핑크 스트라이프',
    author: '니트공방',
    tags: ['스트라이프', '초급', '컬러워크'],
    likes: 203,
    likedByMe: false,
    createdAt: '2026-03-15',
    chart: {
      id: 'mock-3',
      name: '핑크 스트라이프',
      mode: 'image',
      width: 20, height: 20,
      yarnPalette: [
        { id: 'A', color: COLORS.pink, label: 'A실', labelEn: 'Yarn A' },
        { id: 'B', color: COLORS.lavender, label: 'B실', labelEn: 'Yarn B' },
        { id: 'C', color: COLORS.white, label: 'C실', labelEn: 'Yarn C' },
      ],
      cells: makeGrid(20, 20, (r) => {
        const stripe = r % 6;
        const color = stripe < 2 ? COLORS.pink : stripe < 4 ? COLORS.lavender : COLORS.white;
        return makeCell('k', color);
      }),
    },
  },
  {
    id: 'mock-4',
    title: '케이블 꼬임',
    author: 'woolcraft',
    tags: ['케이블', '고급', '텍스처'],
    likes: 317,
    likedByMe: false,
    createdAt: '2026-03-10',
    chart: {
      id: 'mock-4',
      name: '케이블 꼬임',
      mode: 'draw',
      width: 12, height: 20,
      yarnPalette: [],
      cells: makeGrid(12, 20, (r, c) => {
        if (c >= 4 && c <= 7 && r % 6 === 0) return makeCell('2-2rc');
        if (c >= 4 && c <= 7) return makeCell('k');
        return makeCell('p');
      }),
    },
  },
  {
    id: 'mock-5',
    title: '세이지 물결',
    author: '초록뜨개',
    tags: ['물결', '중급', '레이스'],
    likes: 76,
    likedByMe: false,
    createdAt: '2026-03-08',
    chart: {
      id: 'mock-5',
      name: '세이지 물결',
      mode: 'image',
      width: 18, height: 14,
      yarnPalette: [
        { id: 'A', color: COLORS.sage, label: 'A실', labelEn: 'Yarn A' },
        { id: 'B', color: COLORS.cream, label: 'B실', labelEn: 'Yarn B' },
      ],
      cells: makeGrid(18, 14, (r, c) => {
        const wave = Math.sin((c + r * 2) * 0.5) > 0;
        return makeCell('k', wave ? COLORS.sage : COLORS.cream);
      }),
    },
  },
  {
    id: 'mock-6',
    title: '하트 모티프',
    author: 'heartknit',
    tags: ['하트', '중급', '모티프'],
    likes: 445,
    likedByMe: false,
    createdAt: '2026-03-05',
    chart: {
      id: 'mock-6',
      name: '하트 모티프',
      mode: 'image',
      width: 14, height: 14,
      yarnPalette: [
        { id: 'A', color: COLORS.darkRose, label: 'A실', labelEn: 'Yarn A' },
        { id: 'B', color: COLORS.cream, label: 'B실', labelEn: 'Yarn B' },
      ],
      cells: makeGrid(14, 14, (r, c) => {
        const HEART = [
          '00000000000000',
          '00110011001100',
          '01111011101110',
          '01111111111110',
          '01111111111110',
          '00111111111100',
          '00011111111000',
          '00001111110000',
          '00000111100000',
          '00000011000000',
          '00000000000000',
        ];
        const inHeart = HEART[r]?.[c] === '1';
        return makeCell('k', inHeart ? COLORS.darkRose : COLORS.cream);
      }),
    },
  },
  {
    id: 'mock-7',
    title: '블루 페어아일',
    author: 'isleknitter',
    tags: ['페어아일', '고급', '노르딕'],
    likes: 188,
    likedByMe: false,
    createdAt: '2026-02-28',
    chart: {
      id: 'mock-7',
      name: '블루 페어아일',
      mode: 'image',
      width: 16, height: 16,
      yarnPalette: [
        { id: 'A', color: COLORS.blue, label: 'A실', labelEn: 'Yarn A' },
        { id: 'B', color: COLORS.white, label: 'B실', labelEn: 'Yarn B' },
      ],
      cells: makeGrid(16, 16, (r, c) => {
        const pat = (r + c) % 4 === 0 || (r % 4 === 2 && c % 4 === 2);
        return makeCell('k', pat ? COLORS.white : COLORS.blue);
      }),
    },
  },
  {
    id: 'mock-8',
    title: '고무뜨기 리브',
    author: 'basicknit',
    tags: ['리브', '초급', '기본'],
    likes: 94,
    likedByMe: false,
    createdAt: '2026-02-20',
    chart: {
      id: 'mock-8',
      name: '고무뜨기 리브',
      mode: 'draw',
      width: 10, height: 16,
      yarnPalette: [],
      cells: makeGrid(10, 16, (_, c) => makeCell(c % 2 === 0 ? 'k' : 'p')),
    },
  },
];
