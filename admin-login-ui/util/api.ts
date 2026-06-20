import axios from "./axios";

export const loginAdmin = async (email: string, password: string) => {
    return await axios.post(`/api/admin/login`, { email, password });
}
export const fetchAdmin = async () => {
    return await axios.get(`/api/admin/me`);
}
export const getAllProducts = async () => {
    return await axios.get(`/api/products`);
}
export const getProductById = async (id: number) => {
    return await axios.get(`/api/products/${id}`);
}
export const createProduct = async (data: any) => {
    return await axios.post(`/api/admin/products`, data);
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
export const updateOrderStatus = async (id: number, data: { order_status?: string, payment_status?: string, note?: string }) => {
    return await axios.put(`/api/admin/orders/${id}/status`, data);
}
export const getAllCategory = async () => {
    return await axios.get(`/api/categories`);
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
export const getInventoryTransactionById = async (id: number) => {
    return await axios.get(`/api/inventory/transactions/${id}`);
}