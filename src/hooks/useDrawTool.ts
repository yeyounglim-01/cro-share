'use client';

import { useRef, useCallback } from 'react';
import { useKnitChartStore } from './useKnitChartState';
import { getStitch } from '@/lib/knitting/stitchLibrary';
import type { ChartCell } from '@/types/knit';

// 모듈 레벨 싱글턴 — EditorPage와 KnitSymbolChart 양쪽에서 같은 스택 공유
const _undoStack: string[] = [];
const _redoStack: string[] = [];

export function clearDrawHistory() {
  _undoStack.length = 0;
  _redoStack.length = 0;
}

export function useDrawTool() {
  const isDrawing = useRef(false);
  const lastCell = useRef<{ row: number; col: number } | null>(null);
  const {
    chart, selectedStitchId, selectedYarnColor,
    drawMode, symmetryMode,
    updateCell, setChart,
  } = useKnitChartStore();

  const saveHistory = useCallback(() => {
    if (!chart) return;
    _undoStack.push(JSON.stringify(chart.cells));
    if (_undoStack.length > 20) _undoStack.shift();
    _redoStack.length = 0;
  }, [chart]);

  const undo = useCallback(() => {
    if (!chart || _undoStack.length === 0) return;
    _redoStack.unshift(JSON.stringify(chart.cells));
    if (_redoStack.length > 20) _redoStack.pop();
    setChart({ ...chart, cells: JSON.parse(_undoStack.pop()!) });
  }, [chart, setChart]);

  const redo = useCallback(() => {
    if (!chart || _redoStack.length === 0) return;
    _undoStack.push(JSON.stringify(chart.cells));
    if (_undoStack.length > 20) _undoStack.shift();
    setChart({ ...chart, cells: JSON.parse(_redoStack.shift()!) });
  }, [chart, setChart]);

  /** 단일 셀에 칠하기 (대칭 미러 없음) */
  const applySingleCell = useCallback((row: number, col: number, erase = false) => {
    if (!chart) return;
    if (row < 0 || row >= chart.height || col < 0 || col >= chart.width) return;
    const stitch = getStitch(selectedStitchId);
    if (erase) {
      updateCell(row, col, { stitchId: 'k', yarnColor: chart.yarnPalette[0]?.color });
    } else {
      const patch: { stitchId: string; yarnColor?: string } = { stitchId: selectedStitchId };
      if (chart.mode === 'image') patch.yarnColor = selectedYarnColor;
      updateCell(row, col, patch);
      if (stitch.cellWidth > 1) {
        for (let w = 1; w < stitch.cellWidth && col + w < chart.width; w++) {
          updateCell(row, col + w, { stitchId: `${selectedStitchId}_span` });
        }
      }
    }
  }, [chart, selectedStitchId, selectedYarnColor, updateCell]);

  /** 대칭 포함 셀 칠하기 */
  const paintCell = useCallback((row: number, col: number, erase = false) => {
    if (!chart) return;
    const key = `${row}-${col}`;
    if (lastCell.current && `${lastCell.current.row}-${lastCell.current.col}` === key) return;
    lastCell.current = { row, col };

    applySingleCell(row, col, erase);

    const mRow = chart.height - 1 - row;
    const mCol = chart.width - 1 - col;

    if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
      if (mCol !== col) applySingleCell(row, mCol, erase);
    }
    if (symmetryMode === 'vertical' || symmetryMode === 'both') {
      if (mRow !== row) applySingleCell(mRow, col, erase);
    }
    if (symmetryMode === 'both') {
      if (mRow !== row && mCol !== col) applySingleCell(mRow, mCol, erase);
    }
  }, [chart, symmetryMode, applySingleCell]);

  /** 플러드 필 (인접한 동일 색상/기호 칠하기) */
  const floodFill = useCallback((startRow: number, startCol: number, erase = false) => {
    if (!chart) return;
    const targetCell = chart.cells[startRow]?.[startCol];
    if (!targetCell) return;

    const applyStitch = erase ? 'k' : selectedStitchId;
    const applyColor = erase
      ? chart.yarnPalette[0]?.color
      : (chart.mode === 'image' ? selectedYarnColor : undefined);

    // 이미 같은 내용이면 스킵
    if (
      !erase &&
      targetCell.stitchId === applyStitch &&
      targetCell.yarnColor === applyColor
    ) return;

    saveHistory();

    const matchStitch = targetCell.stitchId;
    const matchColor = targetCell.yarnColor;

    const visited = new Set<string>();
    const queue: [number, number][] = [[startRow, startCol]];
    const updates: [number, number][] = [];

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const k = `${r}-${c}`;
      if (visited.has(k)) continue;
      visited.add(k);

      const cell = chart.cells[r]?.[c];
      if (!cell) continue;
      if (cell.stitchId !== matchStitch || cell.yarnColor !== matchColor) continue;

      updates.push([r, c]);

      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < chart.height && nc >= 0 && nc < chart.width) {
          queue.push([nr, nc]);
        }
      }
    }

    // 배치 업데이트
    const newCells = chart.cells.map(row => row.map(cell => ({ ...cell })));
    for (const [r, c] of updates) {
      const cell: ChartCell = { ...newCells[r][c], stitchId: applyStitch };
      if (applyColor !== undefined) cell.yarnColor = applyColor;
      newCells[r][c] = cell;
    }
    setChart({ ...chart, cells: newCells });
  }, [chart, selectedStitchId, selectedYarnColor, setChart, saveHistory]);

  const startDraw = useCallback((row: number, col: number, erase = false) => {
    if (drawMode === 'fill') {
      floodFill(row, col, erase);
      return;
    }
    saveHistory();
    isDrawing.current = true;
    lastCell.current = null;
    paintCell(row, col, erase);
  }, [drawMode, saveHistory, paintCell, floodFill]);

  const continueDraw = useCallback((row: number, col: number, erase = false) => {
    if (drawMode === 'fill') return; // fill은 드래그 없음
    if (!isDrawing.current) return;
    paintCell(row, col, erase);
  }, [drawMode, paintCell]);

  const endDraw = useCallback(() => {
    isDrawing.current = false;
    lastCell.current = null;
  }, []);

  return { startDraw, continueDraw, endDraw, undo, redo };
}
