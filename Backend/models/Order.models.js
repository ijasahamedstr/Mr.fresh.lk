import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    // You can customize these fields to match your real cart item structure
    courseId: { type: String },
    title: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 },
    // allow any extra fields
  },
  { _id: false, strict: false }
);

const OrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    inquirytype: { type: String, required: true },

    ordernumber: { type: String },
    orderdate: { type: String }, // keep as string since frontend sends date string

    description: { type: String },

    // cart from normal courses
    cartCourses: {
      type: [CartItemSchema],
      default: [],
    },

    // cart from OTT if any
    ottCart: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("OrderModel", OrderSchema);

export default OrderModel;