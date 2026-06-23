import axios from "./axios";

export const login = async (email: string, password: string) => {
    const res = await axios.post(`/login`, { email, password });
    return res.data;
};
export const register = async (name: string, email: string, password: string, phone?: string, birth_date?: string) => {
    const res = await axios.post(`/register`, { name, email, password, phone, birth_date });
    return res.data;
};
export const fetchMe = async () => {
    const res = await axios.get(`/me`);
    return res.data;
};
export const getAllProduct = async () => {
    const res = await axios.get(`/products`);
    return res.data;
};
export const getProductBySlug = async (slug: string) => {
    const res = await axios.get(`/products/slug/${slug}`);
    return res.data;
};

export const getAllCategory = async () => {
    const res = await axios.get(`/categories`);
    return res.data;
};
export const getCategoryBySlug = async (slug: string) => {
    const res = await axios.get(`/categories/slug/${slug}`);
    return res.data;
};
export const getCart = async () => {
    const res = await axios.get(`/cart`);
    return res.data;
};
export const addCart = async (variant_id: string, quantity: number) => {
    const res = await axios.post(`/cart`, { variant_id, quantity });
    return res.data;
};
export const updateCartItem = async (itemId: number, quantity: number) => {
    const res = await axios.put(`/cart/${itemId}`, { quantity });
    return res.data;
};
export const updateVariantCart = async (itemId: number, newVariantId: number) => {
    const res = await axios.put(`/cart/updateVariant`, { itemId, newVariantId });
    return res.data;
};
export const removeFromCart = async (itemId: number) => {
    const res = await axios.delete(`/cart/${itemId}`);
    return res.data;
};
export const clearCart = async () => {
    const res = await axios.post(`/cart/clear`);
    return res.data;
};
export const getUserAddresses = async () => {
    const res = await axios.get(`/addresses`);
    return res.data;
};
export const addUserAddress = async (receiver_name: string, phone: string, province: string, district: string, ward: string, address_line: string, is_default: boolean) => {
    const res = await axios.post(`/addresses`, { receiver_name, phone, province, district, ward, address_line, is_default });
    return res.data;
};
export const updateUserAddress = async (addressId: string, data: { receiver_name: string, phone: string, province: string, district: string, ward: string, address_line: string, is_default: boolean }) => {
    const res = await axios.put(`/addresses/${addressId}`, data);
    return res.data;
};
export const deleteUserAddress = async (addressId: string) => {
    const res = await axios.delete(`/addresses/${addressId}`);
    return res.data;
};
export const setDefaultAddress = async (addressId: string) => {
    const res = await axios.put(`/addresses/${addressId}/default`);
    return res.data;
};
export const getMe = async () => {
    const res = await axios.get(`/me`);
    return res.data;
};
export const getOrders = async () => {
    const res = await axios.get(`/orders/my-orders`);
    return res.data;
};
export const getOrderById = async (orderId: string) => {
    const res = await axios.get(`/orders/${orderId}`);
    return res.data;
};

export const createOrder = async (orderData: any) => {
    const res = await axios.post(`/orders`, orderData);
    return res.data;
};

// Vouchers API
export const getAllVouchers = async () => {
    const res = await axios.get(`/vouchers`);
    return res.data;
};

export const saveVoucher = async (voucherId: number) => {
    const res = await axios.post(`/vouchers/${voucherId}/save`);
    return res.data;
};

export const getMyVouchers = async () => {
    const res = await axios.get(`/vouchers/my-vouchers`);
    return res.data;
};
export const getAllBlog = async () => {
    const res = await axios.get(`/blogs`);
    return res.data;
};
export const getBlogById = async (id: string) => {
    const res = await axios.get(`/blogs/${id}`);
    return res.data;
};
export const getWishlist = async () => {
    const res = await axios.get(`/wishlist`);
    return res.data;
};
export const addToWishlist = async (productId: number) => {
    const res = await axios.post(`/wishlist`, { product_id: productId });
    return res.data;
};
export const removeFromWishlist = async (productId: number) => {
    const res = await axios.delete(`/wishlist/${productId}`);
    return res.data;
};

export const sendMessageToAI = async (history: any[], message: string) => {
    const res = await axios.post(`/chat`, { history, message });
    return res.data;
};

export const getProductReviews = async (productId: number) => {
    const res = await axios.get(`/products/${productId}/reviews`);
    return res.data;
};

export const createReview = async (productId: number, orderId: number, rating: number, comment: string) => {
    const res = await axios.post(`/reviews`, { product_id: productId, order_id: orderId, rating, comment });
    return res.data;
};