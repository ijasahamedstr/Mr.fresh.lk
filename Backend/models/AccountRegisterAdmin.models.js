import { model, Schema } from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

// Define the schema
const AccountRegisterAdminSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
}, { timestamps: true });

// Create the model
const AccountRegisterAdmin = model("AccountRegisterAdmin", AccountRegisterAdminSchema);

export default AccountRegisterAdmin;
