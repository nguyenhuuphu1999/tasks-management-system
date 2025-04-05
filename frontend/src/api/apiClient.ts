
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL, getAuthToken } from './config';

// Tạo instance của axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm để set navigate từ router (nếu dùng React Router)
let navigateFn: ((path: string) => void) | null = null;

export const setNavigate = (navigate: (path: string) => void) => {
  navigateFn = navigate;
};

// Interceptor cho request: Thêm token vào header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`); // Sử dụng phương thức set của AxiosHeaders
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor cho response: Xử lý lỗi 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized: Token invalid or expired. Redirecting to login...');
      localStorage.removeItem('authToken');
      
      // Don't redirect if we're already on login or register page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        if (navigateFn) {
          navigateFn('/login');
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
