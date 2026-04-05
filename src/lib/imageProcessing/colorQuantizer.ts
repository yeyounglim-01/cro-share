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

  return palette;
}
