/**
 * 니트 도안을 ControlNet 마스크 이미지(base64)로 변환
 * 각 셀의 색상을 픽셀로 렌더링하여 도안 구조를 유지
 */

import { ChartCell, KnitChartData, YarnColor } from '@/types/knit';
import { hexToRgb, rgbToLab, colorDistance } from '@/lib/utils/colorUtils';


/**
 * 팔레트에서 가장 가까운 색상 찾기 (CIE76 Lab 색차)
 */
function findClosestColor(targetHex: string, palette: YarnColor[]): string {
  const targetRgb = hexToRgb(targetHex);

  let closestColor = palette[0];
  let minDistance = Infinity;

  for (const yarnColor of palette) {
    const colorRgb = hexToRgb(yarnColor.color);
    const distance = colorDistance(targetRgb, colorRgb);

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = yarnColor;
    }
  }

  return closestColor.color;
}

/**
 * 셀의 색상 결정 (yarnColor 또는 기본 색상)
 */
function getCellColor(
  cell: ChartCell,
  yarnPalette: YarnColor[]
): string {
  if (cell.yarnColor) {
    // 컬러워크 모드: 명시적 색상 사용
    const yarnColor = yarnPalette.find(y => y.id === cell.yarnColor);
    return yarnColor?.color || '#ffffff';
  }

  // 기본 모드: 팔레트의 첫 번째 색상 (또는 무작위)
  return yarnPalette[0]?.color || '#e8d5c4';
}

/**
 * ControlNet 마스크 생성
 * 출력: base64-encoded PNG 이미지
 */
export async function generateControlNetMask(
  chartData: KnitChartData,
  targetSize: number = 512
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 컨텍스트를 얻을 수 없습니다.');
  }

  // Canvas 크기 설정 (정사각형)
  canvas.width = targetSize;
  canvas.height = targetSize;

  const rows = chartData.cells.length;
  const cols = chartData.cells[0]?.length || 0;

  if (rows === 0 || cols === 0) {
    throw new Error('도안 데이터가 비어있습니다.');
  }

  // 셀 크기 계산 (여백 고려: 5%)
  const padding = Math.floor(targetSize * 0.05);
  const availableSize = targetSize - padding * 2;
  const cellWidth = availableSize / cols;
  const cellHeight = availableSize / rows;

  // 흰색 배경으로 채우기
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetSize, targetSize);

  // 각 셀을 픽셀로 렌더링
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = chartData.cells[r][c];

      if (!cell) continue;

      // 셀 색상 결정
      let cellColor = getCellColor(cell, chartData.yarnPalette);

      // 마스크 모드: 컬러워크 도안이면 색상 유지, 아니면 흑백 변환
      // (ControlNet은 일반적으로 엣지 검출 기반이므로 단순한 명암도 충분)
      if (!cell.yarnColor && chartData.yarnPalette.length === 1) {
        // 단색 도안: 명암으로 변환 (더 나은 엣지 감지)
        const rgb = hexToRgb(cellColor);
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;

        // 이진화: 밝으면 흰색, 어두우면 검은색
        cellColor = brightness > 128 ? '#ffffff' : '#1a1a1a';
      }

      // Canvas에 셀 그리기
      const x = padding + c * cellWidth;
      const y = padding + r * cellHeight;

      ctx.fillStyle = cellColor;
      ctx.fillRect(x, y, cellWidth, cellHeight);

      // 선택사항: 셀 경계선 (선택사항, 디버그용)
      // ctx.strokeStyle = '#cccccc';
      // ctx.lineWidth = 0.5;
      // ctx.strokeRect(x, y, cellWidth, cellHeight);
    }
  }

  // Canvas를 base64 PNG로 변환
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas를 Blob으로 변환할 수 없습니다.'));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // data:image/png;base64,... 형식
          resolve(result);
        };
        reader.onerror = () => {
          reject(new Error('Base64 변환 실패'));
        };
        reader.readAsDataURL(blob);
      },
      'image/png'
    );
  });
}

/**
 * ControlNet 마스크 미리보기 (Canvas 렌더링)
 * 디버그/QA용: 실제 생성될 마스크를 미리 볼 수 있음
 */
export function renderMaskPreview(
  chartData: KnitChartData,
  container: HTMLElement,
  size: number = 256
): void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Canvas 컨텍스트를 얻을 수 없습니다.');
    return;
  }

  canvas.width = size;
  canvas.height = size;

  const rows = chartData.cells.length;
  const cols = chartData.cells[0]?.length || 0;

  const padding = Math.floor(size * 0.05);
  const availableSize = size - padding * 2;
  const cellWidth = availableSize / cols;
  const cellHeight = availableSize / rows;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = chartData.cells[r][c];
      if (!cell) continue;

      let cellColor = getCellColor(cell, chartData.yarnPalette);

      // 단색이면 명암으로 변환
      if (!cell.yarnColor && chartData.yarnPalette.length === 1) {
        const rgb = hexToRgb(cellColor);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        cellColor = brightness > 128 ? '#ffffff' : '#1a1a1a';
      }

      const x = padding + c * cellWidth;
      const y = padding + r * cellHeight;

      ctx.fillStyle = cellColor;
      ctx.fillRect(x, y, cellWidth, cellHeight);
    }
  }

  container.innerHTML = '';
  canvas.style.border = '1px solid #ccc';
  canvas.style.borderRadius = '8px';
  container.appendChild(canvas);
}
