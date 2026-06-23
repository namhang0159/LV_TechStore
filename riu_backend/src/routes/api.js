const express = require("express");
const { register, login, fetchMe } = require("../controllers/userControllers");

const { getAllOrders, getOrderById, createOrder, getMyOrders, getOrderByCode, updateOrderStatus } = require("../controllers/orderController");
const { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController");
const { getAllAuthors, createAuthor } = require("../controllers/authorController");
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, getCategoryBySlug } = require("../controllers/categoryController");
const { createBrand, getAllBrands, getBrandById, updateBrand, deleteBrand } = require("../controllers/brandController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const router = express.Router();

// Category routes
router.post("/categories", createCategory);
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.get("/categories/slug/:slug", getCategoryBySlug);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Brand routes
router.post("/brands", createBrand);
router.get("/brands", getAllBrands);
router.get("/brands/:id", getBrandById);
router.put("/brands/:id", updateBrand);
router.delete("/brands/:id", deleteBrand);

// Attribute routes
const attributeController = require("../controllers/attributeController");
router.post("/attributes", attributeController.createAttribute);
router.get("/attributes", attributeController.getAllAttributes);
router.get("/attributes/:id", attributeController.getAttributeById);
router.put("/attributes/:id", attributeController.updateAttribute);
router.delete("/attributes/:id", attributeController.deleteAttribute);
router.post("/attributes/:attributeId/values", attributeController.createAttributeValue);
router.delete("/attributes/values/:valueId", attributeController.deleteAttributeValue);

// Tag routes
const tagController = require("../controllers/tagController");
router.post("/tags", tagController.createTag);
router.get("/tags", tagController.getAllTags);
router.get("/tags/:id", tagController.getTagById);
router.delete("/tags/:id", tagController.deleteTag);

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, fetchMe);
// User Address routes
const userAddressController = require("../controllers/userAddressController");
router.get("/addresses", authMiddleware, userAddressController.getUserAddresses);
router.post("/addresses", authMiddleware, userAddressController.addUserAddress);
router.put("/addresses/:id", authMiddleware, userAddressController.updateUserAddress);
router.delete("/addresses/:id", authMiddleware, userAddressController.deleteUserAddress);
router.put("/addresses/:id/default", authMiddleware, userAddressController.setDefaultAddress);
// Product routes
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductBySlug } = require("../controllers/productController");
router.post("/admin/products", createProduct);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/products/slug/:slug", getProductBySlug);
// Cart routes
const cartController = require("../controllers/cartController");
router.get("/cart", authMiddleware, cartController.getCart);
router.post("/cart", authMiddleware, cartController.addToCart);
router.post("/cart/clear", authMiddleware, cartController.clearCart);
router.put("/cart/updateVariant", authMiddleware, cartController.updateVariantCart);
router.put("/cart/:itemId", authMiddleware, cartController.updateCartItem);
router.delete("/cart/:itemId", authMiddleware, cartController.removeFromCart);
// Wishlist routes
const wishlistController = require("../controllers/wishlistController");
router.get("/wishlist", authMiddleware, wishlistController.getWishlist);
router.post("/wishlist", authMiddleware, wishlistController.addToWishlist);
router.delete("/wishlist/:productId", authMiddleware, wishlistController.removeFromWishlist);

// Review routes
const reviewController = require("../controllers/reviewController");
router.get("/products/:productId/reviews", reviewController.getProductReviews);
router.post("/reviews", authMiddleware, reviewController.createReview);
router.get("/admin/reviews", authMiddleware, adminMiddleware, reviewController.getAllReviewsAdmin);
router.put("/admin/reviews/:id/status", authMiddleware, adminMiddleware, reviewController.updateReviewStatus);
router.delete("/admin/reviews/:id", authMiddleware, adminMiddleware, reviewController.deleteReview);

// Warehouse routes
const warehouseController = require("../controllers/warehouseController");
router.post("/warehouses", authMiddleware, adminMiddleware, warehouseController.createWarehouse);
router.get("/warehouses", authMiddleware, adminMiddleware, warehouseController.getAllWarehouses);
router.get("/warehouses/:id", authMiddleware, adminMiddleware, warehouseController.getWarehouseById);
router.put("/warehouses/:id", authMiddleware, adminMiddleware, warehouseController.updateWarehouse);
router.delete("/warehouses/:id", authMiddleware, adminMiddleware, warehouseController.deleteWarehouse);

// Supplier routes
const supplierController = require("../controllers/supplierController");
router.post("/suppliers", supplierController.createSupplier);
router.get("/suppliers", supplierController.getAllSuppliers);
router.put("/suppliers/:id", supplierController.updateSupplier);
router.delete("/suppliers/:id", supplierController.deleteSupplier);

// Inventory routes
const inventoryController = require("../controllers/inventoryController");
router.get("/inventory", inventoryController.getInventory);
router.post("/inventory/transactions", authMiddleware, inventoryController.createTransaction);
router.get("/inventory/transactions/:id", authMiddleware, adminMiddleware, inventoryController.getTransactionById);
router.get("/admin/inventory/serials", authMiddleware, adminMiddleware, inventoryController.getAvailableSerials);

