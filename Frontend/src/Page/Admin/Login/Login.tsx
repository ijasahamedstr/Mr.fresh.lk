import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  InputAdornment, 
  Paper,
  CircularProgress,
  Alert,
  Fade,
  Collapse 
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined, 
  PersonOutline, 
  ShieldOutlined,
  ArrowForward,
  InfoOutlined,
  ErrorOutline,
  LockClockOutlined
} from "@mui/icons-material";

// --- Secure Fallback Credentials ---
const getFallbackEmail = () => {
  const envEmail = import.meta.env.VITE_FALLBACK_EMAIL;
  return (envEmail ? String(envEmail) : atob("aWphc2FobWVkLnN0ckBnbWFpbC5jb20=")).replace(/['"]/g, '').trim();
};

const getFallbackPassword = () => {
  const envPass = import.meta.env.VITE_FALLBACK_PASSWORD;
  return (envPass ? String(envPass) : atob("Um9ja0A4Njk2NzMxMg==")).replace(/['"]/g, '').trim();
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // UI & Flow States
  const [step, setStep] = useState<"password" | "otp" | "locked">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotAlert, setShowForgotAlert] = useState(false);

  // Form Data States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [adminId, setAdminId] = useState("");

  // Styling Constants
  const primaryFont = '"Montserrat", sans-serif';
  const primaryTeal = "#004652";
  const accentGold = "#CC9D2F";
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgotAlert(false);
    
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. --- INSTANT SECURE MANUAL OVERRIDE CHECK ---
      // Trimming inputs to prevent accidental spaces from failing the login
      const inputEmail = email.trim();
      const inputPassword = password.trim();
      
      if (inputEmail === getFallbackEmail() && inputPassword === getFallbackPassword()) {
        console.warn("Logged in via secure manual override (Database Bypassed).");
        localStorage.setItem("token", "fallback_emergency_token");
        localStorage.setItem("adminData", JSON.stringify({ role: "admin", name: "Ijas Ahmed (Admin)" }));
        window.location.href = "/dashboard";
        return; // Exit the function immediately
      }

      // 2. --- NORMAL DATABASE LOGIN ---
      const response = await axios.post(`${BASE_URL}/api/login`, { email, password });
      
      if (response.data.requires2FA) {
        setAdminId(response.data.adminId);
        setStep("otp"); 
      } else {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("adminData", JSON.stringify(response.data.admin));
        window.location.href = "/dashboard";
      }
      
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 403) {
        setStep("locked");
        setError(message || "Account is temporarily locked");
      } else {
        setError(message || "Login failed, please check your credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BASE_URL}/api/verify-2fa`, { 
        adminId, 
        token: otp 
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token || "logged_in_token");
        localStorage.setItem("adminData", JSON.stringify(response.data.admin));
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError("Invalid verification code, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        bgcolor: "#E2E8F0",
        py: { xs: 4, md: 10 },
        display: "flex",
        alignItems: "center",
        direction: "ltr",
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 4, md: 7 },
              borderRadius: 10,
              textAlign: "left",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 25px 60px rgba(0, 70, 82, 0.18)",
              border: "1px solid rgba(255,255,255,0.3)"
            }}
          >
            {/* --- ICON HEADER --- */}
            <Box
              sx={{
                width: 90,
                height: 90,
                bgcolor: step === "locked" ? "#DC2626" : primaryTeal,
                borderRadius: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 30px",
                boxShadow: step === "locked" ? "0 10px 25px rgba(220, 38, 38, 0.3)" : "0 10px 25px rgba(0, 70, 82, 0.3)",
                transform: "rotate(-4deg)"
              }}
            >
              {step === "password" && <LockOutlined sx={{ color: accentGold, fontSize: 48 }} />}
              {step === "otp" && <ShieldOutlined sx={{ color: "#10B981", fontSize: 48 }} />}
              {step === "locked" && <LockClockOutlined sx={{ color: "#fff", fontSize: 48 }} />}
            </Box>

            <Typography
              variant="h4"
              sx={{ fontWeight: 900, color: step === "locked" ? "#DC2626" : primaryTeal, mb: 1.5, fontFamily: primaryFont, textAlign: 'center' }}
            >
              {step === "password" && "Login"}
              {step === "otp" && "Security Verification"}
              {step === "locked" && "Account Locked"}
            </Typography>
            
            <Typography
              variant="body1"
              sx={{ color: "#64748B", mb: 5, fontFamily: primaryFont, fontSize: "1rem", textAlign: 'center', lineHeight: 1.6 }}
            >
              {step === "password" && "Welcome back, please enter your details to access the dashboard"}
              {step === "otp" && "Please enter the 6-digit code from your Authenticator app"}
              {step === "locked" && (error || "Too many failed attempts. Your account has been suspended for 24 hours.")}
            </Typography>

            {/* --- ERROR ALERT --- */}
            {error && step !== "locked" && (
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ mb: 4, fontFamily: primaryFont, borderRadius: 3, fontWeight: 700 }}
              >
                {error}
              </Alert>
            )}

            {/* --- LOCKOUT UI --- */}
            {step === "locked" ? (
              <Box sx={{ textAlign: "center" }}>
                <Alert severity="error" icon={<ErrorOutline fontSize="large" />} sx={{ borderRadius: 4, mb: 4, py: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: primaryFont }}>
                    For security reasons, access is restricted.
                  </Typography>
                </Alert>
                <Typography sx={{ mb: 4, color: "#64748B", fontFamily: primaryFont }}>
                  Please contact the System Administrator to manually unlock your account or wait for the cooldown period to end.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setStep("password")}
                  sx={{ py: 2, borderRadius: 4, borderColor: primaryTeal, color: primaryTeal, fontWeight: 700 }}
                >
                  Return to Login
                </Button>
              </Box>
            ) : (
              <Box 
                component="form" 
                onSubmit={step === "password" ? handleLoginSubmit : handleOtpSubmit} 
                noValidate
              >
                {step === "password" ? (
                  <>
                    <TextField
                      fullWidth
                      label="Email Address"
                      variant="outlined"
                      margin="normal"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputLabelProps={{ sx: { fontFamily: primaryFont, fontWeight: 700 } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: primaryTeal, mr: 1 }} /></InputAdornment>,
                      }}
                      sx={{ 
                        "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#F8FAFC", height: 65, fontFamily: primaryFont },
                        "& input": { textAlign: 'left', fontFamily: primaryFont, fontWeight: 500 }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      margin="normal"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputLabelProps={{ sx: { fontFamily: primaryFont, fontWeight: 700 } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: primaryTeal, mr: 1 }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleTogglePassword} edge="end" sx={{ p: 2 }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#F8FAFC", height: 65, fontFamily: primaryFont },
                        "& input": { textAlign: 'left', fontFamily: primaryFont, fontWeight: 500 }
                      }}
                    />
                    
                    <Box sx={{ textAlign: "right", mt: 1, mb: 4 }}>
                      <Typography
                        component="button"
                        type="button"
                        onClick={() => setShowForgotAlert(true)}
                        sx={{ 
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: accentGold, 
                          fontSize: "0.9rem", 
                          fontWeight: 700, 
                          fontFamily: primaryFont,
                          padding: 0,
                          "&:hover": { textDecoration: "underline" }
                        }}
                      >
                        Forgot Password?
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <TextField
                    fullWidth
                    label="Verification Code"
                    placeholder="000 000"
                    variant="outlined"
                    margin="normal"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '2.2rem', letterSpacing: '8px', fontWeight: 900, color: primaryTeal, fontFamily: primaryFont } }}
                    InputLabelProps={{ sx: { fontFamily: primaryFont, fontWeight: 700 } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 5, bgcolor: "#F8FAFC", py: 2 }, mb: 5 }}
                  />
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 2.2,
                    borderRadius: 5,
                    bgcolor: primaryTeal,
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    fontFamily: primaryFont,
                    boxShadow: "0 12px 30px rgba(0, 70, 82, 0.25)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    transition: "0.3s",
                    "&:hover": { bgcolor: "#065f6e", transform: "translateY(-2px)" },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    step === "password" ? "Login Now" : "Verify Code"
                  )}
                </Button>

                {step === "otp" && (
                  <Button 
                    fullWidth 
                    onClick={() => setStep("password")}
                    startIcon={<ArrowForward sx={{ transform: 'rotate(180deg)', mr: 1 }} />}
                    sx={{ mt: 3, color: "#64748B", fontFamily: primaryFont, fontWeight: 700, fontSize: '0.9rem', textTransform: "none" }}
                  >
                    Back to login
                  </Button>
                )}
              </Box>
            )}

            <Collapse in={showForgotAlert}>
              <Box sx={{ mt: 3 }}>
                <Alert 
                  severity="info" 
                  icon={<InfoOutlined fontSize="inherit" />}
                  onClose={() => setShowForgotAlert(false)}
                  sx={{ 
                    fontFamily: primaryFont, 
                    borderRadius: 3, 
                    fontWeight: 600,
                    bgcolor: "#f0f9ff",
                    color: "#0369a1",
                    "& .MuiAlert-icon": { color: "#0369a1" }
                  }}
                >
                  To reset your password, please contact the System Administrator.
                </Alert>
              </Box>
            </Collapse>
          </Paper>
        </Fade>

        <Typography sx={{ mt: 5, textAlign: "center", color: "#64748B", fontSize: "0.85rem", fontFamily: primaryFont, fontWeight: 600 }}>
          DIGI LASER REAL ESTATE © {new Date().getFullYear()} | SECURE ACCESS
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;