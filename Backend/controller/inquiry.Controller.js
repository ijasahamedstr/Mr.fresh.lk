import moment from 'moment';
import Inquiry from '../models/Inquiry.models.js';


//  inquiry Create

export const Inquirycreate = async (req, res) => {
  const {
    name,
    mobile,
    inquirytype,
    ordernumber,
    orderdate,
    description,
  } = req.body;

  // Input validation
  if (!name || !mobile || !inquirytype) {
    return res.status(400).json({
      status: 400,
      message: "Name, mobile and inquiry type are required.",
    });
  }

  try {
    const date = moment().format("YYYY-MM-DD");

    const newInquiry = new Inquiry({
      name,
      mobile,
      inquirytype,
      ordernumber: ordernumber || "",
      orderdate: orderdate || "",
      description: description || "",
      date,
    });

    const savedInquiry = await newInquiry.save();

    res.status(201).json({
      status: 201,
      message: "Inquiry created successfully.",
      data: savedInquiry,
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error. Could not create the inquiry.",
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

// single inquiry View 
export const  InquirySingleDetails = async (req, res) => {
    try {
        const  InquirySingleView = await Inquiry.findById(req.params.id);
        if (InquirySingleView == null) {
            return res.status(404).json({ message: "Cannot Find The News" });
        }
        else {
            res.json(InquirySingleView);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
  };



