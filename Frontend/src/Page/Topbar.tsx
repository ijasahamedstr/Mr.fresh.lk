import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Link,
  Button,
  TextField,
  MenuItem,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress,
  Slide,
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import {
  Phone,
  Email,
  WhatsApp,
  Facebook,
  Instagram,
  YouTube,
  Close as CloseIcon,
} from "@mui/icons-material";

const inquiryTypes = [
  { value: "Payment Issue", label: "Payment Issue" },
  { value: "Product Issue", label: "Product Issue" },
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Request Service", label: "Request Service" },
];

const Montserrat = '"Montserrat", sans-serif';

// cart keys used across the app
const CART_KEY = "cartCourses";
const OTT_CART_KEY = "ottCart";

// Transition for the Dialog to slide up like a native mobile app
const Transition = React.forwardRef(function Transition(props: any, ref: any) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Topbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    type: "",
    description: "",
    orderNumber: "",
    orderDate: "",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // allow other components to open this modal via a custom window event
  useEffect(() => {
    const onOpenInquiry = () => handleOpen();
    window.addEventListener("openInquiry", onOpenInquiry);
    return () => window.removeEventListener("openInquiry", onOpenInquiry);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      type: "",
      description: "",
      orderNumber: "",
      orderDate: "",
    });
  };

  const openWhatsApp = () => {
    const message = `
*New Inquiry Received*

*Name:* ${formData.name || "N/A"}
*Mobile:* ${formData.mobile || "N/A"}
*Inquiry Type:* ${formData.type || "N/A"}
*Order Number:* ${formData.orderNumber || "N/A"}
*Order Date:* ${formData.orderDate || "N/A"}

*Description:* ${formData.description || "N/A"}

_Sent via mrfresh.lk Inquiry Form_
    `;
    const phoneNumber = "94767080553";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  const clearAllOrderLocalStorage = () => {
    try {
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(OTT_CART_KEY);
      try {
        window.dispatchEvent(new Event("cartCleared"));
      } catch {}
    } catch {}
  };

  const handleSaveAndShare = async () => {
    if (!formData.name || !formData.mobile || !formData.type) {
      setSnackbar({
        open: true,
        message: "Please fill Name, Mobile and Inquiry Type.",
        severity: "error",
      });
      return;
    }

    const API_HOST = import.meta.env.VITE_API_HOST as string | undefined;
    if (!API_HOST) {
      setSnackbar({
        open: true,
        message: "API host not configured (VITE_API_HOST).",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.name,
      mobile: formData.mobile,
      inquirytype: formData.type,
      ordernumber: formData.orderNumber,
      orderdate: formData.orderDate,
      description: formData.description,
    };

    try {
      const resp = await fetch(`${API_HOST}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        throw new Error(err?.message || `Server responded with ${resp.status}`);
      }

      await resp.json();

      setSnackbar({
        open: true,
        message: "Inquiry saved successfully. Opening WhatsApp...",
        severity: "success",
      });

      setTimeout(() => {
        openWhatsApp();
        clearAllOrderLocalStorage();
        resetForm();
        handleClose();
      }, 300);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || "Failed to save inquiry.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () =>
    setSnackbar((s) => ({ ...s, open: false }));

  const textFieldCommon = {
    InputLabelProps: { sx: { fontFamily: Montserrat, fontSize: "0.9rem" } },
    InputProps: { sx: { fontFamily: Montserrat, borderRadius: 2 } },
    sx: { mb: { xs: 2.5, sm: 2.5 } },
  } as const;

  return (
    <>
      {/* ===================== TOP BAR ===================== */}
      <Box
        sx={{
          width: "100%",
          height: { xs: "56px", sm: "60px", md: "64px" },
          position: "relative",
          bgcolor: "#1a1a1a",
          display: "flex",
          boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        {/* LEFT COLUMN */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            px: { xs: 1.5, sm: 2, md: 4 },
            color: "#fff",
            gap: { xs: 1, sm: 1.5, md: 3 },
            overflow: "hidden",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "#FFFFFF",
              fontFamily: Montserrat,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.9rem" },
            }}
          >
            Need Assistance? Contact Us:
          </Typography>

          {!isMobile && (
            <>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: Montserrat,
                  fontSize: "0.8rem",
                  whiteSpace: "nowrap",
                }}
              >
                <Phone sx={{ mr: 0.5, fontSize: "1rem" }} />
                <Link href="tel:+94767080553" underline="none" color="inherit">
                  (+94) 76 708 0553
                </Link>
              </Typography>

              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: Montserrat,
                  fontSize: "0.8rem",
                  whiteSpace: "nowrap",
                }}
              >
                <Email sx={{ mr: 0.5, fontSize: "1rem" }} />
                <Link href="mailto:info@mrfresh.lk" underline="none" color="inherit">
                  info@mrfresh.lk
                </Link>
              </Typography>
            </>
          )}
        </Box>

        {/* RIGHT COLUMN (SOCIAL + BUTTON) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: { xs: 1.5, sm: 2, md: 4 },
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {/* Social Icons - DESKTOP ONLY */}
          {!isMobile && !isTablet && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mr: 1.5 }}>
              {[
                { icon: <WhatsApp sx={{ fontSize: 19 }} />, color: "#25D366", link: "https://wa.me/94767080553" },
                { icon: <Facebook sx={{ fontSize: 19 }} />, color: "#1877F2", link: "https://www.facebook.com" },
                { icon: <Instagram sx={{ fontSize: 19 }} />, color: "linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)", link: "https://www.instagram.com" },
                { icon: <YouTube sx={{ fontSize: 19 }} />, color: "#FF0000", link: "https://www.youtube.com" },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    transition: "transform 0.2s",
                    "&:hover": { opacity: 0.85, transform: "scale(1.1)" },
                  }}
                >
                  {item.icon}
                </Link>
              ))}
            </Box>
          )}

          {/* Inquire Here Button (Always Visible) */}
          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{
              textTransform: "none",
              background: "linear-gradient(135deg, #c2d142 0%, #a8bb2f 100%)",
              color: "#1f2937",
              fontWeight: 700,
              borderRadius: "50px",
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              fontFamily: Montserrat,
              px: { xs: 1.5, sm: 3 },
              py: { xs: 0.7, sm: 0.8 },
              minWidth: "auto",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 10px rgba(168, 187, 47, 0.3)",
              transition: "all 0.2s",
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            Inquire Here
          </Button>
        </Box>
      </Box>

      {/* ===================== FORM DIALOG (Spans full screen on mobile) ===================== */}
      <Dialog
        fullScreen={isMobile}
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        disableScrollLock={true} /* Prevents layout shift/overflow bug */
        PaperProps={{
          sx: {
            fontFamily: Montserrat,
            width: isMobile ? "100%" : 500,
            maxWidth: "100%",
            borderRadius: isMobile ? 0 : 4,
            boxShadow: isMobile ? "none" : 24,
          },
        }}
      >
        {/* Mobile Header (App Bar style) */}
        {isMobile ? (
          <AppBar sx={{ position: "relative", bgcolor: "#111827", boxShadow: "none" }}>
            <Toolbar sx={{ minHeight: "56px !important", px: 2 }}>
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 1.5, flex: 1, fontFamily: Montserrat, fontWeight: 700, fontSize: "1.1rem" }} variant="h6" component="div">
                Inquiry Form
              </Typography>
            </Toolbar>
          </AppBar>
        ) : (
          /* Desktop Header */
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3, pb: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: Montserrat, color: "#111827" }}>
              Inquiry Form
            </Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: "#6b7280", bgcolor: "#f3f4f6" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Form Body Content */}
        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} {...textFieldCommon} />
          <TextField fullWidth label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} {...textFieldCommon} />

          <TextField
            fullWidth
            select
            label="Inquiry Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            {...textFieldCommon}
            SelectProps={{ MenuProps: { PaperProps: { sx: { fontFamily: Montserrat, borderRadius: 2 } } } }}
          >
            {inquiryTypes.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontFamily: Montserrat }}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField fullWidth label="Order Number" name="orderNumber" value={formData.orderNumber} onChange={handleChange} {...textFieldCommon} />

          <TextField
            fullWidth
            label="Order Date"
            name="orderDate"
            type="date"
            value={formData.orderDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true, sx: { fontFamily: Montserrat, fontSize: "0.9rem" } }}
            InputProps={{ sx: { fontFamily: Montserrat, borderRadius: 2 } }}
            sx={{ mb: { xs: 2.5, sm: 2.5 } }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            InputLabelProps={{ sx: { fontFamily: Montserrat, fontSize: "0.9rem" } }}
            InputProps={{ sx: { fontFamily: Montserrat, borderRadius: 2 } }}
            sx={{ mb: { xs: 4, sm: 3 } }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleSaveAndShare}
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #c2d142 0%, #a8bb2f 100%)",
              color: "#111827",
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "none",
              fontFamily: Montserrat,
              borderRadius: "50px",
              py: 1.8,
              boxShadow: "0 4px 14px rgba(168, 187, 47, 0.4)",
              transition: "all 0.2s",
              "&:active": { transform: "scale(0.98)" },
              "&:disabled": { background: "#e0e0e0" }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#111827" }} /> : "Save & Send to WhatsApp"}
          </Button>

          {/* Padding bottom so it doesn't get clipped by mobile home indicators */}
          {isMobile && <Box sx={{ height: 24 }} />}
        </DialogContent>
      </Dialog>

      {/* ===================== SNACKBAR ===================== */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%", fontFamily: Montserrat, borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Topbar;