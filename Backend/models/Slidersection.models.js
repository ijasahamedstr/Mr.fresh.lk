import mongoose from 'mongoose';

// Define the schema
const SlidermodelSchema = new mongoose.Schema({
    slidername: {
        type: String,
    },
    sliderimagelink: {
        type: String,
    },
    date: {
        type: Date
    }
});

// Create the model
const Slidermodel = mongoose.model('Slidermodel', SlidermodelSchema);

// Export the model
export default Slidermodel;
