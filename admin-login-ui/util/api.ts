import axios from "./axios";

export const loginAdmin = async (email: string, password: string) => {
    return await axios.post(`/api/admin/login`, { email, password });
}
export const fetchAdmin = async () => {
    return await axios.get(`/api/admin/me`);
}
export const getAllAdmins = async () => {
    return await axios.get(`/api/admin/users`);
}
export const createAdmin = async (data: any) => {
    return await axios.post(`/api/admin/users`, data);
}
export const updateAdmin = async (id: number, data: any) => {
    return await axios.put(`/api/admin/users/${id}`, data);
}
export const deleteAdmin = async (id: number) => {
    return await axios.delete(`/api/admin/users/${id}`);
}
export const getAllProducts = async (page = 1, limit = 10) => {
    return await axios.get(`/api/products?page=${page}&limit=${limit}`);
}
export const getProductById = async (id: number) => {
    return await axios.get(`/api/products/${id}`);
}
export const createProduct = async (data: any) => {
    return await axios.post(`/api/admin/products`, data);
}
export const updateProduct = async (id: number, data: any) => {
    return await axios.put(`/api/products/${id}`, data);
}
export const deleteProduct = async (id: number) => {
    return await axios.delete(`/api/products/${id}`);
}
export const getAllOrders = async () => {
    return await axios.get(`/api/admin/orders`);
}
export const getOrderById = async (id: number) => {
    return await axios.get(`/api/admin/orders/${id}`);
}
export const getOrderByCode = async (code: string) => {
    return await axios.get(`/api/admin/orders/code/${code}`);
}
export const updateOrderStatus = async (id: number, data: { order_status?: string, payment_status?: string, note?: string, serial_numbers?: any[], shipper_id?: number }) => {
    return await axios.put(`/api/admin/orders/${id}/status`, data);
}
export const getAllCategory = async (page = 1, limit = 10) => {
    return await axios.get(`/api/categories?page=${page}&limit=${limit}`);
}
export const getAllBrands = async () => {
    return await axios.get(`/api/brands`);
}
export const getAllTags = async () => {
    return await axios.get(`/api/tags`);
}
export const createTag = async (data: any) => {
    return await axios.post(`/api/tags`, data);
}
export const getAllAttributes = async () => {
    return await axios.get(`/api/attributes`);
}
export const createAttribute = async (data: any) => {
    return await axios.post(`/api/attributes`, data);
}
export const createAttributeValue = async (attributeId: number, data: any) => {
    return await axios.post(`/api/attributes/${attributeId}/values`, data);
}
export const getCategoryById = async (id: number) => {
    return await axios.get(`/api/categories/${id}`);
}
export const createCategory = async (data: any) => {
    return await axios.post(`/api/categories`, data);
}
export const updateCategory = async (id: number, data: any) => {
    return await axios.put(`/api/categories/${id}`, data);
}
export const deleteCategory = async (id: number) => {
    return await axios.delete(`/api/categories/${id}`);
}
export const getAllWarehouses = async () => {
    return await axios.get(`/api/warehouses`);
}
export const getWarehouseById = async (id: number) => {
    return await axios.get(`/api/warehouses/${id}`);
}
export const getAllCustomers = async () => {
    return await axios.get(`/api/admin/customers`);
}
export const getCustomerById = async (id: number) => {
    return await axios.get(`/api/admin/customers/${id}`);
}
export const updateCustomerStatus = async (id: number, status: string) => {
    return await axios.put(`/api/admin/customers/${id}/status`, { status });
}
export const getAllVoucher = async () => {
    return await axios.get(`/api/admin/vouchers`);
}
export const getVoucherById = async (id: number) => {
    return await axios.get(`/api/admin/vouchers/${id}`);
}
export const createVoucher = async (data: any) => {
    return await axios.post(`/api/vouchers`, data);
}
export const updateVoucher = async (id: number, data: any) => {
    return await axios.put(`/api/vouchers/${id}`, data);
}
export const deleteVoucher = async (id: number) => {
    return await axios.delete(`/api/vouchers/${id}`);
}
export const applyVoucher = async (data: { code: string, orderTotal: number, userId?: number }) => {
    return await axios.post(`/api/vouchers/apply`, data);
}
export const getAllBlogs = async () => {
    return await axios.get(`/api/blogs`);
}
export const getBlogById = async (id: number) => {
    return await axios.get(`/api/blogs/${id}`);
}
export const createBlog = async (data: any) => {
    return await axios.post(`/api/admin/blog`, data);
}
export const updateBlog = async (id: number, data: any) => {
    return await axios.put(`/api/admin/blog/${id}`, data);
}
export const deleteBlog = async (id: number) => {
    return await axios.delete(`/api/admin/blog/${id}`);
}
export const getAllBanners = async () => {
    return await axios.get(`/api/banners`);
}
export const createBanner = async (data: any) => {
    return await axios.post(`/api/admin/banners`, data);
}
export const updateBanner = async (id: number, data: any) => {
    return await axios.put(`/api/admin/banners/${id}`, data);
}
export const deleteBanner = async (id: number) => {
    return await axios.delete(`/api/admin/banners/${id}`);
}
export const getReport = async () => {
    return await axios.get(`/api/admin/reports/dashboard`);
}
export const createInventoryTransaction = async (data: any) => {
    return await axios.post(`/api/inventory/transactions`, data);
}
export const getAllSuppliers = async () => {
    return await axios.get(`/api/suppliers`);
}
export const createSupplier = async (data: any) => {
    return await axios.post(`/api/suppliers`, data);
}
export const updateSupplier = async (id: number, data: any) => {
    return await axios.put(`/api/suppliers/${id}`, data);
}
export const deleteSupplier = async (id: number) => {
    return await axios.delete(`/api/suppliers/${id}`);
}
export const getInventoryTransactionById = async (id: number) => {
    return await axios.get(`/api/inventory/transactions/${id}`);
}
export const getAvailableSerials = async (variantId: number, warehouseId: number) => {
    return await axios.get(`/api/admin/inventory/serials?variant_id=${variantId}&warehouse_id=${warehouseId}`);
}
export const getAllReviews = async () => {
    return await axios.get(`/api/admin/reviews`);
}
export const updateReviewStatus = async (id: number, status: string) => {
    return await axios.put(`/api/admin/reviews/${id}/status`, { status });
}
export const deleteReview = async (id: number) => {
    return await axios.delete(`/api/admin/reviews/${id}`);
}
export const getAllBehavioralAnalysis = async (generate: boolean = false) => {
    return await axios.get(`/api/admin/behavioral-analysis?generate=${generate}`);
}
export const getCustomerClustering = async () => {
    return await axios.get(`/api/admin/customers-clustering`);
}
export const getCustomerBehaviorAnalysisAI = async (generate: boolean = false) => {
    return await axios.get(`/api/admin/customer-analytics/ai-insights?generate=${generate}`);
}

export const createDirectOrder = async (data: any) => {
    return await axios.post(`/api/admin/orders/direct`, data);
}

export const getAllWarranties = async () => {
    return await axios.get(`/api/admin/warranties`);
}

export const getAllStaffTasksAdmin = async () => {
    return await axios.get(`/api/admin/staff-tasks`);
}

export const getStaffTasks = async () => {
    return await axios.get(`/api/staff/tasks`);
}

export const assignStaffTask = async (data: any) => {
    return await axios.post(`/api/staff/tasks`, data);
}

export const updateTaskStatus = async (id: number, status: string, payment_status?: string) => {
    return await axios.put(`/api/staff/tasks/${id}/status`, { status, payment_status });
}

export const deleteStaffTask = async (id: number) => {
    return await axios.delete(`/api/admin/staff-tasks/${id}`);
}
