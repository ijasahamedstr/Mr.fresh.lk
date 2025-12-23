import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customer: { type: Object, required: true },
    items: { type: Array, required: true },
    delivery: { type: Object, required: true },

    // ✅ MUST BE OBJECT (NOT STRING)
    address: {
      street: String,
      unit: String,
      city: String,
      postal: String,
      country: String,
    },

    mapLocation: {
      lat: Number,
      lng: Number,
    },

    totals: { type: Object, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

// ✅ PREVENT MODEL RECOMPILE BUG
export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
