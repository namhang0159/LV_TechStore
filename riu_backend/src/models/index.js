const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

/*
IMPORT MODELS
*/

db.Category = require("./category")(sequelize, Sequelize);
db.Brand = require("./brand")(sequelize, Sequelize);
db.Product = require("./product")(sequelize, Sequelize);
db.ProductVariant = require("./product_variant")(sequelize, Sequelize);
db.ProductVariantImage = require("./product_variant_images")(
  sequelize,
  Sequelize,
);
db.ProductVariantAttributeValue = require("./product_variant_attribute_values")(
  sequelize,
  Sequelize,
);

db.ProductDescription = require("./product_descriptions")(sequelize, Sequelize);
db.ProductSpec = require("./product_specs")(sequelize, Sequelize);

db.Attribute = require("./attributes")(sequelize, Sequelize);
db.AttributeValue = require("./attribute_values")(sequelize, Sequelize);

db.Inventory = require("./inventory")(sequelize, Sequelize);
db.Warehouse = require("./warehouses")(sequelize, Sequelize);

db.User = require("./users")(sequelize, Sequelize);
db.Admin = require("./admin")(sequelize, Sequelize);

db.UserAddress = require("./user_addresses")(sequelize, Sequelize);

db.Cart = require("./cart")(sequelize, Sequelize);
db.CartItem = require("./cart_items")(sequelize, Sequelize);

db.Wishlist = require("./wishlist")(sequelize, Sequelize);

db.Voucher = require("./vouchers")(sequelize, Sequelize);
db.UserVoucher = require("./user_vouchers")(sequelize, Sequelize);

db.Order = require("./orders")(sequelize, Sequelize);
db.OrderItem = require("./order_items")(sequelize, Sequelize);
db.OrderStatusHistory = require("./order_status_history")(sequelize, Sequelize);
db.OrderVoucher = require("./order_vouchers")(sequelize, Sequelize);

db.Payment = require("./payments")(sequelize, Sequelize);

db.Shipment = require("./shipments")(sequelize, Sequelize);
db.ShippingPartner = require("./shipping_partners")(sequelize, Sequelize);

db.Review = require("./reviews")(sequelize, Sequelize);

db.Warranty = require("./warranties")(sequelize, Sequelize);

db.Banner = require("./banners")(sequelize, Sequelize);
db.Blog = require("./blogs")(sequelize, Sequelize);
db.Author = require("./authors")(sequelize, Sequelize);

db.Tag = require("./tags")(sequelize, Sequelize);
db.ProductTag = require("./product_tags")(sequelize, Sequelize);

db.SerialNumber = require("./serial_numbers")(sequelize, Sequelize);
db.OrderItemSerial = require("./order_item_serials")(sequelize, Sequelize);
db.StaffTask = require("./staff_tasks")(sequelize, Sequelize);
db.InventoryTransaction = require("./inventory_transactions")(sequelize, Sequelize);
db.InventoryTransactionItem = require("./inventory_transaction_items")(sequelize, Sequelize);
db.InventoryTransactionSerial = require("./inventory_transaction_serials")(sequelize, Sequelize);
db.Supplier = require("./suppliers")(sequelize, Sequelize);

/*
RELATIONS
*/

/// CATEGORY
db.Category.hasMany(db.Product, { foreignKey: "category_id" });
db.Product.belongsTo(db.Category, { foreignKey: "category_id" });

/// BRAND
db.Brand.hasMany(db.Product, { foreignKey: "brand_id" });
db.Product.belongsTo(db.Brand, { foreignKey: "brand_id" });

/// PRODUCT VARIANT
db.Product.hasMany(db.ProductVariant, { foreignKey: "product_id" });
db.ProductVariant.belongsTo(db.Product, { foreignKey: "product_id" });

/// VARIANT IMAGES
db.ProductVariant.hasMany(db.ProductVariantImage, { foreignKey: "variant_id" });
db.ProductVariantImage.belongsTo(db.ProductVariant, {
  foreignKey: "variant_id",
});

/// INVENTORY
db.ProductVariant.hasMany(db.Inventory, { foreignKey: "variant_id" });
db.Inventory.belongsTo(db.ProductVariant, { foreignKey: "variant_id" });

db.Warehouse.hasMany(db.Inventory, { foreignKey: "warehouse_id" });
db.Inventory.belongsTo(db.Warehouse, { foreignKey: "warehouse_id" });

