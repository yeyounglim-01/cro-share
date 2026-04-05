'use client';

import { quantizeColors } from './colorQuantizer';
import { mapPixelsToPalette } from './colorMapper';
import { rgbToHex, luminance } from '@/lib/utils/colorUtils';
import type { RGB } from '@/lib/utils/colorUtils';
import type { KnitChartData, YarnColor } from '@/types/knit';

const YARN_LABELS_KO = ['A실', 'B실', 'C실', 'D실', 'E실', 'F실', 'G실', 'H실', 'I실', 'J실', 'K실', 'L실'];
const YARN_LABELS_EN = ['Yarn A', 'Yarn B', 'Yarn C', 'Yarn D', 'Yarn E', 'Yarn F', 'Yarn G', 'Yarn H', 'Yarn I', 'Yarn J', 'Yarn K', 'Yarn L'];

export async function imageToColorChart(
  imageElement: HTMLImageElement,
  gridWidth: number,
  gridHeight: number,
  colorCount: number,
  chartName = '컬러워크 패턴'
): Promise<KnitChartData> {
  const canvas = document.createElement('canvas');
  canvas.width = gridWidth;
  canvas.height = gridHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imageElement, 0, 0, gridWidth, gridHeight);

  const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);
  const data = imageData.data;

  const pixels: RGB[] = [];
  for (let i = 0; i < data.length; i += 4) {
    pixels.push(data[i + 3] < 128 ? [255, 255, 255] : [data[i], data[i + 1], data[i + 2]]);
  }

  const paletteRgb = quantizeColors(pixels, colorCount);
  paletteRgb.sort((a, b) => luminance(a) - luminance(b));

  const yarnPalette: YarnColor[] = paletteRgb.map((rgb, i) => ({
    id: String.fromCharCode(65 + i),
    color: rgbToHex(rgb[0], rgb[1], rgb[2]),
    label: YARN_LABELS_KO[i] ?? `${i + 1}실`,
    labelEn: YARN_LABELS_EN[i] ?? `Yarn ${i + 1}`,
  }));

  const indexGrid = mapPixelsToPalette(pixels, paletteRgb, gridWidth, gridHeight);

  const cells = indexGrid.map(row =>
    row.map(idx => ({
      stitchId: 'k',
      yarnColor: yarnPalette[idx]?.color ?? '#FFFFFF',
    }))
  );

  return {
    id: crypto.randomUUID(),
    name: chartName,
    mode: 'image',
    width: gridWidth,
    height: gridHeight,
    cells,
    yarnPalette,
  };
}
