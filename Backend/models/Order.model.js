import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      whatsapp: { type: String, required: true },
    },

    items: [
      {
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],

    delivery: {
      location: String,
      charge: Number,
    },

    address: {
      street: String,
      unit: String,
      city: String,
      postal: String,
      country: String,
    },

    // ✅ GOOGLE MAP LOCATION
    mapLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    totals: {
      itemsTotal: Number,
      grandTotal: Number,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
