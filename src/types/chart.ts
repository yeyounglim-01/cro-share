export interface PaletteColor {
  index: number;
  rgb: [number, number, number];
  hex: string;
  label: string;
  symbol: string;
}

export interface ChartData {
  width: number;
  height: number;
  cells: number[][];
  palette: PaletteColor[];
}

export interface ChartConfig {
  gridWidth: number;
  gridHeight: number;
  colorCount: number;
  showGrid: boolean;
  showRowNumbers: boolean;
  cellSize: number;
}
