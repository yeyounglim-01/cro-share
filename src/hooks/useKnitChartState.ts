import { create } from 'zustand';
import type { KnitChartData, Language, ChartCell } from '@/types/knit';

interface KnitChartStore {
  chart: KnitChartData | null;
  language: Language;
  isProcessing: boolean;

  // Grid settings (before chart creation)
  gridWidth: number;
  gridHeight: number;
  colorCount: number;

  setChart: (chart: KnitChartData) => void;
  setLanguage: (lang: Language) => void;
  setProcessing: (v: boolean) => void;
  setGridWidth: (v: number) => void;
  setGridHeight: (v: number) => void;
  setColorCount: (v: number) => void;

  updateCell: (row: number, col: number, cell: Partial<ChartCell>) => void;
  updateYarnColor: (id: string, color: string) => void;
  updateYarnLabel: (id: string, label: string) => void;
  resetChart: () => void;

  // Draw tool
  selectedStitchId: string;
  setSelectedStitchId: (id: string) => void;
  selectedYarnColor: string;
  setSelectedYarnColor: (c: string) => void;

  // Draw modes
  drawMode: 'pencil' | 'fill';
  setDrawMode: (m: 'pencil' | 'fill') => void;
  symmetryMode: 'none' | 'horizontal' | 'vertical' | 'both';
  setSymmetryMode: (m: 'none' | 'horizontal' | 'vertical' | 'both') => void;
}

export const useKnitChartStore = create<KnitChartStore>((set) => ({
  chart: null,
  language: 'ko',
  isProcessing: false,
  gridWidth: 30,
  gridHeight: 30,
  colorCount: 5,
  selectedStitchId: 'k',
  selectedYarnColor: '#C97B6B',
  drawMode: 'pencil',
  symmetryMode: 'none',

  setChart: (chart) => set({ chart }),
  setLanguage: (language) => set({ language }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setGridWidth: (gridWidth) => set({ gridWidth }),
  setGridHeight: (gridHeight) => set({ gridHeight }),
  setColorCount: (colorCount) => set({ colorCount }),
  setSelectedStitchId: (selectedStitchId) => set({ selectedStitchId }),
  setSelectedYarnColor: (selectedYarnColor) => set({ selectedYarnColor }),
  setDrawMode: (drawMode) => set({ drawMode }),
  setSymmetryMode: (symmetryMode) => set({ symmetryMode }),

  updateCell: (row, col, patch) =>
    set(s => {
      if (!s.chart) return s;
      const cells = s.chart.cells.map((r, ri) =>
        ri === row ? r.map((c, ci) => ci === col ? { ...c, ...patch } : c) : r
      );
      return { chart: { ...s.chart, cells } };
    }),

  updateYarnColor: (id, color) =>
    set(s => {
      if (!s.chart) return s;
      const oldColor = s.chart.yarnPalette.find(y => y.id === id)?.color;
      const yarnPalette = s.chart.yarnPalette.map(y => y.id === id ? { ...y, color } : y);
      // 기존에 이 실 색으로 칠해진 셀도 함께 업데이트 (이슈 5)
      const cells = oldColor
        ? s.chart.cells.map(row => row.map(cell => cell.yarnColor === oldColor ? { ...cell, yarnColor: color } : cell))
        : s.chart.cells;
      const selectedYarnColor = s.selectedYarnColor === oldColor ? color : s.selectedYarnColor;
      return { chart: { ...s.chart, yarnPalette, cells }, selectedYarnColor };
    }),

  updateYarnLabel: (id, label) =>
    set(s => {
      if (!s.chart) return s;
      const yarnPalette = s.chart.yarnPalette.map(y => y.id === id ? { ...y, label, labelEn: label } : y);
      return { chart: { ...s.chart, yarnPalette } };
    }),

  resetChart: () => set({ chart: null }),
}));
