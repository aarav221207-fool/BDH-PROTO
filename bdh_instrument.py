import sys
import time
import json
import torch
import torch.nn as nn
from bdh import BDH, BDHConfig

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
    
    t_model_start = time.time()
    if model is None:
        config = BDHConfig()
        model = BDH(config)
        model.eval()
    t_model_load = time.time() - t_model_start
    
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
        "text": text,
        "tokens": tokens,
        "token_count": token_count,
        "captures": captures,
        "final_output": final_output,
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
        
    res = instrument_prompt(text)
    print(json.dumps(res, indent=2))
