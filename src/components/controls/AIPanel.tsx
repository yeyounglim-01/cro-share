'use client';

import { useClaudeAI } from '@/hooks/useClaudeAI';
import { useChartStore } from '@/hooks/useChartState';

export default function AIPanel() {
  const { chartData } = useChartStore();
  const { apiKey, setApiKey, isLoading, error, suggestion, optimizePalette, analyzeDifficulty } = useClaudeAI();

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: 'var(--color-blue-light)', border: '1.5px solid var(--color-blue-soft)' }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">✨</span>
        <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-sketch)', color: 'var(--color-ink)', fontSize: '1.1rem' }}>
          AI 스마트 모드
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'var(--color-blue-soft)', color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
          선택
        </span>
      </div>

      <input
        type="password"
        placeholder="Claude API key (sk-ant-...)"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
        style={{
          background: 'var(--color-paper)',
          border: '1.5px solid var(--color-warm-border)',
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-body)',
        }}
      />

      <p className="text-xs" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
        본인의 API key를 사용합니다. 서버에 저장되지 않아요.
      </p>

      {chartData && apiKey && (
        <div className="flex gap-2">
          <button
            onClick={optimizePalette}
            disabled={isLoading}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              background: 'var(--color-blue-soft)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-body)',
              cursor: isLoading ? 'wait' : 'pointer',
              border: 'none',
            }}
          >
            {isLoading ? '분석 중...' : '🎨 색상 최적화'}
          </button>
          <button
            onClick={analyzeDifficulty}
            disabled={isLoading}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              background: 'var(--color-sage-light)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-body)',
              cursor: isLoading ? 'wait' : 'pointer',
              border: 'none',
            }}
          >
            {isLoading ? '분석 중...' : '📊 난이도 분석'}
          </button>
        </div>
      )}

      {suggestion && (
        <div className="rounded-xl p-3 text-sm"
          style={{ background: 'var(--color-sage-light)', color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
          {suggestion}
        </div>
      )}

      {error && (
        <div className="rounded-xl p-3 text-sm"
          style={{ background: '#FECACA', color: '#7F1D1D', fontFamily: 'var(--font-body)' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
