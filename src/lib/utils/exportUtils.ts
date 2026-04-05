'use client';

import type { ChartData, ChartConfig } from '@/types/chart';

export function renderChartToCanvas(
  chartData: ChartData,
  config: ChartConfig
): HTMLCanvasElement {
  const { width, height, cells, palette } = chartData;
  const cellSize = config.cellSize;
  const legendWidth = config.showRowNumbers ? 40 : 0;
  const totalWidth = width * cellSize + legendWidth;
  const totalHeight = height * cellSize;

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#FDFAF5';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Draw cells
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const colorIndex = cells[row][col];
      const color = palette[colorIndex];
      ctx.fillStyle = color.hex;
      ctx.fillRect(legendWidth + col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }

  // Grid lines
  if (config.showGrid) {
    ctx.strokeStyle = 'rgba(61,43,31,0.12)';
    ctx.lineWidth = 0.5;
    for (let col = 0; col <= width; col++) {
      ctx.beginPath();
      ctx.moveTo(legendWidth + col * cellSize, 0);
      ctx.lineTo(legendWidth + col * cellSize, totalHeight);
      ctx.stroke();
    }
    for (let row = 0; row <= height; row++) {
      ctx.beginPath();
      ctx.moveTo(legendWidth, row * cellSize);
      ctx.lineTo(legendWidth + width * cellSize, row * cellSize);
      ctx.stroke();
    }
  }

  // Row numbers (every 5 rows)
  if (config.showRowNumbers) {
    ctx.font = `${Math.max(8, cellSize * 0.6)}px Nunito, sans-serif`;
    ctx.fillStyle = '#7A6055';
    ctx.textAlign = 'right';
    for (let row = 0; row < height; row++) {
      if ((row + 1) % 5 === 0 || row === 0) {
        ctx.fillText(
          String(row + 1),
          legendWidth - 4,
          row * cellSize + cellSize * 0.7
        );
      }
    }
  }

  return canvas;
}

export function downloadAsPng(chartData: ChartData, config: ChartConfig, filename = 'knit-chart') {
  const canvas = renderChartToCanvas(chartData, config);
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export async function downloadAsPdf(chartData: ChartData, config: ChartConfig, filename = 'knit-chart') {
  const { jsPDF } = await import('jspdf');
  const canvas = renderChartToCanvas(chartData, { ...config, cellSize: Math.max(config.cellSize, 6) });
  const imgData = canvas.toDataURL('image/png');

  const pxToMm = (px: number) => px * 0.264583;
  const w = pxToMm(canvas.width);
  const h = pxToMm(canvas.height);

  const pdf = new jsPDF({ orientation: w > h ? 'l' : 'p', unit: 'mm', format: [w + 20, h + 40] });

  // Title
  pdf.setFontSize(18);
  pdf.setTextColor(61, 43, 31);
  pdf.text('뜨개질 도안', 10, 12);

  // Color legend
  pdf.setFontSize(9);
  let legendX = 10;
  for (const color of chartData.palette) {
    const rgb = color.rgb;
    pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
    pdf.rect(legendX, 16, 5, 5, 'F');
    pdf.setTextColor(61, 43, 31);
    pdf.text(`${color.symbol} ${color.label}`, legendX + 6, 20);
    legendX += 35;
    if (legendX > w) { legendX = 10; }
  }

  // Chart image
  pdf.addImage(imgData, 'PNG', 10, 30, w, h);
  pdf.save(`${filename}.pdf`);
}
