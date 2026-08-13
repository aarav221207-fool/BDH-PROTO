import React from 'react';
import { Eye, Database, Cpu, ChevronRight, Activity, Code2 } from 'lucide-react';

interface Capture {
  module_path: string;
  type: string;
  output?: {
    name: string;
    shape: number[];
    numel: number;
    mean: number;
    std: number;
    min: number;
    max: number;
    sparsity: number;
    sample: number[];
  };
  input?: {
    name: string;
    shape: number[];
    numel: number;
    mean: number;
    std: number;
    min: number;
    max: number;
    sparsity: number;
    sample: number[];
  };
}

interface TensorInspectorProps {
  capture: Capture | null;
  allCaptures: Capture[];
  onSelectCapture: (cap: Capture) => void;
}

export const TensorInspector: React.FC<TensorInspectorProps> = ({
  capture,
  allCaptures,
  onSelectCapture
}) => {
  if (!capture && allCaptures.length > 0) {
    capture = allCaptures[0];
  }

  if (!capture) {
    return null;
  }

  const out = capture.output;
  const inp = capture.input;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-slate-100">Live Tensor Inspection & Telemetry</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detailed measurement breakdown for module <code className="text-purple-300 font-mono">{capture.module_path}</code> ({capture.type})
          </p>
        </div>

        {/* Module Selector */}
        <select
          value={`${capture.module_path}_${capture.type}`}
          onChange={(e) => {
            const [path, type] = e.target.value.split('_');
            const found = allCaptures.find((c) => c.module_path === path && c.type === type);
            if (found) onSelectCapture(found);
          }}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
        >
          {allCaptures.map((c, i) => (
            <option key={i} value={`${c.module_path}_${c.type}`}>
              #{i + 1} {c.module_path} ({c.type})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Output Tensor Box */}
        <div className="bg-slate-950 p-5 rounded-xl border border-indigo-900/50">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              <span>Output Tensor</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">
              {out?.shape ? `[${out.shape.join(', ')}]` : 'N/A'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Total Elements</span>
              <span className="text-slate-200 font-bold">{out?.numel.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Zero Fraction</span>
              <span className="text-emerald-400 font-bold">{out ? (out.sparsity * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Mean ± Std</span>
              <span className="text-slate-200 font-bold">{out?.mean} ± {out?.std}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Min / Max Range</span>
              <span className="text-indigo-300 font-bold">{out?.min} to {out?.max}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>First 10 Sample Vector Values:</span>
            </span>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 flex flex-wrap gap-1.5">
              {out?.sample && out.sample.length > 0 ? (
                out.sample.map((val, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded text-[11px] font-semibold ${
                      val === 0
                        ? 'bg-slate-950 text-slate-600 border border-slate-800'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}
                  >
                    {val}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">No sample data available</span>
              )}
            </div>
          </div>
        </div>

        {/* Input Tensor Box */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>Input Tensor</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">
              {inp?.shape ? `[${inp.shape.join(', ')}]` : 'N/A'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Total Elements</span>
              <span className="text-slate-200 font-bold">{inp?.numel.toLocaleString() ?? 'N/A'}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Zero Fraction</span>
              <span className="text-slate-300 font-bold">{inp ? (inp.sparsity * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Mean ± Std</span>
              <span className="text-slate-200 font-bold">{inp?.mean ?? 0} ± {inp?.std ?? 0}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Min / Max Range</span>
              <span className="text-slate-300 font-bold">{inp?.min ?? 0} to {inp?.max ?? 0}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              <span>First 10 Input Vector Values:</span>
            </span>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 flex flex-wrap gap-1.5">
              {inp?.sample && inp.sample.length > 0 ? (
                inp.sample.map((val, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded text-[11px] font-semibold ${
                      val === 0
                        ? 'bg-slate-950 text-slate-600 border border-slate-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {val}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">No input sample data available</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
