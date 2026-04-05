'use client';

import { useCallback, useRef } from 'react';
import { useChartStore } from './useChartState';
import { buildChartFromImage } from '@/lib/imageProcessing/chartBuilder';

export function useImageProcessor() {
  const { image, config, setChartData, setProcessing } = useChartStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const process = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    try {
      const data = await buildChartFromImage(
        image,
        config.gridWidth,
        config.gridHeight,
        config.colorCount
      );
      setChartData(data);
    } catch (err) {
      console.error('Image processing error:', err);
    } finally {
      setProcessing(false);
    }
  }, [image, config.gridWidth, config.gridHeight, config.colorCount, setChartData, setProcessing]);

  const processDebounced = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(process, 300);
  }, [process]);

  return { process, processDebounced };
}
