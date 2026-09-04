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

# HuggingFace Spaces yêu cầu cổng 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
