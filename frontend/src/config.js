// Trong production (HuggingFace/Docker), API chạy cùng server với Frontend
// Nên dùng đường dẫn tương đối "".
// Khi chạy local, dùng http://localhost:8000
export const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:8000';
