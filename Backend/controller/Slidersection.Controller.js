import moment from 'moment';
import Slidermodel from '../models/Slidersection.models.js';

export const Slidercreate = async (req, res) => {
    const { slidername, sliderimagelink} = req.body;

    // Input validation
    if (!slidername  || !sliderimagelink) {
        return res.status(400).json({
            status: 400,
            message: 'Please provide gift name, gift type, and gift image.'
        });
    }

    try {
        const date = moment().format('YYYY-MM-DD');

        const newSlider = new Slidermodel({
            slidername,
            sliderimagelink,
            date,
        });

        const savedSlider = await newSlider.save();

        res.status(201).json({
            status: 201,
            message: 'Slider created successfully.',
            data: savedSlider,
        });
    } catch (error) {
        console.error('Error creating promotional Slider:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error. Could not create the promotional Slider.',
            error: error.message,
        });
    }
};

// All Acccount View 
export const SliderIndex = async (req, res) => {
    try {
        const Sliderview = await Slidermodel.find();
        res.json(Sliderview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  };

// single Acccount View 
export const SliderSingleDetails = async (req, res) => {
    try {
        const SliderSingleView = await Slidermodel.findById(req.params.id);
        if (SliderSingleView == null) {
            return res.status(404).json({ message: "Cannot Find The Slider" });
        }
        else {
            res.json(SliderSingleView);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
  };

// All Acccount Delete
export const SliderDelete = async (req, res) => {
    const SliderId =  req.params.id;

    try {
         await Slidermodel.deleteOne({_id: SliderId})
         res.json({message:"User Promotionalgifts deleted!"});
    } catch (error) {
     res.status(500).json({message:error.message})
    }
};


// All Acccount Update
export const Sliderupdate  = async (req, res) => {
    const { id } = req.params;
    const { slidername } = req.body;
    const { sliderimagelink } = req.body;

    try {
        // Find the user by ID
        const user = await Slidermodel.findById(id);
        if (!user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        // Update user details
        if (slidername) {
            user.slidername = slidername;
        }
          if (sliderimagelink) {
            user.sliderimagelink = sliderimagelink;
        }
       

        // Save the updated user data
        const updatedUser = await user.save();

        res.status(200).json({ status: 200, updatedUser });
    } catch (error) {
        res.status(401).json({ status: 401, error });
    }
};
