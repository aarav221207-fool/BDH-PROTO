// Verified experiment fallback data for BDH Inspector
export const FALLBACK_EXPERIMENT = {
  version: "1.0-fallback",
  model: "BDH (Dragon Hatchling)",
  total_params: 1770240,
  input_entry: {
    text: "The dragon flew over the city.",
    token_count: 30,
    tokens: [84, 104, 101, 32, 100, 114, 97, 103, 111, 110, 32, 102, 108, 101, 119, 32, 111, 118, 101, 114, 32, 116, 104, 101, 32, 99, 105, 116, 121, 46],
    captures: [
      {
        module_path: "embed",
        type: "Embedding",
        output: { name: "embed_out", shape: [1, 30, 256], numel: 7680, mean: -0.0199, std: 1.1195, min: -4.0509, max: 4.0717, sparsity: 0.0, sample: [0.2227, -1.3135, 1.6076, -1.4498, 0.3783, -0.8693, -0.1164, -2.0031, -2.9222, 0.456] },
        input: { name: "embed_in", shape: [1, 30, 256], numel: 7680, mean: -0.0199, std: 1.1195, min: -4.0509, max: 4.0717, sparsity: 0.0, sample: [0.2227, -1.3135, 1.6076, -1.4498, 0.3783, -0.8693, -0.1164, -2.0031, -2.9222, 0.456] }
      },
      {
        module_path: "ln",
        type: "LayerNorm",
        output: { name: "ln_out", shape: [1, 30, 256], numel: 7680, mean: 0.0, std: 1.0001, min: -3.5881, max: 3.4101, sparsity: 0.0, sample: [0.2819, -1.1324, 1.557, -1.2579, 0.4252, -0.7234, -0.0302, -1.7672, -2.6134, 0.4967] },
        input: { name: "ln_in", shape: [1, 30, 256], numel: 7680, mean: -0.0199, std: 1.1195, min: -4.0509, max: 4.0717, sparsity: 0.0, sample: [0.2227, -1.3135, 1.6076, -1.4498, 0.3783, -0.8693, -0.1164, -2.0031, -2.9222, 0.456] }
      },
      {
        module_path: "attn",
        type: "Attention",
        output: { name: "attn_out", shape: [1, 4, 30, 256], numel: 30720, mean: -0.0005, std: 0.2745, min: -1.6364, max: 1.7197, sparsity: 0.0333, sample: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] },
        input: { name: "attn_in", shape: [1, 4, 30, 256], numel: 30720, mean: -0.0005, std: 0.2745, min: -1.6364, max: 1.7197, sparsity: 0.0333, sample: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] }
      },
      {
        module_path: "drop",
        type: "Dropout",
        output: { name: "drop_out", shape: [1, 4, 30, 8192], numel: 983040, mean: 0.2298, std: 0.3371, min: 0.0, max: 2.4158, sparsity: 0.5011, sample: [0.2555, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0825, 0.0, 0.0] },
        input: { name: "drop_in", shape: [1, 4, 30, 8192], numel: 983040, mean: 0.2298, std: 0.3371, min: 0.0, max: 2.4158, sparsity: 0.5011, sample: [0.2555, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0825, 0.0, 0.0] }
      }
    ],
    final_output: { name: "final", shape: [1, 30, 256], numel: 7680, mean: 0.0, std: 1.0001, min: -3.667, max: 3.3227, sparsity: 0.0, sample: [0.185, -1.2736, 1.4693, -1.3936, 0.6093, -0.483, -0.0898, -1.5238, -3.1876, 0.2641] }
  },
  benchmark: {
    model_load_ms: 270.0,
    inference_ms: 84.0,
    instrumentation_ms: 85.0,
    total_ms: 355.0,
    server_measured_ms: 360.0
  }
};
