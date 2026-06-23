import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor cho request để tự động attach token
axiosInstance.interceptors.request.use(
  (config) => {
    // Kiểm tra window để tránh lỗi khi chạy SSR (Next.js)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor cho response để xử lý lỗi chung (VD: 401)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xử lý khi token hết hạn hoặc không hợp lệ
      if (typeof window !== "undefined") {
        // Không redirect nếu đang ở trang login hoặc gọi api login
        if (
          window.location.pathname !== "/login" &&
          !error.config.url?.includes("/login")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          // Chỉ chuyển hướng nếu đang ở các trang yêu cầu đăng nhập
          const protectedRoutes = ["/profile", "/cart", "/wishlist", "/checkout"];
          const isProtectedRoute = protectedRoutes.some(route => window.location.pathname.startsWith(route));
          
          if (isProtectedRoute) {
            window.location.href = "/login";
          } else {
             // Có thể dispatch một custom event để báo cho các component biết đã bị đăng xuất
             window.dispatchEvent(new Event('auth-expired'));
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
