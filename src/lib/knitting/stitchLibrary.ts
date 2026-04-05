import type { KnitStitch } from '@/types/knit';

export const STITCHES: KnitStitch[] = [
  // ─── Basic ───────────────────────────────────────────────────────
  {
    id: 'k', symbol: '□', descKo: '겉뜨기', descEn: 'Knit',
    abbrevKo: '겉', abbrevEn: 'k',
    cellWidth: 1, category: 'basic',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'p', symbol: '—', descKo: '안뜨기', descEn: 'Purl',
    abbrevKo: '안', abbrevEn: 'p',
    cellWidth: 1, category: 'basic',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'ns', symbol: '▨', descKo: '빈 칸', descEn: 'No Stitch',
    abbrevKo: '빈', abbrevEn: '—',
    cellWidth: 1, category: 'special',
    bgColor: '#D0C8C0', fgColor: '#9A8A7A',
  },

  // ─── Increases ───────────────────────────────────────────────────
  {
    id: 'yo', symbol: '○', descKo: '걸기코', descEn: 'Yarn Over',
    abbrevKo: '걸', abbrevEn: 'yo',
    cellWidth: 1, category: 'increase',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'kfb', symbol: '∧', descKo: '앞뒤 1코 늘리기', descEn: 'Knit Front & Back',
    abbrevKo: '앞뒤겉', abbrevEn: 'kfb',
    cellWidth: 1, category: 'increase',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'm1l', symbol: 'M↖', descKo: '왼코 늘리기', descEn: 'Make 1 Left',
    abbrevKo: '왼늘', abbrevEn: 'm1l',
    cellWidth: 1, category: 'increase',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'm1r', symbol: 'M↗', descKo: '오른코 늘리기', descEn: 'Make 1 Right',
    abbrevKo: '오늘', abbrevEn: 'm1r',
    cellWidth: 1, category: 'increase',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },

  // ─── Decreases ───────────────────────────────────────────────────
  {
    id: 'k2tog', symbol: '/', descKo: '오른코 겹치기', descEn: 'Knit 2 Together',
    abbrevKo: '겉2모', abbrevEn: 'k2tog',
    cellWidth: 1, category: 'decrease',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'ssk', symbol: '\\', descKo: '왼코 겹치기', descEn: 'Slip Slip Knit',
    abbrevKo: '왼2모', abbrevEn: 'ssk',
    cellWidth: 1, category: 'decrease',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'sk2p', symbol: '▲', descKo: '가운데 3코 모아', descEn: 'Central Double Dec',
    abbrevKo: '중3모', abbrevEn: 'sk2p',
    cellWidth: 1, category: 'decrease',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'k3tog', symbol: '//', descKo: '오른 3코 겹치기', descEn: 'Knit 3 Together',
    abbrevKo: '겉3모', abbrevEn: 'k3tog',
    cellWidth: 1, category: 'decrease',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'sssk', symbol: '\\\\', descKo: '왼 3코 겹치기', descEn: 'Slip Slip Slip Knit',
    abbrevKo: '왼3모', abbrevEn: 'sssk',
    cellWidth: 1, category: 'decrease',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'p2tog', symbol: 'p/', descKo: '2코 안뜨기 겹치기', descEn: 'Purl 2 Together',
    abbrevKo: '안2모', abbrevEn: 'p2tog',
    cellWidth: 1, category: 'decrease',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },

  // ─── Special ─────────────────────────────────────────────────────
  {
    id: 'sl1k', symbol: '▷', descKo: '겉방향 미끄러뜨리기', descEn: 'Slip 1 Knitwise',
    abbrevKo: '겉미', abbrevEn: 'sl1k',
    cellWidth: 1, category: 'special',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'sl1p', symbol: '◁', descKo: '안방향 미끄러뜨리기', descEn: 'Slip 1 Purlwise',
    abbrevKo: '안미', abbrevEn: 'sl1p',
    cellWidth: 1, category: 'special',
    bgColor: '#FFFFFF', fgColor: '#5C3317',
  },
  {
    id: 'co', symbol: '✦', descKo: '코잡기', descEn: 'Cast On',
    abbrevKo: 'CO', abbrevEn: 'CO',
    cellWidth: 1, category: 'special',
    bgColor: '#FFF0E8', fgColor: '#A85C4E',
  },
  {
    id: 'bo', symbol: '✕', descKo: '코막음', descEn: 'Bind Off',
    abbrevKo: 'BO', abbrevEn: 'BO',
    cellWidth: 1, category: 'special',
    bgColor: '#F0E8FF', fgColor: '#5C4EA8',
  },

  // ─── Cables ──────────────────────────────────────────────────────
  {
    id: '2-2rc', symbol: '⤴', descKo: '오른 케이블 (2/2)', descEn: '2/2 Right Cable',
    abbrevKo: '오케', abbrevEn: '2/2RC',
    cellWidth: 4, category: 'cable',
    bgColor: '#FFF8F0', fgColor: '#8B5E3C',
  },
  {
    id: '2-2lc', symbol: '⤵', descKo: '왼 케이블 (2/2)', descEn: '2/2 Left Cable',
    abbrevKo: '왼케', abbrevEn: '2/2LC',
    cellWidth: 4, category: 'cable',
    bgColor: '#F0F8FF', fgColor: '#3C5E8B',
  },
];

export const STITCH_MAP = new Map(STITCHES.map(s => [s.id, s]));

export function getStitch(id: string): KnitStitch {
  return STITCH_MAP.get(id) ?? STITCHES[0];
}

export const STITCH_CATEGORIES: { id: StitchCategory; labelKo: string; labelEn: string }[] = [
  { id: 'basic',    labelKo: '기본',   labelEn: 'Basic' },
  { id: 'increase', labelKo: '늘림코', labelEn: 'Increase' },
  { id: 'decrease', labelKo: '줄임코', labelEn: 'Decrease' },
  { id: 'cable',    labelKo: '케이블', labelEn: 'Cable' },
  { id: 'special',  labelKo: '특수',   labelEn: 'Special' },
];

import type { StitchCategory } from '@/types/knit';
