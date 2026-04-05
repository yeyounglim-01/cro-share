'use client';

import { useState, useCallback } from 'react';
import { useChartStore } from './useChartState';
import { hexToRgb } from '@/lib/utils/colorUtils';
import { rgbToHex } from '@/lib/utils/colorUtils';

export function useClaudeAI() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const { imageUrl, chartData, updatePaletteColor } = useChartStore();

  const optimizePalette = useCallback(async () => {
    if (!apiKey || !imageUrl || !chartData) return;
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': apiKey,
        },
        body: JSON.stringify({
          task: 'optimize_palette',
          imageUrl,
          currentPalette: chartData.palette.map(c => c.hex),
          colorCount: chartData.palette.length,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '요청 실패');
      }

      const data = await res.json();

      if (data.colors && Array.isArray(data.colors)) {
        data.colors.forEach((c: { hex: string; name: string }, i: number) => {
          if (chartData.palette[i]) {
            updatePaletteColor(i, {
              hex: c.hex,
              rgb: hexToRgb(c.hex),
              label: c.name || chartData.palette[i].label,
            });
          }
        });
        setSuggestion(`${data.colors.length}가지 색상이 최적화되었습니다!`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, imageUrl, chartData, updatePaletteColor]);

  const analyzeDifficulty = useCallback(async () => {
    if (!apiKey || !chartData) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': apiKey,
        },
        body: JSON.stringify({
          task: 'analyze_difficulty',
          gridWidth: chartData.width,
          gridHeight: chartData.height,
          colorCount: chartData.palette.length,
          cells: chartData.cells,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '요청 실패');
      }

      const data = await res.json();
      setSuggestion(data.analysis || '분석 완료');
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, chartData]);

  return { apiKey, setApiKey, isLoading, error, suggestion, optimizePalette, analyzeDifficulty };
}
