import express from "express";
import { OrderCreate } from "../controller/Order.Controller.js";

// Create a new router instance
const OrderserviceSection = express.Router();

// Create new course
OrderserviceSection.post("/",OrderCreate);

// View all courses
OrderserviceSection.get("/",);


export default OrderserviceSection;