// Order routes
router.post("/orders", authMiddleware, createOrder);
router.get("/orders/my-orders", authMiddleware, getMyOrders);
router.get("/orders/:id", authMiddleware, getOrderById);
router.get("/admin/orders/code/:code", authMiddleware, adminMiddleware, getOrderByCode);

router.get("/admin/orders", authMiddleware, adminMiddleware, getAllOrders);
router.get("/admin/orders/:id", authMiddleware, adminMiddleware, getOrderById);
router.put("/admin/orders/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
// router.delete("/admin/orders/:id", authMiddleware, adminMiddleware, deleteOrder);
// Shipping routes
const shippingController = require("../controllers/shippingController");
router.post("/shipping-partners", shippingController.createShippingPartner);
router.get("/shipping-partners", shippingController.getAllShippingPartners);
router.put("/shipping-partners/:id", shippingController.updateShippingPartner);
router.delete("/shipping-partners/:id", shippingController.deleteShippingPartner);
router.post("/shipments", shippingController.createShipment);
router.put("/shipments/:id", shippingController.updateShipmentStatus);

// Payment routes
const paymentController = require("../controllers/paymentController");
router.post("/payments", paymentController.createPayment);
router.get("/orders/:orderId/payments", paymentController.getPaymentByOrderId);
router.put("/payments/:id/status", paymentController.updatePaymentStatus);

// Voucher routes
const voucherController = require("../controllers/voucherController");
router.post("/vouchers", authMiddleware, adminMiddleware, voucherController.createVoucher);
router.get("/vouchers", voucherController.getAllVouchers);
router.get("/vouchers/my-vouchers", authMiddleware, voucherController.getMyVouchers);
router.get("/vouchers/:id", voucherController.getVoucherById);
router.put("/vouchers/:id", authMiddleware, adminMiddleware, voucherController.updateVoucher);
router.delete("/vouchers/:id", authMiddleware, adminMiddleware, voucherController.deleteVoucher);
router.post("/vouchers/apply", voucherController.applyVoucher);
router.post("/vouchers/:voucherId/save", authMiddleware, voucherController.saveUserVoucher);
router.get("/admin/vouchers", authMiddleware, adminMiddleware, voucherController.getAllVouchersByAdmin);
router.get("/admin/vouchers/:id", authMiddleware, adminMiddleware, voucherController.getVoucherAdminById);
// Warranty routes
const warrantyController = require("../controllers/warrantyController");
router.post("/warranties/activate", warrantyController.activateWarranty);
router.get("/warranties/my-warranties", authMiddleware, warrantyController.getUserWarranties);

// Blog routes
router.get("/blogs", getAllBlogs);
router.get("/blogs/:id", getBlogById);
router.post("/admin/blog", authMiddleware, adminMiddleware, createBlog);
router.put("/admin/blog/:id", authMiddleware, adminMiddleware, updateBlog);
router.delete("/admin/blog/:id", authMiddleware, adminMiddleware, deleteBlog);

// Author routes
router.get("/authors", getAllAuthors);
router.post("/authors", createAuthor);

// Admin routes
const adminController = require("../controllers/adminController");

router.post("/admin/login", adminController.loginAdmin);
router.post("/admin/users", authMiddleware, adminMiddleware, adminController.createAdmin); // authMiddleware can be an admin check
router.get("/admin/users", authMiddleware, adminMiddleware, adminController.getAllAdmins);
router.get("/admin/me", authMiddleware, adminMiddleware, adminController.fetchAdmin);

// Customer routes (Admin)
const customerController = require("../controllers/customerController");
router.get("/admin/customers-clustering", authMiddleware, adminMiddleware, customerController.getCustomerClustering);
router.get("/admin/customers", authMiddleware, adminMiddleware, customerController.getAllCustomers);
router.get("/admin/customers/:id", authMiddleware, adminMiddleware, customerController.getCustomerById);
router.put("/admin/customers/:id/status", authMiddleware, adminMiddleware, customerController.updateCustomerStatus);

// Staff Task routes
const staffTaskController = require("../controllers/staffTaskController");
router.post("/staff/tasks", authMiddleware, staffTaskController.assignTask);
router.get("/staff/tasks", authMiddleware, staffTaskController.getStaffTasks);
router.put("/staff/tasks/:id/status", authMiddleware, staffTaskController.updateTaskStatus);

// Banner routes
const bannerController = require("../controllers/bannerController");
router.post("/admin/banners", authMiddleware, adminMiddleware, bannerController.createBanner);
router.get("/banners", bannerController.getActiveBanners);
router.put("/admin/banners/:id", authMiddleware, adminMiddleware, bannerController.updateBanner);
router.delete("/admin/banners/:id", authMiddleware, adminMiddleware, bannerController.deleteBanner);

// Report routes
const reportController = require("../controllers/reportController");
router.get("/admin/reports/dashboard", authMiddleware, adminMiddleware, reportController.getDashboardReport);

// AI Analysis routes
const aiAnalysisController = require("../controllers/aiAnalysisController");
router.get("/admin/behavioral-analysis", authMiddleware, adminMiddleware, aiAnalysisController.getBehavioralAnalysis);
router.get("/admin/customer-analytics/ai-insights", authMiddleware, adminMiddleware, aiAnalysisController.getCustomerBehaviorAnalysis);

module.exports = router;
