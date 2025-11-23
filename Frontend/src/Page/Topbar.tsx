import React, { useState } from "react";
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
} from "@mui/material";
import { Phone, Email } from "@mui/icons-material";

const inquiryTypes = [
  { value: "Payment Issue", label: "Payment Issue" },
  { value: "Delivery Issue", label: "Delivery Issue" },
  { value: "Product Issue", label: "Product Issue" },
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Request Product", label: "Request Product" },
];

const Topbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const sendWhatsApp = () => {
    const message = `
*New Inquiry Received*

*Name:* ${formData.name || "N/A"}
*Mobile:* ${formData.mobile || "N/A"}
*Inquiry Type:* ${formData.type || "N/A"}
*Order Number:* ${formData.orderNumber || "N/A"}
*Order Date:* ${formData.orderDate || "N/A"}

*Description:* 
${formData.description || "N/A"}

* Fill out the form and click "Send to WhatsApp". To include images, attach them manually in WhatsApp after the message opens.*

_Sent via MrFresh.lk Inquiry Form_
    `;
    const phoneNumber = "94767080553";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    setFormData({
      name: "",
      mobile: "",
      type: "",
      description: "",
      orderNumber: "",
      orderDate: "",
    });
    handleClose();
  };

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
          boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
          display: "flex",
          fontFamily: '"Montserrat", sans-serif',
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
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: '"Montserrat", sans-serif',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "#c2d142",
              fontSize: { xs: "0.60rem", sm: "0.75rem", md: "0.9rem" },
              fontFamily: '"Montserrat", sans-serif',
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
                  fontSize: "0.8rem",
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                <Phone sx={{ mr: 1 }} />
                <Link
                  href="tel:+94767080553"
                  underline="none"
                  color="inherit"
                  sx={{ fontFamily: '"Montserrat", sans-serif' }}
                >
                  (+94) 76 708 0553
                </Link>
              </Typography>

              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.8rem",
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                <Email sx={{ mr: 1 }} />
                <Link
                  href="mailto:info@fresh.lk"
                  underline="none"
                  color="inherit"
                  sx={{ fontFamily: '"Montserrat", sans-serif' }}
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
            fontFamily: '"Montserrat", sans-serif',
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
              whiteSpace: "nowrap",
              fontFamily: '"Montserrat", sans-serif',
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
            width: { xs: "80%", sm: 450 },
            bgcolor: "#fff",
            borderRadius: 2,
            p: 3,
            boxShadow: 24,
            fontFamily: '"Montserrat", sans-serif',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            mb={2}
            sx={{ fontFamily: '"Montserrat", sans-serif' }}
          >
            Inquiry Form
          </Typography>

          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
            InputProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
          />

          <TextField
            fullWidth
            label="Mobile Number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
            InputProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
          />

          <TextField
            fullWidth
            select
            label="Inquiry Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
            InputProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
          >
            {inquiryTypes.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ fontFamily: '"Montserrat", sans-serif' }}
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
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
            InputProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
          />

          <TextField
            fullWidth
            label="Order Date"
            name="orderDate"
            type="date"
            value={formData.orderDate}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true, sx: { fontFamily: '"Montserrat", sans-serif' } }}
            InputProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
            InputProps={{ sx: { fontFamily: '"Montserrat", sans-serif' } }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={sendWhatsApp}
            sx={{
              bgcolor: "#c2d142",
              color: "#000",
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            Send to WhatsApp
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default Topbar;
