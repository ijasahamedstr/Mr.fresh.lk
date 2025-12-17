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
    name: { type: String, required: true },

    category: { type: String, required: true },
    mainCategory: { type: String },

    price: { type: Number, required: true },
    originalPrice: Number,
    sku: String,
    weight: Number,
    description: String,

    images: [String],

     /* 🔥 NEW FLAGS */
    todaySpecial: { type: Boolean, default: false },
    popularProduct: { type: Boolean, default: false },

    visibility: { type: Boolean, default: true },
    soldOut: { type: Boolean, default: false },
    trackQty: { type: Boolean, default: true },

    quantity: { type: Number, default: 0 },
    minQty: { type: Number, default: 0 },
    maxQty: { type: Number, default: 0 },

    tags: String,

    variants: [VariantSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
