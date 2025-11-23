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
} from "@mui/material";
import { Phone, Email } from "@mui/icons-material";

const inquiryTypes = [
  { value: "Payment Issue", label: "Payment Issue" },
  { value: "Delivery Issue", label: "Delivery Issue" },
  { value: "Product Issue", label: "Product Issue" },
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Request Product", label: "Request Product" },
];

const Montserrat = '"Montserrat", sans-serif';

const Topbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    const onOpenInquiry = () => {
      handleOpen();
    };
    window.addEventListener("openInquiry", onOpenInquiry);
    return () => {
      window.removeEventListener("openInquiry", onOpenInquiry);
    };
    // intentionally no dependencies so it registers once
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

_Sent via MrFresh.lk Inquiry Form_
    `;
    const phoneNumber = "94767080553";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
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
            width: isMobile ? "50%" : "80%",
            display: "flex",
            alignItems: "center",
            px: { xs: 1, sm: 2, md: 4 },
            color: "#fff",
            gap: { xs: 0.5, sm: 1.5, md: 3 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "#c2d142",
              fontFamily: Montserrat,
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
                }}
              >
                <Phone sx={{ mr: 1 }} />
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
                }}
              >
                <Email sx={{ mr: 1 }} />
                <Link
                  href="mailto:info@fresh.lk"
                  underline="none"
                  color="inherit"
                  sx={{ fontFamily: Montserrat }}
                >
                  info@fresh.lk
                </Link>
              </Typography>
            </>
          )}
        </Box>

        {/* RIGHT COLUMN */}
        <Box
          sx={{
            width: isMobile ? "50%" : "20%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: { xs: 1, sm: 2, md: 4 },
          }}
        >
          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{
              textTransform: "none",
              backgroundColor: "#c2d142",
              color: "#000",
              fontWeight: 600,
              borderRadius: "50px",
              fontSize: "0.75rem",
              fontFamily: Montserrat,
            }}
          >
            Inquire Here
          </Button>
        </Box>
      </Box>

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
            // ensure modal content uses Montserrat
            fontFamily: Montserrat,
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ fontFamily: Montserrat }}>
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
            SelectProps={{ MenuProps: { PaperProps: { sx: { fontFamily: Montserrat } } } }}
          >
            {inquiryTypes.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontFamily: Montserrat }}>
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
              bgcolor: "#c2d142",
              color: "#000",
              textTransform: "none",
              fontFamily: Montserrat,
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Save & Send to WhatsApp"}
          </Button>
        </Box>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleSnackbarClose}>
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
