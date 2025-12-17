import express from 'express';
import { createProduct, getProducts } from '../controller/Product.controller.js';

// Create a new router instance
const Productssection = express.Router();


// Create the Data Register
Productssection.post('/',createProduct);

// View the Data Register
Productssection.get('/',getProducts);

// View the Single Data Register
Productssection.get("/:id",);

//Delete Data Register
Productssection.delete('/:id',);

//Update Data Register
Productssection.put('/:id',);


export default Productssection;
