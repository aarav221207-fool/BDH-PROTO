# Production Dockerfile for BDH PyTorch Express Server on Cloud Run
FROM node:22-bookworm-slim

# Install Python3, pip, and essential build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (PyTorch, NumPy)
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build frontend static files and compile server bundle
RUN npm run build

# Cloud Run sets the PORT environment variable dynamically (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
