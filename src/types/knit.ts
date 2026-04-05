export type Language = 'ko' | 'en';

export type StitchCategory = 'basic' | 'decrease' | 'increase' | 'cable' | 'special';

export interface KnitStitch {
  id: string;
  symbol: string;
  descKo: string;
  descEn: string;
  abbrevKo: string;
  abbrevEn: string;
  cellWidth: number;  // 1 for most, 4 for cables
  category: StitchCategory;
  bgColor: string;    // cell background
  fgColor: string;    // symbol color
}

export interface ChartCell {
  stitchId: string;
  yarnColor?: string;  // for colorwork mode
}

export interface YarnColor {
  id: string;
  color: string;
  label: string;
  labelEn: string;
}

export interface KnitChartData {
  id: string;
  name: string;
  mode: 'image' | 'draw';
  width: number;
  height: number;
  cells: ChartCell[][];
  yarnPalette: YarnColor[];
}

export interface PatternRow {
  rowNum: number;      // 1-indexed, bottom to top
  isRS: boolean;       // Right Side
  groups: PatternGroup[];
}

export interface PatternGroup {
  stitchId: string;
  count: number;
  yarnColor?: string;
}
