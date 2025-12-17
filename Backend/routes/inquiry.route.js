import express from 'express';
import { Inquirycreate, InquiryIndex } from '../controller/Inquiry.Controller.js';

// Create a new router instance
const Inquirysection = express.Router();
// Create the Data Register
Inquirysection.post('/', Inquirycreate);

// // View the Data Register
Inquirysection.get('/',InquiryIndex);


export default Inquirysection;
