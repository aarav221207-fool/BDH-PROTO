import React from 'react';
import { Play, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface PromptControlProps {
  text: string;
  setText: (t: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  error: string | null;
}

export const PROBE_EXAMPLES = [
  "The dragon flew over the city.",
  "The quick brown fox jumps over the lazy dog.",
  "A neural network transforms information through multiple layers."
];

export const PromptControl: React.FC<PromptControlProps> = ({
  text,
  setText,
  onAnalyze,
  isLoading,
  error
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="prompt-input" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Input Text Probe</span>
        </label>
        <span className="text-xs text-slate-400">
          Length: {text.length} chars ({text.length > 0 ? text.length : 0} bytes)
        </span>
      </div>

      <div className="relative mb-4">
        <textarea
          id="prompt-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze with BDH model..."
          rows={3}
          disabled={isLoading}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-mono disabled:opacity-60"
        />
      </div>

      {/* Probe Sentences */}
      <div className="mb-4">
        <span className="text-xs text-slate-400 font-medium block mb-2">
          Click an example probe sentence:
        </span>
        <div className="flex flex-wrap gap-2">
          {PROBE_EXAMPLES.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setText(example)}
              disabled={isLoading}
              className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-colors font-mono ${
                text === example
                  ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          {isLoading ? (
            <span className="text-indigo-400 flex items-center gap-2 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Dragon Hatchling...</span>
            </span>
          ) : (
            <span>Ready for model forward pass</span>
          )}
        </div>

        <button
          onClick={onAnalyze}
          disabled={isLoading || !text.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Live Analysis Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
