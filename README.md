# BDH Inspector

**BDH Inspector** is a live instrumentation, telemetry, and visual analysis platform for the **Dragon Hatchling (BDH)** neural architecture. It attaches forward execution hooks to internal layers during a single model pass to expose activation distributions, gated latent sparsity, layer statistics, and performance benchmarks in real-time.

---

## Key Features & Architecture

- **Authoritative Model Engine**: Preserves the original BDH implementation in `lib/bdh.py` without architectural or mathematical modification.
- **Single Forward Pass Telemetry**: Captures complete layer states, tensor shapes, element counts, min/max bounds, mean/std, and zero sparsity in a single forward pass via `lib/bdh_instrument.py`.
- **Gated Latent Sparsity**: Measures the 8,192-dimensional latent projection expansion and ReLU gating characteristics.
- **Full-Stack Live API**: Exposes `POST /api/analyze` for on-demand string probing and analysis.
- **Graceful Fallback Safety**: Includes precomputed experiment telemetry if live Python execution is interrupted.

---

## Analytics & Telemetry Measured

1. **Model & Layer Structure**:
   - 6-Layer Transformer Architecture
   - Submodules: `Embedding`, `LayerNorm`, `Attention`, `Dropout`
2. **Tensor Statistics**:
   - Tensor shapes (e.g. `[1, T, 256]`, `[1, 4, T, 8192]`)
   - Total element counts (`numel`)
   - Min, max, mean, std deviation
   - Sample numerical vector snippets
3. **Gated Sparsity**:
   - Zero-element fraction across 8,192-dimensional latent activations
4. **Performance Telemetry**:
   - Model initialization latency (`model_load_ms`)
   - Forward pass inference latency (`inference_ms`)
   - Hook instrumentation overhead (`instrumentation_ms`)
   - Total API roundtrip time (`server_measured_ms`)

---

## Execution Pipeline

```
USER INPUT PROBE
       │
       ▼
  POST /api/analyze
       │
       ▼
PYTHON INSTRUMENTATION (lib/bdh_instrument.py)
       │
       ▼
BDH PYTORCH MODEL (lib/bdh.py)
       │
       ▼
FORWARD HOOK CAPTURE (1 Pass)
       │
       ▼
ANALYTICS JSON RESPONSE
       │
       ▼
BDH INSPECTOR DASHBOARD
```

---

## Quickstart & Local Setup

### Prerequisites

- **Python 3.10+** with PyTorch installed (`pip install torch numpy`)
- **Node.js 18+** & npm / bun

### Installation & Run

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build & Production Server**:
   ```bash
   npm run build
   npm start
   ```

---

## Original BDH Attribution

The model core (`lib/bdh.py`) is based on the original Dragon Hatchling (BDH) architecture implementation.

Licensed under the Apache License, Version 2.0.
