import bcrypt from 'bcrypt'; // Import bcrypt
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import AccountRegisterAdmin from '../models/AccountRegisterAdmin.models.js'; // Your model
import dotenv from 'dotenv'; // Import dotenv for environment variables

// Load environment variables from .env file
dotenv.config();

// Account login process
export const AccountLoginAdmin = async (req, res) => {
    const { email, password } = req.body;

    // Input validation: Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Find the user by email in the database
        const user = await AccountRegisterAdmin.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
    
        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password); // bcrypt.compare is async, so use await
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
    
        // Generate a JWT token (replace "your-secret-key" with your actual secret key from environment variables)
        const token = jwt.sign(
            { email: user.email, id: user._id }, // Payload (user data)
            process.env.JWT_SECRET_KEY, // Use the secret key from environment variables
            { expiresIn: "1h" } // Set the token expiration time
        );
    
        // Send the token as a response
        res.json({ token });
    } catch (err) {
        console.error("Login error:", err); // For debugging purposes
        return res.status(500).json({ message: "Internal server error" });
    }
};
