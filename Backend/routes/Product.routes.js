import express from 'express';
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controller/Product.controller.js';

// Create a new router instance
const Productssection = express.Router();

// Create the Data Register
Productssection.post('/',createProduct);

// View the Data Register
Productssection.get('/',getProducts);

Productssection.get("/:id", getProductById);

Productssection.put("/:id",updateProduct);

Productssection.delete("/:id",deleteProduct);

export default Productssection;
