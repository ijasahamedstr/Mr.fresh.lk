import { useState } from "react";
import { 
  Box, Typography, Stack, Paper, Button, TextField, 
  InputLabel, InputAdornment, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, Divider, CircularProgress,
  Snackbar, Alert, Slide
} from "@mui/material";
import type { SlideProps } from "@mui/material";
import { 
  ArrowBackIosNewOutlined, 
  PersonOutlined, 
  EmailOutlined,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  SecurityOutlined,
  CheckCircleOutline,
  RadioButtonUncheckedOutlined,
  AdminPanelSettingsOutlined,
  AccountCircleOutlined,
  CloudUploadOutlined
} from "@mui/icons-material";

// --- CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "37cd6333d9f4bd044c4a4dcc867276ae";
const primaryTeal = "#004652";
const primaryFont = "'Montserrat', sans-serif";
const borderColor = "#E2E8F0";

// Custom Slide Animation for the Toast Notification
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

// --- CLIENT-SIDE IMAGE COMPRESSION ---
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // Optimal size for a profile picture
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height *= MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width *= MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file); 
              }
            },
            "image/jpeg",
            0.75 
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

interface AddAccountProps {
  onBack: () => void;
}

const NewAccountCreate = ({ onBack }: AddAccountProps) => {
  // 1. STATE MANAGEMENT
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", match: "" });

  // --- ATTRACTIVE NOTIFICATION STATE ---
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info"
  });

  const showToast = (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

  // --- IMGBB UPLOAD HANDLER ---
  const uploadToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || "Failed to upload image");
    }
  };

  // 2. SECURITY & VALIDATION LOGIC
  const checkReq = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(checkReq).every(Boolean);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field === 'confirmPassword' ? 'match' : field]: "" }));
  };

  const handleSaveClick = () => {
    let newErrors = { email: "", password: "", match: "" };
    let hasError = false;

    if (!formData.name || !formData.email || !formData.password) {
      showToast("Name, Email, and Password fields are required.", "warning");
      return;
    }
    if (!isEmailValid) {
      newErrors.email = "Invalid email format.";
      hasError = true;
    }
    if (!isPasswordStrong) {
      newErrors.password = "Password does not meet security requirements.";
      hasError = true;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.match = "Passwords do not match.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      showToast("Please fix the errors in the form before proceeding.", "error");
      return;
    }

    setConfirmDialogOpen(true);
  };

  // 3. DATABASE SYNC
  const confirmSave = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          profileImage: formData.profileImage, 
          password: formData.password
        }),
      });

      if (response.ok) {
        showToast("Admin Account Created Successfully!", "success");
        // Wait 1.5 seconds so the user can see the success message before closing
        setTimeout(() => {
            onBack(); 
        }, 1500);
      } else {
        const error = await response.json();
        showToast(`Server Error: ${error.message}`, "error");
      }
    } catch (err) {
      showToast("Database connection failed. Please check your API status.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 4. SHARED UI STYLES - WITH FIXED BLACK TEXT
  const inputStyle = {
    "& .MuiInputBase-input": {
      color: "#000000 !important", 
      WebkitTextFillColor: "#000000 !important", 
    },
    "& input:-webkit-autofill": { 
      WebkitBoxShadow: "0 0 0 100px #F8FAFC inset !important",
      WebkitTextFillColor: "#000000 !important",
      caretColor: "#000000",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      fontFamily: primaryFont,
      fontSize: "0.85rem",
      fontWeight: 600,
      bgcolor: "#F8FAFC",
      transition: "all 0.2s ease-in-out",
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: borderColor },
      "&.Mui-focused fieldset": { 
        borderColor: primaryTeal, 
        borderWidth: "2px", 
      },
    },
  };

  const sectionHeaderStyle = {
    fontFamily: primaryFont, 
    fontSize: "0.7rem", 
    fontWeight: 900, 
    color: primaryTeal, 
    letterSpacing: 1.2, 
    mb: 2.5,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  };

  const ReqItem = ({ met, text }: { met: boolean, text: string }) => (
    <Stack direction="row" alignItems="center" gap={1} sx={{ color: met ? "#10B981" : "#64748B", transition: "color 0.3s" }}>
      {met ? <CheckCircleOutline sx={{ fontSize: 18 }} /> : <RadioButtonUncheckedOutlined sx={{ fontSize: 18 }} />}
      <Typography sx={{ fontFamily: primaryFont, fontSize: "0.75rem", fontWeight: 600 }}>{text}</Typography>
    </Stack>
  );

  return (
    <Box sx={{ maxWidth: "1400px", mx: "auto", pb: 5 }}>
      {/* HEADERBAR */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Button 
          onClick={onBack} 
          startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: "14px" }} />}
          sx={{ 
            fontFamily: primaryFont, fontSize: "0.8rem", fontWeight: 700, 
            textTransform: 'none', color: "#64748B",
            "&:hover": { bgcolor: "rgba(0,70,82,0.05)", color: primaryTeal }
          }}
        >
          Back to Admin Directory
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={4}>
        
        {/* LEFT COLUMN: ACCOUNT FORM */}
        <Box sx={{ flex: 1.2 }}>
            <Paper elevation={0} sx={{ 
                p: { xs: 3, md: 5 }, borderRadius: "24px", 
                border: `1px solid ${borderColor}`, bgcolor: "#FFF",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)"
            }}>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ bgcolor: "rgba(0,70,82,0.08)", p: 1.5, borderRadius: "12px", border: '1px solid rgba(0,70,82,0.1)' }}>
                        <AdminPanelSettingsOutlined sx={{ color: primaryTeal, fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontFamily: primaryFont, fontWeight: 800, color: primaryTeal, letterSpacing: -0.5 }}>
                            Initialize Admin Account
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                            Create a secure access profile with administrative privileges.
                        </Typography>
                    </Box>
                </Box>

                <Stack spacing={4}>
                    {/* SECTION: IDENTITY */}
                    <Box>
                        <Typography sx={sectionHeaderStyle}>
                            <PersonOutlined sx={{ fontSize: 16 }} /> PERSONAL DETAILS
                        </Typography>
                        <Stack spacing={3}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                <Box>
                                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>FULL NAME *</InputLabel>
                                    <TextField 
                                        fullWidth value={formData.name} onChange={handleChange("name")}
                                        placeholder="e.g. Jane Doe"
                                        sx={inputStyle}
                                    />
                                </Box>
                                <Box>
                                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>WORK EMAIL *</InputLabel>
                                    <TextField 
                                        fullWidth value={formData.email} onChange={handleChange("email")}
                                        placeholder="jane@company.com"
                                        type="email"
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        InputProps={{
                                          startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ fontSize: 18, color: "#94A3B8" }} /></InputAdornment>
                                        }}
                                        sx={inputStyle}
                                    />
                                </Box>
                            </Box>

                            {/* UPLOAD & URL FIELD: PROFILE IMAGE */}
                            <Box>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    id="profile-upload" 
                                    style={{ display: "none" }}
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setIsUploading(true);
                                            try {
                                                const compressed = await compressImage(e.target.files[0]);
                                                const url = await uploadToImgBB(compressed);
                                                setFormData(prev => ({ ...prev, profileImage: url }));
                                                showToast("Image uploaded successfully!", "success");
                                            } catch (err) { 
                                                showToast("Upload failed. Please try again.", "error"); 
                                            } finally { 
                                                setIsUploading(false); 
                                            }
                                        }
                                    }}
                                />
                                <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>PROFILE IMAGE (Optional)</InputLabel>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {formData.profileImage && (
                                        <Box 
                                            component="img" 
                                            src={formData.profileImage} 
                                            onError={(e: any) => {
                                                e.target.src = "https://ui-avatars.com/api/?name=Admin&background=004652&color=fff";
                                            }}
                                            sx={{ width: 45, height: 45, borderRadius: "50%", objectFit: "cover", border: `2px solid ${primaryTeal}` }}
                                        />
                                    )}
                                    <TextField 
                                        fullWidth value={formData.profileImage} onChange={handleChange("profileImage")}
                                        placeholder="Paste URL or click upload ->"
                                        type="url"
                                        InputProps={{
                                          startAdornment: <InputAdornment position="start"><AccountCircleOutlined sx={{ fontSize: 18, color: "#94A3B8" }} /></InputAdornment>,
                                          endAdornment: (
                                            <InputAdornment position="end">
                                                <label htmlFor="profile-upload">
                                                    <IconButton component="span" disabled={isUploading}>
                                                        {isUploading ? <CircularProgress size={20}/> : <CloudUploadOutlined/>}
                                                    </IconButton>
                                                </label>
                                            </InputAdornment>
                                          )
                                        }}
                                        sx={inputStyle}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* SECTION: SECURITY */}
                    <Box>
                        <Typography sx={sectionHeaderStyle}>
                            <SecurityOutlined sx={{ fontSize: 16 }} /> AUTHENTICATION CREDENTIALS
                        </Typography>
                        
                        <Stack spacing={3}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                <Box>
                                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>SECURE PASSWORD *</InputLabel>
                                    <TextField 
                                        fullWidth value={formData.password} onChange={handleChange("password")}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter secure password"
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        InputProps={{ 
                                            startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: "#94A3B8" }} /></InputAdornment>,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        {showPassword ? <VisibilityOffOutlined sx={{ fontSize: 20 }} /> : <VisibilityOutlined sx={{ fontSize: 20 }} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={inputStyle}
                                    />
                                </Box>
                                <Box>
                                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>CONFIRM PASSWORD *</InputLabel>
                                    <TextField 
                                        fullWidth value={formData.confirmPassword} onChange={handleChange("confirmPassword")}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Repeat your password"
                                        error={!!errors.match}
                                        helperText={errors.match}
                                        InputProps={{ 
                                            startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: "#94A3B8" }} /></InputAdornment>
                                        }}
                                        sx={inputStyle}
                                    />
                                </Box>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>

        {/* RIGHT COLUMN: SECURITY CHECKLIST */}
        <Box sx={{ flex: 1 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: `1px solid ${borderColor}`, bgcolor: "#F8FAFC", position: 'sticky', top: 24 }}>
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
                    <SecurityOutlined sx={{ color: primaryTeal }} />
                    <Typography sx={{ fontFamily: primaryFont, fontWeight: 900, fontSize: "0.85rem", color: primaryTeal, letterSpacing: 1 }}>
                        SECURITY REQUIREMENTS
                    </Typography>
                </Stack>
                
                <Typography sx={{ fontFamily: primaryFont, fontSize: "0.8rem", color: "#64748B", mb: 3, lineHeight: 1.6 }}>
                    To ensure the integrity of the admin panel, please establish a strong password meeting the following criteria:
                </Typography>

                <Stack spacing={2} sx={{ mb: 4, bgcolor: "#FFF", p: 3, borderRadius: "16px", border: `1px solid ${borderColor}` }}>
                    <ReqItem met={checkReq.length} text="At least 8 characters long" />
                    <ReqItem met={checkReq.upper} text="Contains at least one uppercase letter (A-Z)" />
                    <ReqItem met={checkReq.lower} text="Contains at least one lowercase letter (a-z)" />
                    <ReqItem met={checkReq.number} text="Contains at least one number (0-9)" />
                    <ReqItem met={checkReq.special} text="Contains a special character (!@#$%, etc.)" />
                </Stack>

                <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={handleSaveClick} 
                    disabled={!isPasswordStrong || !formData.name || !isEmailValid || (formData.password !== formData.confirmPassword) || isUploading}
                    sx={{ 
                        mt: 2, 
                        bgcolor: primaryTeal, 
                        py: 2, 
                        borderRadius: "14px", 
                        fontWeight: 800,
                        "&:disabled": { bgcolor: "#CBD5E1", color: "#94A3B8" }
                    }}
                >
                    Provision Account
                </Button>
            </Paper>
        </Box>
      </Stack>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} PaperProps={{ sx: { borderRadius: "24px", p: 1 } }}>
        <DialogTitle sx={{ fontFamily: primaryFont, fontWeight: 900, color: primaryTeal }}>Confirm Account Provisioning</DialogTitle>
        <DialogContent>
            <Typography sx={{ fontFamily: primaryFont, color: "#475569" }}>
                You are about to create a high-privilege administrative account for <b>{formData.name}</b> ({formData.email}). Are you sure you want to proceed?
            </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConfirmDialogOpen(false)} disabled={loading} sx={{ color: "#64748B", fontWeight: 700 }}>Cancel</Button>
            <Button onClick={confirmSave} variant="contained" disabled={loading} sx={{ bgcolor: primaryTeal, borderRadius: "10px", fontWeight: 700 }}>
              {loading ? "Provisioning..." : "Confirm & Create"}
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- ATTRACTIVE NOTIFICATION TOAST --- */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={SlideTransition}
        sx={{ mt: 7 }} // Push down slightly to avoid covering headers
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          variant="filled"
          elevation={6}
          sx={{ 
            width: '100%', 
            fontFamily: primaryFont, 
            fontWeight: 600, 
            borderRadius: "12px",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
            alignItems: "center"
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewAccountCreate;