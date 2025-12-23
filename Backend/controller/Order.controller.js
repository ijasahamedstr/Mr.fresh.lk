import OrderModel from "../models/Order.model.js";

/* ================= CREATE ORDER ================= */
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      delivery,
      address,
      mapLocation,
      totals,
    } = req.body;

    if (
      !mapLocation ||
      typeof mapLocation.lat !== "number" ||
      typeof mapLocation.lng !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Map location required",
      });
    }

    const order = await OrderModel.create({
      customer,
      items,
      delivery,
      address,
      mapLocation,
      totals,
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};

/* ================= GET ALL ORDERS ================= */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ================= GET SINGLE ORDER ================= */
export const getOrderById = async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

/* ================= UPDATE STATUS ================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order" });
  }
};
