import mongoose from "mongoose";

/* ---------- VARIANT ---------- */
const VariantSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    originalPrice: Number,
    sku: String,
    weight: Number,
    images: [String],
  },
  { _id: false }
);

/* ---------- PRODUCT ---------- */
const ProductSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    category: { type: String, required: true },
    mainCategory: { type: String },
    price: { type: Number, required: true },
    originalPrice: Number,
    sku: String,
    weight: Number,
    description: String,

    // Media
    images: [String],

    // 🔥 Product Origin & Localization
    originType: { type: String, default: "Local" }, // "Local" or "International"
    country: String,
    countryFlag: String,

    // 🔥 Product Specifications
    brand: String,
    productType: String,
    keyFeatures: String,
    unit: String,
    fragrance: String,
    itemForm: String,
    packagingType: String,
    materialTypeFree: String,

    // 🔥 Availability & Delivery
    availability: { type: String, default: "On Hand" }, // "On Hand" or "Order Online"
    deliveryTime: { type: String, default: "1-3 Days Delivery" },

    // 🔥 Marketing Flags
    todaySpecial: { type: Boolean, default: false },
    popularProduct: { type: Boolean, default: false },

    // 🔥 Inventory Status
    soldOut: { type: Boolean, default: false },
    quantity: { type: Number, default: 0 },
    minQty: { type: Number, default: 0 },
    maxQty: { type: Number, default: 0 },

    tags: String,

    variants: [VariantSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);