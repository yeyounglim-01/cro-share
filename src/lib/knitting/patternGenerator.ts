import type { KnitChartData, PatternRow, PatternGroup, Language } from '@/types/knit';
import { getStitch } from './stitchLibrary';

export function generatePatternRows(chart: KnitChartData): PatternRow[] {
  const rows: PatternRow[] = [];
  const totalRows = chart.height;

  // Knitting is read bottom-to-top, so row 1 = chart.cells[height-1]
  for (let r = 0; r < totalRows; r++) {
    const rowNum = r + 1; // 1-indexed
    const isRS = rowNum % 2 === 1; // Odd rows = RS
    const cellRow = chart.cells[totalRows - 1 - r];

    // RS rows: read left→right; WS rows: right→left
    const orderedCells = isRS ? cellRow : [...cellRow].reverse();

    const groups: PatternGroup[] = [];
    let i = 0;
    while (i < orderedCells.length) {
      const cell = orderedCells[i];
      const stitch = getStitch(cell.stitchId);
      let count = stitch.cellWidth;

      // Group consecutive same stitches + same yarn color
      if (stitch.cellWidth === 1) {
        while (
          i + count < orderedCells.length &&
          orderedCells[i + count].stitchId === cell.stitchId &&
          orderedCells[i + count].yarnColor === cell.yarnColor
        ) {
          count++;
        }
      }

      groups.push({ stitchId: cell.stitchId, count, yarnColor: cell.yarnColor });
      i += count;
    }

    rows.push({ rowNum, isRS, groups });
  }

  return rows;
}

export function formatPatternRow(
  row: PatternRow,
  lang: Language,
  yarnPalette: KnitChartData['yarnPalette']
): string {
  const rowLabel = lang === 'ko'
    ? `${row.rowNum}단 (${row.isRS ? '겉면' : '안면'}): `
    : `Row ${row.rowNum} (${row.isRS ? 'RS' : 'WS'}): `;

  const groups = row.groups.map(g => {
    const stitch = getStitch(g.stitchId);
    const abbrev = lang === 'ko' ? stitch.abbrevKo : stitch.abbrevEn;
    const countStr = g.count > 1 ? String(g.count) : '';

    let yarnStr = '';
    if (g.yarnColor) {
      const yarn = yarnPalette.find(y => y.color === g.yarnColor);
      if (yarn) {
        yarnStr = lang === 'ko' ? `(${yarn.label})` : `(${yarn.labelEn})`;
      }
    }

    return `${abbrev}${countStr}${yarnStr}`;
  });

  return rowLabel + groups.join(', ');
}

export function formatFullPattern(
  chart: KnitChartData,
  lang: Language
): string {
  const rows = generatePatternRows(chart);
  const lines = rows.map(r => formatPatternRow(r, lang, chart.yarnPalette));

  const title = lang === 'ko'
    ? `── ${chart.name} ──\n코 수: ${chart.width}코 / 단 수: ${chart.height}단\n`
    : `── ${chart.name} ──\nStitches: ${chart.width} / Rows: ${chart.height}\n`;

  return title + '\n' + lines.join('\n');
}
