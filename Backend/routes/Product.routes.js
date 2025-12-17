import express from 'express';
import { createProduct, getProducts } from '../controller/Product.controller.js';

// Create a new router instance
const Productssection = express.Router();

// Create the Data Register
Productssection.post('/',createProduct);

// View the Data Register
Productssection.get('/',getProducts);

export default Productssection;
