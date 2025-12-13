import moment from 'moment';
import Requestservices from '../models/Requestservices.models.js';


//  inquiry Create

export const Requestservicescreate = async (req, res) => {
    const { name, mobile, requestservicestype, description } = req.body;

    // Input validation
    if (!name || !mobile || !requestservicestype || !description) {
        return res.status(400).json({
            status: 400,
            message: 'Please provide name, mobile, inquiry type, order number, and order date.'
        });
    }

    try {
        const date = moment().format('YYYY-MM-DD');

        const newRequestservices = new Requestservices({
            name,
            mobile,
            requestservicestype,
            description,
            date,
        });

        const savedRequestservices = await newRequestservices.save();

        res.status(201).json({
            status: 201,
            message: 'Requestservices created successfully.',
            data: savedRequestservices,
        });
    } catch (error) {
        console.error('Error creating Requestservices:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error. Could not create the Requestservices.',
            error: error.message,
        });
    }
};


// All inquiry View 
export const RequestIndex = async (req, res) => {
    try {
        const Requestservicesview = await Requestservices.find();
        res.json(Requestservicesview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  };

