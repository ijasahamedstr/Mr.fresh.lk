import moment from 'moment';
import Inquiry from '../models/Inquiry.models.js';


//  inquiry Create

export const Inquirycreate = async (req, res) => {
    const { name, mobile, inquirytype, ordernumber, orderdate } = req.body;

    // Input validation
    if (!name || !mobile || !inquirytype || !ordernumber || !orderdate) {
        return res.status(400).json({
            status: 400,
            message: 'Please provide name, mobile, inquiry type, order number, and order date.'
        });
    }

    try {
        const date = moment().format('YYYY-MM-DD');

        const newInquiry = new Inquiry({
            name,
            mobile,
            inquirytype,
            ordernumber,
            orderdate,
            date,
        });

        const savedInquiry = await newInquiry.save();

        res.status(201).json({
            status: 201,
            message: 'Inquiry created successfully.',
            data: savedInquiry,
        });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error. Could not create the inquiry.',
            error: error.message,
        });
    }
};


// All inquiry View 
export const InquiryIndex = async (req, res) => {
    try {
        const Inquiryview = await Inquiry.find();
        res.json(Inquiryview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  };