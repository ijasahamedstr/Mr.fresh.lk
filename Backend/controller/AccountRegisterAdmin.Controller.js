import bcrypt from 'bcrypt'; // Make sure bcrypt is imported
import AccountRegisterAdmin from '../models/AccountRegisterAdmin.models.js';

export const AccountCreatAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // Simple email validation (you can use a more complex regex or a validation library)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  // Check if user already exists
  const existingUser = await AccountRegisterAdmin.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists.' });
  }

  try {
    // Prepare the data object for the new user
    const newUserData = {
      name,
      email,
    };

    // Check if a password is provided and hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      newUserData.password = await bcrypt.hash(password, salt);
    }

    // Create a new user
    const newUser = new AccountRegisterAdmin(newUserData);

    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};


// All Acccount View 
export const AccountIndex = async (req, res) => {
  try {
      const AccountIndex = await AccountRegisterAdmin.find();
      res.json(AccountIndex);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// single Acccount View 
export const AccountSingleDetails = async (req, res) => {
  try {
      const AccountsSingleView = await AccountRegisterAdmin.findById(req.params.id);
      if (AccountsSingleView == null) {
          return res.status(404).json({ message: "Cannot Find The User Acoount" });
      }
      else {
          res.json(AccountsSingleView);
      }
  } catch (error) {
      return res.status(500).json({ message: error.message });
  }
};

// All Acccount Delete
export const AccountDelete = async (req, res) => {
  const AccountId =  req.params.id;
  
  try {
       await AccountRegisterAdmin.deleteOne({_id: AccountId})
       res.json({message:"User Acoount deleted!"});
  } catch (error) {
   res.status(500).json({message:error.message})
  }
};

// Account Update 
export const AccountUpdateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, username } = req.body;

  try {
    // Validate the incoming data (you can add your validation here)
    if (!id) {
      return res.status(400).json({ status: 400, message: "User ID is required" });
    }

    // Find the user by ID
    const user = await AccountRegisterAdmin.findById(id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Update user details only if provided
    const updates = {};

    if (name) updates.name = name;
    if (username) updates.username = username;
    if (email) updates.email = email;

    // If password is provided, hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    // Use the updates object to update the user
    await user.set(updates); // More efficient way to update fields

    // Save the updated user data
    const updatedUser = await user.save();

    // Return the updated user
    res.status(200).json({ status: 200, updatedUser });

  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

