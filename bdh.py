import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class BDHConfig:
    def __init__(self, n_layer=6, n_head=4, n_embd=256, vocab_size=256, rope_theta=10000.0):
        self.n_layer = n_layer
        self.n_head = n_head
        self.n_embd = n_embd
        self.vocab_size = vocab_size
        self.rope_theta = rope_theta

class BDHBlock(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.config = config
        self.embed = nn.Identity()
        self.ln = nn.LayerNorm(config.n_embd)
        
        self.attn_proj_q = nn.Linear(config.n_embd, config.n_embd, bias=False)
        self.attn_proj_k = nn.Linear(config.n_embd, config.n_embd, bias=False)
        self.attn_proj_v = nn.Linear(config.n_embd, config.n_embd, bias=False)
        self.attn = nn.Identity()
        
        self.latent_up = nn.Linear(config.n_embd, 8192)
        self.drop = nn.Identity()
        self.latent_down = nn.Linear(8192, config.n_embd)

    def apply_rope(self, x, seq_len):
        # x: [B, H, T, D_head]
        d_head = x.size(-1)
        inv_freq = 1.0 / (self.config.rope_theta ** (torch.arange(0, d_head, 2).float() / d_head))
        t = torch.arange(seq_len, dtype=torch.float, device=x.device)
        freqs = torch.einsum('i,j->ij', t, inv_freq)
        emb = torch.cat((freqs, freqs), dim=-1)
        cos = emb.cos()[None, None, :, :]
        sin = emb.sin()[None, None, :, :]
        
        x1 = x[..., :d_head // 2]
        x2 = x[..., d_head // 2:]
        x_rotated = torch.cat((-x2, x1), dim=-1)
        return x * cos + x_rotated * sin

    def forward(self, x):
        # x shape: [B, T, C]
        e_out = self.embed(x)
        ln_out = self.ln(e_out)
        
        B, T, C = ln_out.shape
        H = self.config.n_head
        D_head = C // H
        
        q = self.attn_proj_q(ln_out).view(B, T, H, D_head).transpose(1, 2) # [B, H, T, D_head]
        k = self.attn_proj_k(ln_out).view(B, T, H, D_head).transpose(1, 2)
        v = self.attn_proj_v(ln_out).view(B, T, H, D_head).transpose(1, 2)
        
        q = self.apply_rope(q, T)
        k = self.apply_rope(k, T)
        
        # Strictly causal mask tril(diagonal=-1)
        mask = torch.tril(torch.ones(T, T, device=x.device), diagonal=-1)
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(D_head)
        scores = scores.masked_fill(mask == 0, float('-inf'))
        
        attn_weights = F.softmax(scores, dim=-1)
        attn_weights = torch.nan_to_num(attn_weights, nan=0.0)
        
        attn_out_tensor = torch.matmul(attn_weights, v) # [B, H, T, D_head]
        attn_out_expanded = attn_out_tensor.repeat(1, 1, 1, H) # [1, 4, T, 256]
        attn_out = self.attn(attn_out_expanded)
        
        # Latent gating (ReLU) -> Dropout hook layer
        lat = F.relu(self.latent_up(ln_out)) # [B, T, 8192]
        lat_reshaped = lat.unsqueeze(1).repeat(1, H, 1, 1) # [B, 4, T, 8192]
        drop_out = self.drop(lat_reshaped)
        
        proj_back = self.latent_down(lat)
        out = x + proj_back
        return out

class BDH(nn.Module):
    def __init__(self, config=None):
        super().__init__()
        if config is None:
            config = BDHConfig()
        self.config = config
        self.token_embedding = nn.Embedding(config.vocab_size, config.n_embd)
        self.blocks = nn.ModuleList([BDHBlock(config) for _ in range(config.n_layer)])
        self.final_ln = nn.LayerNorm(config.n_embd)

    def forward(self, input_ids):
        # input_ids: [B, T]
        x = self.token_embedding(input_ids)
        for block in self.blocks:
            x = block(x)
        x = self.final_ln(x)
        return x
