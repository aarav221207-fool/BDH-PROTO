import React from 'react';
import { Timer, Zap, Cpu, CheckCircle2, AlertTriangle, Hash } from 'lucide-react';

interface BenchmarkPanelProps {
  benchmark?: {
    model_load_ms?: number;
    inference_ms?: number;
    instrumentation_ms?: number;
    total_ms?: number;
    server_measured_ms?: number;
  };
  totalParams?: number;
  isFallback?: boolean;
}

export const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({
  benchmark,
  totalParams = 1770240,
  isFallback = false
}) => {
  const modelLoad = benchmark?.model_load_ms ?? 0;
  const inference = benchmark?.inference_ms ?? 0;
  const instrument = benchmark?.instrumentation_ms ?? 0;
  const serverTotal = benchmark?.server_measured_ms ?? benchmark?.total_ms ?? 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-semibold text-slate-100">Performance Telemetry</h2>
        </div>

        {/* Execution Mode Badge */}
        {isFallback ? (
          <span className="inline-flex items-center gap-1.5 bg-amber-950/80 border border-amber-800 text-amber-300 text-xs px-2.5 py-1 rounded-full font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Live analysis unavailable — showing verified experiment</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live PyTorch Forward Pass Verified</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Model Load */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Model Load</span>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {modelLoad > 0 ? `${modelLoad.toFixed(1)} ms` : 'Warm Reuse'}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">BDH Module Init</span>
        </div>

        {/* Forward Inference */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-900/40">
          <span className="text-[11px] font-medium text-indigo-400 block mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-400" />
            <span>Inference Pass</span>
          </span>
          <div className="text-lg font-bold text-indigo-300 font-mono">
            {inference.toFixed(1)} ms
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Single Pass</span>
        </div>

        {/* Instrumentation */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Instrumentation</span>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {instrument.toFixed(1)} ms
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Hook Capture</span>
        </div>

        {/* Server Total Latency */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">API Total</span>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {serverTotal.toFixed(1)} ms
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">E2E Roundtrip</span>
        </div>

        {/* Parameter Count */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 col-span-2 md:col-span-1">
          <span className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center gap-1">
            <Hash className="w-3 h-3 text-slate-400" />
            <span>Total Parameters</span>
          </span>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {totalParams.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">6-Layer BDH</span>
        </div>
      </div>
    </div>
  );
};
