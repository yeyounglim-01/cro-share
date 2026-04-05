'use client';

import { quantizeColors } from './colorQuantizer';
import { mapPixelsToPalette } from './colorMapper';
import { rgbToHex, luminance } from '@/lib/utils/colorUtils';
import type { RGB } from '@/lib/utils/colorUtils';
import type { ChartData, PaletteColor } from '@/types/chart';

const SYMBOLS = ['■', '□', '▲', '△', '●', '○', '★', '☆', '◆', '◇', '▶', '▷', '✦', '✧', '♦', '♢'];

export async function buildChartFromImage(
  imageElement: HTMLImageElement,
  gridWidth: number,
  gridHeight: number,
  colorCount: number
): Promise<ChartData> {
  // Draw image to offscreen canvas at grid size
  const canvas = document.createElement('canvas');
  canvas.width = gridWidth;
  canvas.height = gridHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imageElement, 0, 0, gridWidth, gridHeight);

  const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);
  const data = imageData.data;

  // Extract pixels (skip transparent)
  const pixels: RGB[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) {
      pixels.push([255, 255, 255]);
    } else {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  // Quantize colors
  const paletteRgb = quantizeColors(pixels, colorCount);

  // Sort by luminance (dark to light)
  paletteRgb.sort((a, b) => luminance(a) - luminance(b));

  // Build palette
  const palette: PaletteColor[] = paletteRgb.map((rgb, i) => ({
    index: i,
    rgb,
    hex: rgbToHex(rgb[0], rgb[1], rgb[2]),
    label: `색상 ${i + 1}`,
    symbol: SYMBOLS[i % SYMBOLS.length],
  }));

  // Map pixels to palette indices
  const cells = mapPixelsToPalette(pixels, paletteRgb, gridWidth, gridHeight);

  return { width: gridWidth, height: gridHeight, cells, palette };
}
