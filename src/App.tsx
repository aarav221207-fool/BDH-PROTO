import React, { useState, useEffect, useCallback } from 'react';
import { ShowcaseBanner } from './components/ShowcaseBanner';
import { PromptControl } from './components/PromptControl';
import { BenchmarkPanel } from './components/BenchmarkPanel';
import { PipelineView } from './components/PipelineView';
import { SparsityView } from './components/SparsityView';
import { TensorInspector } from './components/TensorInspector';
import { FALLBACK_EXPERIMENT } from './data.js';

interface Capture {
  module_path: string;
  type: string;
  output?: any;
  input?: any;
}

interface AnalysisData {
  version: string;
  model: string;
  total_params: number;
  input_entry: {
    text: string;
    tokens: number[];
    token_count: number;
    captures: Capture[];
    final_output?: any;
  };
  benchmark: {
    model_load_ms?: number;
    inference_ms?: number;
    instrumentation_ms?: number;
    total_ms?: number;
    server_measured_ms?: number;
  };
}

export default function App() {
  const [text, setText] = useState<string>('The dragon flew over the city.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisData>(FALLBACK_EXPERIMENT as AnalysisData);
  const [selectedCapture, setSelectedCapture] = useState<Capture | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const runAnalysis = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setData(resData);
        setIsFallback(false);
        if (resData.input_entry?.captures?.length > 0) {
          setSelectedCapture(resData.input_entry.captures[0]);
        }
      } else {
        const errMsg = resData.error || `Server responded with status ${response.status}`;
        setError(`${errMsg} (Falling back to verified experiment telemetry)`);
        setIsFallback(true);
        setData(FALLBACK_EXPERIMENT as AnalysisData);
      }
    } catch (err: any) {
      console.error('API analyze call failed:', err);
      setError(`Network connection issue: ${err.message || 'Failed to reach /api/analyze'}. Displaying verified fallback experiment.`);
      setIsFallback(true);
      setData(FALLBACK_EXPERIMENT as AnalysisData);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Initial analysis on load
  useEffect(() => {
    runAnalysis('The dragon flew over the city.');
  }, []);

  const captures = data?.input_entry?.captures || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 md:p-10 antialiased selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Showcase / Architecture Header */}
        <ShowcaseBanner />

        {/* Text Input & Probe Controls */}
        <PromptControl
          text={text}
          setText={setText}
          onAnalyze={() => runAnalysis(text)}
          isLoading={isLoading}
          error={error}
        />

        {/* Benchmark & Latency Telemetry */}
        <BenchmarkPanel
          benchmark={data.benchmark}
          totalParams={data.total_params}
          isFallback={isFallback}
        />

        {/* Layer Pipeline Inspector */}
        <PipelineView
          captures={captures}
          onSelectCapture={(cap) => setSelectedCapture(cap)}
          selectedCapture={selectedCapture || (captures.length > 0 ? captures[0] : null)}
        />

        {/* Gated Latent Sparsity & Activation Analysis */}
        <SparsityView captures={captures} />

        {/* Detail Tensor Inspector */}
        <TensorInspector
          capture={selectedCapture || (captures.length > 0 ? captures[0] : null)}
          allCaptures={captures}
          onSelectCapture={(cap) => setSelectedCapture(cap)}
        />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
          <p>BDH Inspector &bull; Authoritative Dragon Hatchling PyTorch Model Instrumentation &bull; Apache-2.0</p>
        </footer>
      </div>
    </div>
  );
}
