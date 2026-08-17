import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/AccountRegisterAdmin.models.js';

// Helper for JWT Signing
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '1d',
    });
};

// --- CREATE NEW ADMIN ---
export const createAdmin = async (req, res) => {
    try {
        // Password hashing is handled by the pre-save hook in the Model
        const admin = new Admin(req.body);
        await admin.save();
        
        const adminData = admin.toObject();
        delete adminData.password;
        delete adminData.twoFASecret;

        res.status(201).json({ success: true, admin: adminData });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- SETUP 2FA (QR CODE) ---
export const setup2FA = async (req, res) => {
    try {
        const { adminId } = req.body;
        const secret = speakeasy.generateSecret({ name: `RealEstateAdmin (${adminId})` });
        
        await Admin.findByIdAndUpdate(adminId, { twoFASecret: secret.base32 });

        QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) return res.status(500).json({ message: "Error generating QR code" });
            res.json({ qrCode: data_url });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- VERIFY 2FA ---
export const verify2FA = async (req, res) => {
  try {
    const { adminId, token } = req.body;
    
    // 1. Fetch admin and explicitly include the secret
    const admin = await Admin.findById(adminId).select('+twoFASecret');

    if (!admin || !admin.twoFASecret) {
      return res.status(404).json({ message: "Admin or 2FA setup not found" });
    }

    // 2. Verify with a Time-Window (Fixes most "not working" issues)
    const verified = speakeasy.totp.verify({
      secret: admin.twoFASecret,
      encoding: 'base32',
      token: token.replace(/\s+/g, ''), // Remove accidental spaces
      window: 1 // +/- 30 second allowance for clock drift
    });

    if (verified) {
      admin.twoFAEnabled = true;
      admin.loginAttempts = 0; // Reset attempts on successful 2FA
      await admin.save();

      res.json({ 
        success: true, 
        message: "2FA verified successfully",
        // Return any login data needed if this is the final login step
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid verification code" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error during verification" });
  }
};

// --- LOGIN LOGIC ---
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email }).select('+password +twoFASecret');

        if (!admin) {
            return res.status(401).json({ message: "Invalid login credentials" });
        }

        // 1. Check Lock Status
        if (admin.isLocked()) {
            const diff = admin.lockUntil - Date.now();
            const minutes = Math.ceil(diff / (1000 * 60));
            return res.status(403).json({ 
                message: `Account is temporarily locked. Try again after ${minutes} minutes.` 
            });
        }

        // 2. Password Comparison
        let isMatch = false;
        if (admin.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, admin.password);
        } else if (password && admin.password) {
            // Safety: Only match if both are non-empty strings
            isMatch = (password === admin.password);
        }

        if (!isMatch) {
            admin.loginAttempts = (admin.loginAttempts || 0) + 1;

            if (admin.loginAttempts >= 3) {
                admin.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
                await admin.save();
                return res.status(403).json({ 
                    message: "Account locked for 24 hours due to multiple failed attempts" 
                });
            }

            await admin.save();
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Success: Reset Attempts
        admin.loginAttempts = 0;
        admin.lockUntil = null;
        await admin.save();

        // 4. Handle 2FA Check
        if (admin.twoFAEnabled) {
            return res.json({ requires2FA: true, adminId: admin._id });
        }

        // 5. Finalize Login
        const jwtToken = signToken(admin._id);
        res.json({ 
            success: true, 
            token: jwtToken, 
            admin: { name: admin.name, profileImage: admin.profileImage } 
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- MANUAL UNLOCK ---
export const manualUnlock = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findByIdAndUpdate(id, {
            loginAttempts: 0,
            lockUntil: null
        }, { new: true });

        if (!admin) return res.status(404).json({ message: "Admin not found" });
        res.status(200).json({ success: true, message: "Account unlocked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Unlock process failed" });
    }
};

// --- UPDATE & DELETE (CRUD) ---
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password -twoFASecret');
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data" });
    }
};

export const updateAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true, runValidators: true }
        ).select('-password -twoFASecret');

        if (!updatedAdmin) return res.status(404).json({ message: "Admin not found" });

        res.status(200).json({ success: true, message: "Data updated successfully", admin: updatedAdmin });
    } catch (error) {
        res.status(400).json({ message: "Error updating data" });
    }
};

export const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await Admin.findByIdAndDelete(id);
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error during deletion" });
    }
};