/// ATTRIBUTES
db.Attribute.hasMany(db.AttributeValue, { foreignKey: "attribute_id" });
db.AttributeValue.belongsTo(db.Attribute, { foreignKey: "attribute_id" });

db.ProductVariant.belongsToMany(db.AttributeValue, {
  through: db.ProductVariantAttributeValue,
  foreignKey: "variant_id",
  uniqueKey: "variant_attr_val_unique",
});

db.AttributeValue.belongsToMany(db.ProductVariant, {
  through: db.ProductVariantAttributeValue,
  foreignKey: "attribute_value_id",
  uniqueKey: "variant_attr_val_unique",
});

/// PRODUCT DESCRIPTION
db.Product.hasMany(db.ProductDescription, { foreignKey: "product_id" });
db.ProductDescription.belongsTo(db.Product, { foreignKey: "product_id" });

/// PRODUCT SPEC
db.Product.hasMany(db.ProductSpec, { foreignKey: "product_id" });
db.ProductSpec.belongsTo(db.Product, { foreignKey: "product_id" });

/// USER ADDRESS
db.User.hasMany(db.UserAddress, { foreignKey: "user_id" });
db.UserAddress.belongsTo(db.User, { foreignKey: "user_id" });


/// CART
db.User.hasOne(db.Cart, { foreignKey: "user_id" });
db.Cart.belongsTo(db.User, { foreignKey: "user_id" });

db.Cart.hasMany(db.CartItem, { foreignKey: "cart_id" });
db.CartItem.belongsTo(db.Cart, { foreignKey: "cart_id" });

db.ProductVariant.hasMany(db.CartItem, { foreignKey: "variant_id" });
db.CartItem.belongsTo(db.ProductVariant, { foreignKey: "variant_id" });

/// WISHLIST
db.User.hasMany(db.Wishlist, { foreignKey: "user_id" });
db.Wishlist.belongsTo(db.User, { foreignKey: "user_id" });

db.Product.hasMany(db.Wishlist, { foreignKey: "product_id" });
db.Wishlist.belongsTo(db.Product, { foreignKey: "product_id" });

/// VOUCHER
db.User.belongsToMany(db.Voucher, {
  through: db.UserVoucher,
  foreignKey: "user_id",
});

db.Voucher.belongsToMany(db.User, {
  through: db.UserVoucher,
  foreignKey: "voucher_id",
});

db.UserVoucher.belongsTo(db.Voucher, { foreignKey: "voucher_id" });
db.Voucher.hasMany(db.UserVoucher, { foreignKey: "voucher_id" });

db.UserVoucher.belongsTo(db.User, { foreignKey: "user_id" });
db.User.hasMany(db.UserVoucher, { foreignKey: "user_id" });

/// ORDER
db.User.hasMany(db.Order, { foreignKey: "user_id" });
db.Order.belongsTo(db.User, { foreignKey: "user_id" });

db.Order.hasMany(db.OrderItem, { foreignKey: "order_id" });
db.OrderItem.belongsTo(db.Order, { foreignKey: "order_id" });

db.ProductVariant.hasMany(db.OrderItem, { foreignKey: "variant_id" });
db.OrderItem.belongsTo(db.ProductVariant, { foreignKey: "variant_id" });

/// ORDER STATUS
db.Order.hasMany(db.OrderStatusHistory, { foreignKey: "order_id" });
db.OrderStatusHistory.belongsTo(db.Order, { foreignKey: "order_id" });

/// ORDER VOUCHER
db.Order.belongsToMany(db.Voucher, {
  through: db.OrderVoucher,
  foreignKey: "order_id",
});

db.Voucher.belongsToMany(db.Order, {
  through: db.OrderVoucher,
  foreignKey: "voucher_id",
});
db.Order.belongsTo(db.Warehouse, { foreignKey: "warehouse_id" });
db.Warehouse.hasMany(db.Order, { foreignKey: "warehouse_id" });
db.Order.belongsTo(db.Admin, { foreignKey: "created_by" });
/// PAYMENT
db.Order.hasMany(db.Payment, { foreignKey: "order_id" });
db.Payment.belongsTo(db.Order, { foreignKey: "order_id" });

/// SHIPPING
db.Order.hasOne(db.Shipment, { foreignKey: "order_id" });
db.Shipment.belongsTo(db.Order, { foreignKey: "order_id" });

