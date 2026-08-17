import { useState } from "react";
import { 
  Box, Typography, Stack, Paper, Button, TextField, 
  InputLabel, InputAdornment, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Tooltip, IconButton, Avatar
} from "@mui/material";
import { 
  ArrowBackIosNewOutlined, 
  PersonOutlined, 
  LinkOutlined, 
  EmailOutlined,
  CloudUploadOutlined,
  InfoOutlined,
  EditOutlined,
  LockOutlined
} from "@mui/icons-material";
import type { AdminAccount } from "./UserAccount";

// --- CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "37cd6333d9f4bd044c4a4dcc867276ae";
const primaryTeal = "#004652";
const primaryFont = "'Montserrat', sans-serif";
const borderColor = "#E2E8F0";

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
        const MAX_WIDTH = 800; 
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
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg", lastModified: Date.now() });
                resolve(compressedFile);
              } else {
                resolve(file); 
              }
            },
            "image/jpeg", 0.75 
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

interface UpdateProps {
  adminData: AdminAccount;
  onBack: () => void;
}

const EditAdmin = ({ adminData, onBack }: UpdateProps) => {
  // 1. STATE MANAGEMENT
  const [formData, setFormData] = useState({
    name: adminData.name,
    email: adminData.email,
    profileImage: adminData.profileImage || "",
    password: "" // Left blank so we don't overwrite if they don't type a new one
  });

  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- IMGBB UPLOAD HANDLER ---
  const uploadToImgBB = async (file: File) => {
    const data = new FormData();
    data.append("image", file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: data });
    const json = await res.json();
    if (json.success) return json.data.url;
    throw new Error(json.error?.message || "Failed to upload image");
  };

  // 2. HANDLERS
  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleUpdateClick = () => {
    if (!formData.name || !formData.email) {
      alert("Name and Email are required fields.");
      return;
    }
    setConfirmDialogOpen(true);
  };

  // 3. FAST DATABASE SYNC (PUT REQUEST)
  const confirmUpdate = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);

    try {
      const payload: any = { 
        name: formData.name, 
        email: formData.email, 
        profileImage: formData.profileImage 
      };
      
      // Only send password if they typed a new one
      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const response = await fetch(`${API_BASE_URL}/api/edit/${adminData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onBack(); 
      } else {
        const errorData = await response.json();
        alert(`Server Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Database connection failed. Please check your API status.");
    } finally {
      setLoading(false);
    }
  };

  // Shared Input Style with Text Color Visibility Fix
  const inputStyle = {
    "& .MuiInputBase-input": { color: "#000000 !important", WebkitTextFillColor: "#000000 !important" },
    "& input:-webkit-autofill": { WebkitBoxShadow: "0 0 0 100px #F8FAFC inset !important", WebkitTextFillColor: "#000000 !important", caretColor: "#000000" },
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px", fontFamily: primaryFont, fontSize: "0.85rem", fontWeight: 600, bgcolor: "#F8FAFC",
      transition: "all 0.2s ease-in-out",
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: borderColor },
      "&.Mui-focused fieldset": { borderColor: primaryTeal, borderWidth: "2px", bgcolor: "#FFF" },
    },
    "& .MuiInputLabel-root": { fontFamily: primaryFont, fontSize: "0.75rem", fontWeight: 700,  }
  };

  const sectionHeaderStyle = {
    fontFamily: primaryFont, fontSize: "0.7rem", fontWeight: 900, color: primaryTeal, 
    letterSpacing: 1.2, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1
  };

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
          Back to Directory
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={4}>
        
        {/* LEFT COLUMN: CONFIGURATION FORM */}
        <Box sx={{ flex: 1.2 }}>
            <Paper elevation={0} sx={{ 
                p: { xs: 3, md: 5 }, borderRadius: "24px", 
                border: `1px solid ${borderColor}`, bgcolor: "#FFF",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)"
            }}>
                
                {/* TITLE SECTION */}
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ bgcolor: "rgba(0,70,82,0.08)", p: 1.5, borderRadius: "12px", border: '1px solid rgba(0,70,82,0.1)' }}>
                        <EditOutlined sx={{ color: primaryTeal, fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontFamily: primaryFont, fontWeight: 800, color: primaryTeal, letterSpacing: -0.5 }}>
                            Modify Admin Profile
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                            Updating records for UID: <span style={{ color: primaryTeal }}>{adminData._id.substring(0,8)}...</span>
                        </Typography>
                    </Box>
                </Box>

                <Stack spacing={4}>
                    <Box>
                        <Typography sx={sectionHeaderStyle}>
                            <PersonOutlined sx={{ fontSize: 16 }} /> PERSONAL INFORMATION
                        </Typography>
                        <Stack spacing={3}>
                            <Box>
                                <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>FULL NAME</InputLabel>
                                <TextField 
                                    fullWidth value={formData.name} onChange={handleChange("name")}
                                    placeholder="e.g. John Doe"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ color: primaryTeal, fontSize: 18 }} /></InputAdornment> }}
                                    sx={inputStyle}
                                />
                            </Box>
                            <Box>
                                <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>EMAIL ADDRESS</InputLabel>
                                <TextField 
                                    fullWidth value={formData.email} onChange={handleChange("email")} type="email"
                                    placeholder="admin@company.com"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: primaryTeal, fontSize: 18 }} /></InputAdornment> }}
                                    sx={inputStyle}
                                />
                            </Box>
                        </Stack>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    <Box>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2.5 }}>
                            <Typography sx={{ ...sectionHeaderStyle, mb: 0 }}>
                                <LockOutlined sx={{ fontSize: 16 }} /> SECURITY & MEDIA
                            </Typography>
                            <Tooltip title="Leave password blank unless you need to reset it.">
                                <InfoOutlined sx={{ fontSize: 14, color: "#94A3B8", cursor: "help" }} />
                            </Tooltip>
                        </Stack>

                        <Stack spacing={3}>
                            {/* PROFILE IMAGE UPLOAD */}
                            <Box>
                                <input type="file" accept="image/*" id="profile-upload" style={{ display: "none" }}
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setIsUploading(true);
                                            try {
                                                const compressed = await compressImage(e.target.files[0]);
                                                const url = await uploadToImgBB(compressed);
                                                setFormData(prev => ({ ...prev, profileImage: url }));
                                            } catch (err) { alert("Upload failed"); } finally { setIsUploading(false); }
                                        }
                                    }}
                                />
                                <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>PROFILE IMAGE URL</InputLabel>
                                <TextField 
                                    fullWidth value={formData.profileImage} onChange={handleChange("profileImage")}
                                    placeholder="Paste URL or upload image ->"
                                    InputProps={{ 
                                        startAdornment: <InputAdornment position="start"><LinkOutlined sx={{ fontSize: 18, color: primaryTeal }} /></InputAdornment>,
                                        endAdornment: <InputAdornment position="end">
                                            <label htmlFor="profile-upload">
                                              <IconButton component="span" disabled={isUploading} sx={{ color: primaryTeal }}>
                                                {isUploading ? <CircularProgress size={20} color="inherit"/> : <CloudUploadOutlined/>}
                                              </IconButton>
                                            </label>
                                        </InputAdornment>
                                    }}
                                    sx={inputStyle}
                                />
                            </Box>

                            {/* PASSWORD RESET */}
                            <Box>
                                <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>NEW PASSWORD (OPTIONAL)</InputLabel>
                                <TextField 
                                    fullWidth value={formData.password} onChange={handleChange("password")} type="password"
                                    placeholder="Leave blank to keep current password"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: primaryTeal, fontSize: 18 }} /></InputAdornment> }}
                                    sx={inputStyle}
                                />
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>

        {/* RIGHT COLUMN: PREVIEW */}
        <Box sx={{ flex: 1 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: `1px solid ${borderColor}`, bgcolor: "#FFF", position: 'sticky', top: 24, textAlign: 'center' }}>
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 900, fontSize: "0.7rem", color: primaryTeal, letterSpacing: 1, mb: 4, textAlign: 'left' }}>
                    PROFILE PREVIEW
                </Typography>
                
                <Avatar 
                  src={formData.profileImage || undefined} 
                  sx={{ width: 140, height: 140, mx: "auto", mb: 3, bgcolor: primaryTeal, border: '4px solid #F8FAFC', boxShadow: '0 10px 25px rgba(0,70,82,0.1)' }}
                >
                  {!formData.profileImage && formData.name.substring(0,2).toUpperCase()}
                </Avatar>

                <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "1.2rem", color: primaryTeal }}>
                  {formData.name || "Administrator Name"}
                </Typography>
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 600, fontSize: "0.85rem", color: "#64748B", mt: 0.5 }}>
                  {formData.email || "admin@example.com"}
                </Typography>

                <Box sx={{ mt: 4, p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, mb: 0.5 }}>ACCOUNT UID</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: primaryTeal, fontWeight: 700, fontFamily: 'monospace' }}>{adminData._id}</Typography>
                </Box>

                <Button fullWidth variant="contained" onClick={handleUpdateClick} sx={{ mt: 4, bgcolor: primaryTeal, py: 1.8, borderRadius: "14px", fontWeight: 800, "&:hover": { bgcolor: "#002d35" } }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Save Profile Changes"}
                </Button>
            </Paper>
        </Box>
      </Stack>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} PaperProps={{ sx: { borderRadius: "24px" } }}>
        <DialogTitle sx={{ fontFamily: primaryFont, fontWeight: 900, fontSize: "1.1rem", textAlign: "center", pt: 3, color: primaryTeal }}>
            Confirm Profile Update
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
            <Typography sx={{ fontFamily: primaryFont, fontSize: "0.85rem", color: "#64748B", lineHeight: 1.6 }}>
                You are about to save changes for administrator <b>{formData.name || 'Untitled'}</b>.
            </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 4, px: 4, gap: 2 }}>
            <Button onClick={() => setConfirmDialogOpen(false)} variant="outlined" sx={{ flex: 1, borderRadius: "12px", fontFamily: primaryFont, fontWeight: 700, color: "#64748B", borderColor: borderColor }}>
                Cancel
            </Button>
            <Button onClick={confirmUpdate} variant="contained" sx={{ flex: 1, borderRadius: "12px", bgcolor: primaryTeal, fontFamily: primaryFont, fontWeight: 800, py: 1.2, boxShadow: '0 8px 20px rgba(0,70,82,0.2)', "&:hover": { bgcolor: "#002d35" } }}>
                Confirm Update
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditAdmin;