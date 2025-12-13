import moment from "moment";
import OrderModel from "../models/Order.models.js"; // 👈 make sure the path + .js are correct

export const OrderCreate = async (req, res) => {
  try {
    const {
      name,
      mobile,
      inquirytype,
      ordernumber,
      orderdate,
      description,
      cartCourses = [],
      ottCart = [],
    } = req.body;

    // ✅ basic validation
    if (!name || !mobile || !inquirytype) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile and inquiry type are required.",
      });
    }

    // ✅ use today's date if orderdate is not sent
    const finalOrderDate =
      orderdate && orderdate.trim() !== ""
        ? orderdate
        : moment().format("YYYY-MM-DD");

    const newOrder = new OrderModel({
      name,
      mobile,
      inquirytype,
      ordernumber,
      orderdate: finalOrderDate,
      description,
      cartCourses,
      ottCart,
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order / Inquiry saved successfully.",
      data: savedOrder,
    });
  } catch (error) {
    console.error("Error saving order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving order.",
    });
  }
};