db.ShippingPartner.hasMany(db.Shipment, { foreignKey: "shipping_partner_id" });
db.Shipment.belongsTo(db.ShippingPartner, {
  foreignKey: "shipping_partner_id",
});

/// REVIEW
db.Product.hasMany(db.Review, { foreignKey: "product_id" });
db.Review.belongsTo(db.Product, { foreignKey: "product_id" });

db.User.hasMany(db.Review, { foreignKey: "user_id" });
db.Review.belongsTo(db.User, { foreignKey: "user_id" });

/// WARRANTY
db.SerialNumber.hasMany(db.Warranty, { foreignKey: "serial_number_id" });
db.Warranty.belongsTo(db.SerialNumber, { foreignKey: "serial_number_id" });

db.User.hasMany(db.Warranty, { foreignKey: "user_id" });
db.Warranty.belongsTo(db.User, { foreignKey: "user_id" });

db.Order.hasMany(db.Warranty, { foreignKey: "order_id" });
db.Warranty.belongsTo(db.Order, { foreignKey: "order_id" });

/// TAG
db.Product.belongsToMany(db.Tag, {
  through: db.ProductTag,
  foreignKey: "product_id",
});

db.Tag.belongsToMany(db.Product, {
  through: db.ProductTag,
  foreignKey: "tag_id",
});

/// SERIAL NUMBERS
db.ProductVariant.hasMany(db.SerialNumber, { foreignKey: "variant_id" });
db.SerialNumber.belongsTo(db.ProductVariant, { foreignKey: "variant_id" });

db.Warehouse.hasMany(db.SerialNumber, { foreignKey: "warehouse_id" });
db.SerialNumber.belongsTo(db.Warehouse, { foreignKey: "warehouse_id" });

/// ORDER ITEM SERIALS
db.OrderItem.hasMany(db.OrderItemSerial, { foreignKey: "order_item_id" });
db.OrderItemSerial.belongsTo(db.OrderItem, { foreignKey: "order_item_id" });

db.SerialNumber.hasMany(db.OrderItemSerial, { foreignKey: "serial_number_id" });
db.OrderItemSerial.belongsTo(db.SerialNumber, { foreignKey: "serial_number_id" });

/// STAFF TASKS
db.Order.hasMany(db.StaffTask, { foreignKey: "order_id" });
db.StaffTask.belongsTo(db.Order, { foreignKey: "order_id" });

db.OrderItem.hasMany(db.StaffTask, { foreignKey: "order_item_id" });
db.StaffTask.belongsTo(db.OrderItem, { foreignKey: "order_item_id" });

db.Admin.hasMany(db.StaffTask, { foreignKey: "staff_id" });
db.StaffTask.belongsTo(db.Admin, { foreignKey: "staff_id" });

/// INVENTORY TRANSACTIONS
db.Warehouse.hasMany(db.InventoryTransaction, { foreignKey: "warehouse_id" });
db.InventoryTransaction.belongsTo(db.Warehouse, { foreignKey: "warehouse_id" });

db.Admin.hasMany(db.InventoryTransaction, { foreignKey: "created_by" });
db.InventoryTransaction.belongsTo(db.Admin, { foreignKey: "created_by" });

db.InventoryTransaction.hasMany(db.InventoryTransactionItem, { foreignKey: "transaction_id" });
db.InventoryTransactionItem.belongsTo(db.InventoryTransaction, { foreignKey: "transaction_id" });

db.ProductVariant.hasMany(db.InventoryTransactionItem, { foreignKey: "variant_id" });
db.InventoryTransactionItem.belongsTo(db.ProductVariant, { foreignKey: "variant_id" });

db.InventoryTransactionItem.hasMany(db.InventoryTransactionSerial, { foreignKey: "transaction_item_id" });
db.InventoryTransactionSerial.belongsTo(db.InventoryTransactionItem, { foreignKey: "transaction_item_id" });

db.SerialNumber.hasMany(db.InventoryTransactionSerial, { foreignKey: "serial_number_id" });
db.InventoryTransactionSerial.belongsTo(db.SerialNumber, { foreignKey: "serial_number_id" });

/// BLOG & AUTHOR
db.Author.hasMany(db.Blog, { foreignKey: "author_id" });
db.Blog.belongsTo(db.Author, { foreignKey: "author_id" });

module.exports = db;
