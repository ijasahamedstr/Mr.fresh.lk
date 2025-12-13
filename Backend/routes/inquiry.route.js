import express from 'express';
import { Inquirycreate, InquiryIndex, InquirySingleDetails } from '../controller/Inquiry.Controller.js';

// Create a new router instance
const Inquirysection = express.Router();
// Create the Data Register
Inquirysection.post('/',Inquirycreate );

// // View the Data Register
Inquirysection.get('/',InquiryIndex);

// // View the Single Data Register
Inquirysection.get("/:id",InquirySingleDetails);



export default Inquirysection;
