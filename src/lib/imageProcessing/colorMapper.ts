import { colorDistance } from '@/lib/utils/colorUtils';
import type { RGB } from '@/lib/utils/colorUtils';

export function findNearestPaletteIndex(pixel: RGB, palette: RGB[]): number {
  let minDist = Infinity;
  let nearest = 0;
  for (let i = 0; i < palette.length; i++) {
    const d = colorDistance(pixel, palette[i]);
    if (d < minDist) {
      minDist = d;
      nearest = i;
    }
  }
  return nearest;
}

export function mapPixelsToPalette(
  pixels: RGB[],
  palette: RGB[],
  width: number,
  height: number
): number[][] {
  const cells: number[][] = [];
  for (let row = 0; row < height; row++) {
    cells[row] = [];
    for (let col = 0; col < width; col++) {
      const idx = row * width + col;
      cells[row][col] = findNearestPaletteIndex(pixels[idx], palette);
    }
  }
  return cells;
}
