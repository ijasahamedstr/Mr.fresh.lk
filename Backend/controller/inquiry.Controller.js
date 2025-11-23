import moment from 'moment';
import Inquiry from '../models/inquiry.models.js';


//  inquiry Create

export const inquirycreate = async (req, res) => {
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


// // All inquiry View 
// export const NewsIndex = async (req, res) => {
//     try {
//         const Newsview = await News.find();
//         res.json(Newsview);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
//   };

// // single inquiry View 
// export const NewsSingleDetails = async (req, res) => {
//     try {
//         const NewsSingleView = await News.findById(req.params.id);
//         if (NewsSingleView == null) {
//             return res.status(404).json({ message: "Cannot Find The News" });
//         }
//         else {
//             res.json(NewsSingleView);
//         }
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
//   };

// //  inquiry Delete
// export const NewsDelete = async (req, res) => {
//     const NewsId =  req.params.id;

//     try {
//          await News.deleteOne({_id: NewsId})
//          res.json({message:"User News deleted!"});
//     } catch (error) {
//      res.status(500).json({message:error.message})
//     }
// };


