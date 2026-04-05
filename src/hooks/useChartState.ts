import { create } from 'zustand';
import type { ChartData, ChartConfig, PaletteColor } from '@/types/chart';

interface ChartStore {
  image: HTMLImageElement | null;
  imageUrl: string | null;
  chartData: ChartData | null;
  isProcessing: boolean;
  config: ChartConfig;
  setImage: (img: HTMLImageElement, url: string) => void;
  setChartData: (data: ChartData) => void;
  setProcessing: (v: boolean) => void;
  updateConfig: (patch: Partial<ChartConfig>) => void;
  updatePaletteColor: (index: number, patch: Partial<PaletteColor>) => void;
  reset: () => void;
}

const defaultConfig: ChartConfig = {
  gridWidth: 50,
  gridHeight: 50,
  colorCount: 6,
  showGrid: true,
  showRowNumbers: true,
  cellSize: 12,
};

export const useChartStore = create<ChartStore>((set) => ({
  image: null,
  imageUrl: null,
  chartData: null,
  isProcessing: false,
  config: defaultConfig,

  setImage: (img, url) => set({ image: img, imageUrl: url, chartData: null }),
  setChartData: (data) => set({ chartData: data }),
  setProcessing: (v) => set({ isProcessing: v }),
  updateConfig: (patch) => set(s => ({ config: { ...s.config, ...patch } })),
  updatePaletteColor: (index, patch) =>
    set(s => {
      if (!s.chartData) return s;
      const palette = s.chartData.palette.map(c =>
        c.index === index ? { ...c, ...patch } : c
      );
      return { chartData: { ...s.chartData, palette } };
    }),
  reset: () => set({ image: null, imageUrl: null, chartData: null, isProcessing: false }),
}));
