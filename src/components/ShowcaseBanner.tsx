import React from 'react';
import { Cpu, ArrowRight, Activity, LineChart, Layers, Database } from 'lucide-react';

export const ShowcaseBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">BDH Inspector</h1>
              <p className="text-sm text-slate-400 font-medium">
                Interactive instrumentation and live telemetry for Dragon Hatchling internal model activity
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 self-start md:self-auto">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Authoritative Model: <code className="text-indigo-300 font-mono">lib/bdh.py</code></span>
        </div>
      </div>

      {/* Pipeline Diagram */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>End-to-End Execution Pipeline</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex flex-col items-center justify-center">
            <span className="font-semibold text-slate-200">INPUT</span>
            <span className="text-[10px] text-slate-400 mt-0.5">User Prompt String</span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-indigo-900/60 flex flex-col items-center justify-center relative">
            <span className="font-semibold text-indigo-300">BDH MODEL</span>
            <span className="text-[10px] text-slate-400 mt-0.5">6-Layer Transformer</span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-emerald-900/60 flex flex-col items-center justify-center">
            <span className="font-semibold text-emerald-300">INSTRUMENTATION</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Forward Hooks</span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-amber-900/60 flex flex-col items-center justify-center">
            <span className="font-semibold text-amber-300">ANALYTICS</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Tensor Telemetry</span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-purple-900/60 flex flex-col items-center justify-center col-span-2 md:col-span-1">
            <span className="font-semibold text-purple-300">VISUALIZATION</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Live Inspector UI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
