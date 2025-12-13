import mongoose from 'mongoose';

// Define the schema
const RequestservicesSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    requestservicestype: String,
    description: String,
    date: String,
});


// Create the model
const Requestservices = mongoose.model('Requestservices', RequestservicesSchema);

// Export the model
export default Requestservices;
