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
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        if (
          window.location.pathname !== "/login" &&
          !originalRequest.url?.includes("/login") && 
          !originalRequest.url?.includes("/refresh-token")
        ) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token");

            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/refresh-token`, { refreshToken });
            const newAccessToken = res.data.token || res.data.accessToken; // Tùy backend trả về key nào

            if (newAccessToken) {
              localStorage.setItem("token", newAccessToken);
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            
            const protectedRoutes = ["/profile", "/cart", "/wishlist", "/checkout"];
            const isProtectedRoute = protectedRoutes.some(route => window.location.pathname.startsWith(route));
            
            if (isProtectedRoute) {
              window.location.href = "/login";
            } else {
               window.dispatchEvent(new Event('auth-expired'));
            }
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
