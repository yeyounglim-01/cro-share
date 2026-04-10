import type { RGB } from '@/lib/utils/colorUtils';

interface ColorBucket {
  pixels: RGB[];
}

function averageColor(pixels: RGB[]): RGB {
  const total = pixels.length;
  let r = 0, g = 0, b = 0;
  for (const p of pixels) { r += p[0]; g += p[1]; b += p[2]; }
  return [Math.round(r / total), Math.round(g / total), Math.round(b / total)];
}

// 채도 부스트 — RGB 색상을 더 선명하게 만드는 함수
function boostSaturation(rgb: RGB, factor = 1.35): RGB {
  const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;

  // 무채색은 그대로 반환
  if (max === min) return rgb;

  // HSL 변환
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h /= 6;

  // 채도 증가
  const sNew = Math.min(1, s * factor);

  // HSL→RGB 역변환
  const q = l < 0.5 ? l * (1 + sNew) : l + sNew - l * sNew;
  const p = 2 * l - q;

  function hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function longestAxis(pixels: RGB[]): number {
  let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
  for (const [r, g, b] of pixels) {
    if (r < minR) minR = r; if (r > maxR) maxR = r;
    if (g < minG) minG = g; if (g > maxG) maxG = g;
    if (b < minB) minB = b; if (b > maxB) maxB = b;
  }
  const ranges = [maxR - minR, maxG - minG, maxB - minB];
  return ranges.indexOf(Math.max(...ranges));
}

function medianCut(pixels: RGB[], depth: number): RGB[] {
  if (pixels.length === 0) return [];
  if (depth === 0 || pixels.length <= 1) return [averageColor(pixels)];

  const axis = longestAxis(pixels);
  const sorted = [...pixels].sort((a, b) => a[axis] - b[axis]);
  const mid = Math.floor(sorted.length / 2);

  return [
    ...medianCut(sorted.slice(0, mid), depth - 1),
    ...medianCut(sorted.slice(mid), depth - 1),
  ];
}

export function quantizeColors(pixels: RGB[], colorCount: number): RGB[] {
  const depth = Math.ceil(Math.log2(colorCount));
  let palette = medianCut(pixels, depth);

  // Trim to exactly colorCount
  palette = palette.slice(0, colorCount);

  // Ensure we have enough colors
  while (palette.length < colorCount && palette.length > 0) {
    palette.push(palette[palette.length - 1]);
  }

  // 팔레트 전체의 채도 부스트 — 선명한 색상으로
  palette = palette.map(c => boostSaturation(c));

  return palette;
}
