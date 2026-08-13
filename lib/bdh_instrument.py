import sys
import os
import time
import json
import torch
import torch.nn as nn

# Add current and lib directory to python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from bdh import BDH, BDHConfig
except ImportError:
    try:
        from lib.bdh import BDH, BDHConfig
    except ImportError as e:
        print(json.dumps({"error": f"Failed to import bdh module: {str(e)}"}))
        sys.exit(1)

# Global model instance for warm model reuse in persistent server mode
GLOBAL_MODEL = None

def get_or_load_model():
    global GLOBAL_MODEL
    t_start = time.time()
    if GLOBAL_MODEL is None:
        torch.manual_seed(42)
        config = BDHConfig()
        model = BDH(config)
        model.eval()
        GLOBAL_MODEL = model
        load_time = time.time() - t_start
    else:
        load_time = 0.0
    return GLOBAL_MODEL, load_time

def compute_tensor_stats(name, tensor):
    if tensor is None:
        return None
    t = tensor.detach().float()
    shape = list(t.shape)
    numel = t.numel()
    
    if numel == 0:
        return {
            "name": name,
            "shape": shape,
            "numel": 0,
            "mean": 0.0,
            "std": 0.0,
            "min": 0.0,
            "max": 0.0,
            "sparsity": 0.0,
            "sample": []
        }
        
    mean = float(t.mean().item())
    std = float(t.std().item()) if numel > 1 else 0.0
    t_min = float(t.min().item())
    t_max = float(t.max().item())
    zero_count = float((t == 0).sum().item())
    sparsity = zero_count / numel
    
    flat = t.view(-1)
    sample_size = min(10, numel)
    sample = [round(float(v), 4) for v in flat[:sample_size].tolist()]
    
    return {
        "name": name,
        "shape": shape,
        "numel": numel,
        "mean": round(mean, 4),
        "std": round(std, 4),
        "min": round(t_min, 4),
        "max": round(t_max, 4),
        "sparsity": round(sparsity, 4),
        "sample": sample
    }

def instrument_prompt(text, model=None):
    t_start = time.time()
    
    if model is None:
        model, t_model_load = get_or_load_model()
    else:
        t_model_load = 0.0
        
    # Count model params
    total_params = sum(p.numel() for p in model.parameters())
    
    # Simple byte encoding for text tokens
    tokens = [ord(c) if ord(c) < 256 else 63 for c in text]
    if len(tokens) == 0:
        tokens = [32]
        
    input_ids = torch.tensor([tokens], dtype=torch.long)
    token_count = len(tokens)
    
    captures = []
    hooks = []
    
    t_instrument_start = time.time()
    for block_idx, block in enumerate(model.blocks):
        submodules = [
            ("embed", "Embedding", block.embed),
            ("ln", "LayerNorm", block.ln),
            ("attn", "Attention", block.attn),
            ("drop", "Dropout", block.drop)
        ]
        
        for mod_name, mod_type, module in submodules:
            def make_hook(path, mtype, b_idx):
                def hook(mod, inp, out):
                    inp_tensor = inp[0] if isinstance(inp, tuple) and len(inp) > 0 else None
                    out_tensor = out[0] if isinstance(out, tuple) and len(out) > 0 else out
                    
                    cap = {
                        "module_path": path,
                        "type": mtype,
                        "output": compute_tensor_stats(f"{path}_out", out_tensor)
                    }
                    if inp_tensor is not None:
                        cap["input"] = compute_tensor_stats(f"{path}_in", inp_tensor)
                    captures.append(cap)
                return hook
                
            h = module.register_forward_hook(make_hook(mod_name, mod_type, block_idx))
            hooks.append(h)

    t_infer_start = time.time()
    with torch.no_grad():
        final_out_tensor = model(input_ids)
    t_infer = time.time() - t_infer_start
    
    for h in hooks:
        h.remove()
        
    t_instrument = time.time() - t_instrument_start
    t_total = time.time() - t_start
    
    final_output = compute_tensor_stats("final", final_out_tensor)
    
    result = {
        "version": "1.0-live",
        "model": "BDH (Dragon Hatchling)",
        "total_params": total_params,
        "input_entry": {
            "text": text,
            "tokens": tokens,
            "token_count": token_count,
            "captures": captures,
            "final_output": final_output
        },
        "benchmark": {
            "model_load_ms": round(t_model_load * 1000, 2),
            "inference_ms": round(t_infer * 1000, 2),
            "instrumentation_ms": round(t_instrument * 1000, 2),
            "total_ms": round(t_total * 1000, 2)
        }
    }
    return result

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = sys.argv[1]
    else:
        text = "The dragon flew over the city."
        
    try:
        res = instrument_prompt(text)
        print(json.dumps(res, indent=2))
    except Exception as e:
        import traceback
        err_msg = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(err_msg, indent=2), file=sys.stderr)
        sys.exit(1)
