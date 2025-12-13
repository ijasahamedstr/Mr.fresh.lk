import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Link,
  Button,
  Modal,
  TextField,
  MenuItem,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress,
  Drawer,
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

const Topbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [open, setOpen] = useState(false);
  const [socialDrawerOpen, setSocialDrawerOpen] = useState(false);
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
    const onOpenInquiry = () => {
      handleOpen();
    };
    window.addEventListener("openInquiry", onOpenInquiry);
    return () => {
      window.removeEventListener("openInquiry", onOpenInquiry);
    };
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

*Description:* 
${formData.description || "N/A"}

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
      // clear shared cart used by Couresview / PremiumaccountView
      localStorage.removeItem(CART_KEY);
      // clear any old OTT-specific cart if still used
      localStorage.removeItem(OTT_CART_KEY);

      try {
        window.dispatchEvent(new Event("cartCleared"));
      } catch {
        // ignore
      }
    } catch {
      // ignore storage errors
    }
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

  // Shared props to ensure font family everywhere in TextField
  const textFieldCommon = {
    InputLabelProps: { sx: { fontFamily: Montserrat } },
    InputProps: { sx: { fontFamily: Montserrat } },
    sx: { mb: 2 },
  } as const;

  return (
    <>
      {/* TOP BAR */}
      <Box
        sx={{
          width: "100%",
          height: { xs: "50px", sm: "55px", md: "60px" },
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1200,
          bgcolor: "#222",
          display: "flex",
        }}
      >
        {/* LEFT COLUMN */}
        <Box
          sx={{
            width: isMobile ? "55%" : "75%",
            display: "flex",
            alignItems: "center",
            px: { xs: 1, sm: 2, md: 4 },
            color: "#fff",
            gap: { xs: 0.5, sm: 1.5, md: 3 },
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
                }}
              >
                <Phone sx={{ mr: 0.5, fontSize: "1rem" }} />
                <Link
                  href="tel:+94767080553"
                  underline="none"
                  color="inherit"
                  sx={{ fontFamily: Montserrat }}
                >
                  (+94) 76 708 0553
                </Link>
              </Typography>

              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: Montserrat,
                  fontSize: "0.8rem",
                }}
              >
                <Email sx={{ mr: 0.5, fontSize: "1rem" }} />
                <Link
                  href="mailto:info@mrfresh.lk"
                  underline="none"
                  color="inherit"
                  sx={{ fontFamily: Montserrat }}
                >
                  info@mrfresh.lk
                </Link>
              </Typography>
            </>
          )}
        </Box>

        {/* RIGHT COLUMN (SOCIAL + BUTTON) */}
        <Box
          sx={{
            width: isMobile ? "45%" : "25%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: { xs: 1, sm: 2, md: 4 },
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {/* Social Icons - DESKTOP ONLY */}
          {!isMobile && !isTablet && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.7, sm: 1.2 },
                mr: { xs: 0.5, sm: 1.5 },
              }}
            >
              {/* WhatsApp */}
              <Link
                href="https://wa.me/94767080553"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: { xs: 26, sm: 30 },
                  height: { xs: 26, sm: 30 },
                  borderRadius: "50%",
                  backgroundColor: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                <WhatsApp sx={{ fontSize: { xs: 17, sm: 19 } }} />
              </Link>

              {/* Facebook */}
              <Link
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: { xs: 26, sm: 30 },
                  height: { xs: 26, sm: 30 },
                  borderRadius: "50%",
                  backgroundColor: "#1877F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                <Facebook sx={{ fontSize: { xs: 17, sm: 19 } }} />
              </Link>

              {/* Instagram */}
              <Link
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: { xs: 26, sm: 30 },
                  height: { xs: 26, sm: 30 },
                  borderRadius: "50%",
                  background:
                    "linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                <Instagram sx={{ fontSize: { xs: 17, sm: 19 } }} />
              </Link>

              {/* YouTube */}
              <Link
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: { xs: 26, sm: 30 },
                  height: { xs: 26, sm: 30 },
                  borderRadius: "50%",
                  backgroundColor: "#FF0000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                <YouTube sx={{ fontSize: { xs: 17, sm: 19 } }} />
              </Link>
            </Box>
          )}

          {/* Mobile / Tablet: button to open SOCIAL DRAWER */}
          {(isMobile || isTablet) && (
            <IconButton
              onClick={() => setSocialDrawerOpen(true)}
              sx={{
                mr: { xs: 0.5, sm: 1 },
                color: "#fff",
              }}
              aria-label="open social links"
            >
              <WhatsApp sx={{ fontSize: { xs: 20, sm: 22 } }} />
            </IconButton>
          )}

          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{
              textTransform: "none",
              background:
                "linear-gradient(135deg, #c2d142 0%, #a8bb2f 100%)",
              color: "#1f2937",
              fontWeight: 600,
              borderRadius: "50px",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              fontFamily: Montserrat,
              px: { xs: 1.5, sm: 2.5 },
              minWidth: "auto",
              whiteSpace: "nowrap",
            }}
          >
            Inquire Here
          </Button>
        </Box>
      </Box>

      {/* SOCIAL MEDIA DRAWER (Mobile / Tablet) */}
      <Drawer
        anchor="right"
        open={socialDrawerOpen}
        onClose={() => setSocialDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            p: 2,
            bgcolor: "#111827",
            color: "#fff",
            fontFamily: Montserrat,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontFamily: Montserrat, fontWeight: 600 }}
          >
            Follow us
          </Typography>
          <IconButton
            onClick={() => setSocialDrawerOpen(false)}
            sx={{ color: "#fff" }}
            aria-label="close social drawer"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* WhatsApp */}
          <Button
            component={Link}
            href="https://wa.me/94767080553"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <WhatsApp sx={{ fontSize: 18 }} />
              </Box>
            }
            sx={{
              justifyContent: "flex-start",
              color: "#e5e7eb",
              textTransform: "none",
              fontFamily: Montserrat,
            }}
          >
            WhatsApp
          </Button>

          {/* Facebook */}
          <Button
            component={Link}
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: "#1877F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Facebook sx={{ fontSize: 18 }} />
              </Box>
            }
            sx={{
              justifyContent: "flex-start",
              color: "#e5e7eb",
              textTransform: "none",
              fontFamily: Montserrat,
            }}
          >
            Facebook
          </Button>

          {/* Instagram */}
          <Button
            component={Link}
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Instagram sx={{ fontSize: 18 }} />
              </Box>
            }
            sx={{
              justifyContent: "flex-start",
              color: "#e5e7eb",
              textTransform: "none",
              fontFamily: Montserrat,
            }}
          >
            Instagram
          </Button>

          {/* YouTube */}
          <Button
            component={Link}
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: "#FF0000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <YouTube sx={{ fontSize: 18 }} />
              </Box>
            }
            sx={{
              justifyContent: "flex-start",
              color: "#e5e7eb",
              textTransform: "none",
              fontFamily: Montserrat,
            }}
          >
            YouTube
          </Button>
        </Box>
      </Drawer>

      {/* FORM MODAL */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 450 },
            bgcolor: "#fff",
            borderRadius: 2,
            p: 1,
            boxShadow: 24,
            fontFamily: Montserrat,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            mb={2}
            sx={{ fontFamily: Montserrat }}
          >
            Inquiry Form
          </Typography>

          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            {...textFieldCommon}
          />

          <TextField
            fullWidth
            label="Mobile Number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            {...textFieldCommon}
          />

          <TextField
            fullWidth
            select
            label="Inquiry Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            {...textFieldCommon}
            SelectProps={{
              MenuProps: { PaperProps: { sx: { fontFamily: Montserrat } } },
            }}
          >
            {inquiryTypes.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ fontFamily: Montserrat }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Order Number"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
            {...textFieldCommon}
          />

          <TextField
            fullWidth
            label="Order Date"
            name="orderDate"
            type="date"
            value={formData.orderDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true, sx: { fontFamily: Montserrat } }}
            InputProps={{ sx: { fontFamily: Montserrat } }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            InputLabelProps={{ sx: { fontFamily: Montserrat } }}
            InputProps={{ sx: { fontFamily: Montserrat } }}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleSaveAndShare}
            disabled={loading}
            sx={{
              background:
                "linear-gradient(135deg, #c2d142 0%, #a8bb2f 100%)",
              color: "#000",
              textTransform: "none",
              fontFamily: Montserrat,
            }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              "Save & Send to WhatsApp"
            )}
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%", fontFamily: Montserrat }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Topbar;
