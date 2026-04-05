'use client';

import { useChartStore } from '@/hooks/useChartState';

interface Props {
  onProcess: () => void;
}

function SliderField({
  label, value, min, max, onChange, format,
}: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
        <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
          style={{ background: 'var(--color-rose-light)', color: 'var(--color-rose-dark)', fontFamily: 'var(--font-body)' }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-colors duration-200 relative"
        style={{ background: value ? 'var(--color-rose)' : 'var(--color-warm-border)' }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}

export default function ChartControls({ onProcess }: Props) {
  const { config, updateConfig } = useChartStore();

  return (
    <div className="space-y-5">
      <h3 className="text-xl" style={{ fontFamily: 'var(--font-sketch)', color: 'var(--color-ink)' }}>
        도안 설정
      </h3>

      <SliderField label="격자 너비 (코 수)" value={config.gridWidth} min={10} max={100}
        onChange={v => updateConfig({ gridWidth: v })} format={v => `${v}코`} />

      <SliderField label="격자 높이 (단 수)" value={config.gridHeight} min={10} max={100}
        onChange={v => updateConfig({ gridHeight: v })} format={v => `${v}단`} />

      <SliderField label="색상 수" value={config.colorCount} min={2} max={12}
        onChange={v => updateConfig({ colorCount: v })} format={v => `${v}가지`} />

      <div className="space-y-3 pt-1">
        <Toggle label="격자선 표시" value={config.showGrid} onChange={v => updateConfig({ showGrid: v })} />
        <Toggle label="행 번호 표시" value={config.showRowNumbers} onChange={v => updateConfig({ showRowNumbers: v })} />
      </div>

      <button
        onClick={onProcess}
        className="w-full py-3 rounded-2xl font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        style={{
          background: 'linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))',
          fontFamily: 'var(--font-body)',
          boxShadow: '0 4px 16px rgba(212,165,165,0.4)',
          cursor: 'pointer',
          border: 'none',
        }}
      >
        ✦ 도안 생성하기
      </button>
    </div>
  );
}
