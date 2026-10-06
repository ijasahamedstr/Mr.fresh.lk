import mongoose from "mongoose";

// Helper to convert empty strings ("" or "   ") or null from forms into undefined
// so Mongoose applies default schema values instead of failing cast to Number.
const cleanNum = (v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const num = Number(v);
  return isNaN(num) ? undefined : num;
};

/* ---------- COLOR & SIZE MATRIX ITEM ---------- */
const ColorSizeSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    color: { type: String, required: true, trim: true },
    sizes: { type: [String], default: [] }, // e.g. ["S", "M", "L", "XL", "XXL"]
  },
  { _id: false }
);

/* ---------- VARIANT ---------- */
const VariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Red / M"
    price: { type: Number, set: cleanNum },
    originalPrice: { type: Number, set: cleanNum },
    sku: { type: String, trim: true, default: "" },
    category: { type: String, default: "" },
    images: { type: [String], default: [] },
    quantity: { type: Number, default: 0, set: cleanNum },
    brand: { type: String, trim: true, default: "" },
    productType: { type: String, trim: true, default: "" },
    description: { type: [String], default: [] }, // Array of bullet strings
    size: { type: String, trim: true, default: "" },
    unit: { type: String, trim: true, default: "" },
    weight: { type: Number, set: cleanNum },
  },
  { _id: false }
);

/* ---------- INTERACTIVE OPTION ---------- */
const VariantOptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "Color & Sizes (Clothing)",
        "Primary Color",
        "Color", // Kept for legacy/backward compatibility
        "Size",
        "Selection",
        "Text",
        "Number",
        "Date",
        "CheckBox",
        "Media Image Upload",
        "Unit",
        "Weight",
      ],
      default: "Text",
    },
    label: { type: String, trim: true, default: "" },
    value: { type: mongoose.Schema.Types.Mixed, default: "" }, // String, Number, Boolean, or Array
    choices: { type: String, default: "" }, // Comma-separated choice list for dropdowns
    images: { type: [String], default: [] },
    appliesTo: { type: String, default: "all" }, // "all", "product", or Variant Name/ID
    colorSizes: { type: [ColorSizeSchema], default: [] }, // Nested matrix for "Color & Sizes (Clothing)"
  },
  { _id: false }
);

/* ---------- PRODUCT ---------- */
const ProductSchema = new mongoose.Schema(
  {
    // Basic Info & Identification
    name: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, index: true },
    mainCategory: { type: String, default: "", index: true },
    price: { type: Number, required: true, set: cleanNum },
    originalPrice: { type: Number, set: cleanNum },
    sku: { type: String, trim: true, default: "", index: true },
    size: { type: String, trim: true, default: "" },
    unit: { type: String, trim: true, default: "" },
    weight: { type: Number, set: cleanNum },
    description: { type: String, default: "" },

    // Media & Gallery
    images: { type: [String], default: [] },

    // Geographic Origin & Country Verification
    originType: {
      type: String,
      enum: ["Local", "International"],
      default: "Local",
    },
    country: { type: String, default: "" },
    countryFlag: { type: String, default: "" },

    // Product Specifications
    brand: { type: String, trim: true, default: "" },
    productType: { type: String, trim: true, default: "" },
    keyFeatures: { type: String, default: "" },
    fragrance: { type: String, default: "" },
    itemForm: { type: String, default: "" },
    packagingType: { type: String, default: "" },
    materialTypeFree: { type: String, default: "" },

    // Availability & Delivery Fulfillment
    availability: {
      type: String,
      enum: ["On Hand", "Order Online"],
      default: "On Hand",
    },
    deliveryTime: { type: String, default: "1-3 Days Delivery" },

    // Marketing Flags
    todaySpecial: { type: Boolean, default: false },
    popularProduct: { type: Boolean, default: false },

    // Inventory Status & Limits
    soldOut: { type: Boolean, default: false },
    quantity: { type: Number, default: 0, set: cleanNum },
    minQty: { type: Number, default: 0, set: cleanNum },
    maxQty: { type: Number, default: 0, set: cleanNum },

    // SEO / Search Tags
    tags: { type: String, default: "" },

    // Nested Variants & Options
    variants: { type: [VariantSchema], default: [] },
    options: { type: [VariantOptionSchema], default: [] },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Search optimization index for product title, brand, and tags
ProductSchema.index({ name: "text", brand: "text", tags: "text" });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;