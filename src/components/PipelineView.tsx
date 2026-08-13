import React, { useState } from 'react';
import { Layers, Activity, ChevronRight, Eye } from 'lucide-react';

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

interface PipelineViewProps {
  captures: Capture[];
  onSelectCapture: (cap: Capture) => void;
  selectedCapture?: Capture | null;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  captures,
  onSelectCapture,
  selectedCapture
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const moduleTypes = ['ALL', 'Embedding', 'LayerNorm', 'Attention', 'Dropout'];

  const filteredCaptures = captures.filter((cap) => {
    if (filterType === 'ALL') return true;
    return cap.type === filterType;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">BDH Layer Instrumentation Pipeline</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Captured internal tensor states across 6 transformer blocks during single forward pass
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {moduleTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Captured Modules Table/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredCaptures.map((cap, idx) => {
          const isSelected = selectedCapture?.module_path === cap.module_path && selectedCapture?.type === cap.type;
          const out = cap.output;
          const shapeStr = out?.shape ? `[${out.shape.join(', ')}]` : 'N/A';
          const sparsityPct = out ? (out.sparsity * 100).toFixed(1) : '0.0';

          return (
            <div
              key={idx}
              onClick={() => onSelectCapture(cap)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/70 border-indigo-500 shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    cap.type === 'Dropout' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' :
                    cap.type === 'Attention' ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60' :
                    cap.type === 'LayerNorm' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' :
                    'bg-slate-800 text-slate-200'
                  }`}>
                    {cap.type}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                </div>

                <div className="font-mono text-sm font-semibold text-slate-200 mb-1 flex items-center justify-between">
                  <span>{cap.module_path}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>

                <div className="space-y-1 my-3 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shape:</span>
                    <span className="text-indigo-300 font-semibold">{shapeStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Elements:</span>
                    <span className="text-slate-300">{out?.numel.toLocaleString() ?? '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sparsity:</span>
                    <span className={out && out.sparsity > 0.1 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {sparsityPct}% zeros
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mean / Std:</span>
                    <span className="text-slate-300">{out?.mean ?? 0} / {out?.std ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Tensor</span>
                </span>
                <span className="text-slate-500 font-mono text-[10px]">{out?.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
