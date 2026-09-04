# Build React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build Python backend + serve everything
FROM python:3.11-slim
WORKDIR /app

# Cài Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ project
COPY . .

# Copy file React đã build từ bước trên
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Render dùng biến môi trường $PORT (thường là 10000)
# HuggingFace dùng 7860. Dùng $PORT để tương thích cả hai.
EXPOSE 10000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}"]
