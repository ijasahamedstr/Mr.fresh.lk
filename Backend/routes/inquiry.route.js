import express from 'express';
import { Inquirycreate, InquiryIndex } from '../controller/Inquiry.Controller.js';

// Create a new router instance
const inquirysection = express.Router();
// Create the Data Register
inquirysection.post('/', Inquirycreate);

// // View the Data Register
inquirysection.get('/',InquiryIndex);


export default inquirysection;
