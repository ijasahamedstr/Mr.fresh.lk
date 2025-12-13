import express from 'express';
import { RequestIndex, Requestservicescreate } from '../controller/Requestservices.Controller.js';

// Create a new router instance
const Requestservices = express.Router();
// Create the Data Register
Requestservices.post('/',Requestservicescreate);

// // View the Data Register
Requestservices.get('/',RequestIndex);



export default Requestservices;
