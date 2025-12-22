import express from "express";
import { createOrder, getAllOrders, getOrderById, updateOrderStatus } from "../controller/Order.controller.js";

const Odersection = express.Router();

/* ================= ROUTES ================= */
Odersection.post("/", createOrder);
Odersection.get("/", getAllOrders);
Odersection.get("/:id", getOrderById);
Odersection.put("/:id/status", updateOrderStatus);

export default Odersection;
