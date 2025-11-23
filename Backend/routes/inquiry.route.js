import express from 'express';
import { inquirycreate } from '../controller/inquiry.Controller.js';

// Create a new router instance
const inquirysection = express.Router();
// Create the Data Register
inquirysection.post('/',inquirycreate );

// // View the Data Register

// // View the Single Data Register
// inquirysection.get("/:id",);

// //Delete Data Register
// inquirysection.delete('/:id',);

// //Update Data Register
// inquirysection.put('/:id',);


export default inquirysection;
