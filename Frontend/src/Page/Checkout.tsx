import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Divider,
  Button,
  IconButton,
  MenuItem,
  Dialog,
  DialogContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();

  /* ---------------- CART ---------------- */
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

  const itemsTotal = cartItems.reduce(
    (sum: number, item: any) => sum + item.price * item.qty,
    0
  );

  /* ---------------- CUSTOMER ---------------- */
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  /* ---------------- SYSTEM TIME CHECK ---------------- */
  const hour = new Date().getHours();
  const isFreeTime = hour >= 21 || hour < 9;

  /* ---------------- DELIVERY ---------------- */
  const [location, setLocation] = useState("");

  const deliveryCharge = useMemo(() => {
    if (isFreeTime) return 0;
    if (location === "Kalmunai") return 50;
    if (location === "Sainthamaruthu") return 70;
    if (location === "Maruthamunai") return 100;
    return 0;
  }, [location, isFreeTime]);

  /* ---------------- ADDRESS ---------------- */
  const [openAddress, setOpenAddress] = useState(false);
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");

  const addressCompleted = street && city && postal;
  const grandTotal = itemsTotal + deliveryCharge;

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: "auto",
        bgcolor: "#F8FAFC",
        pt: 2,
        pb: 6,

        /* 🔥 GLOBAL FONT – MAIN PAGE */
        "& *": {
          fontFamily: '"Montserrat", sans-serif',
        },
        "& .MuiInputBase-input": {
          fontFamily: '"Montserrat", sans-serif',
        },
        "& .MuiFormLabel-root": {
          fontFamily: '"Montserrat", sans-serif',
        },
        "& .MuiMenuItem-root": {
          fontFamily: '"Montserrat", sans-serif',
        },
        "& .MuiButton-root": {
          fontFamily: '"Montserrat", sans-serif',
        },
        "& .MuiTypography-root": {
          fontFamily: '"Montserrat", sans-serif',
        },
      }}
    >
      {/* ================= HEADER ================= */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography fontWeight={700}>Checkout</Typography>
          <Typography fontSize={13} color="#555">
            Mr.Fresh.lk
          </Typography>
        </Box>
      </Box>

      {/* ================= CUSTOMER ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, mb: 2 }}>
        <Typography fontWeight={600} mb={1}>
          Customer
        </Typography>

        <TextField
          fullWidth
          label="Name"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 1.5 }}
        />

        <Box display="flex" gap={1}>
          <TextField value="+94" size="small" disabled sx={{ width: 80 }} />
          <TextField
            fullWidth
            size="small"
            label="WhatsApp number"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </Box>
      </Box>

      {/* ================= ITEMS (NOT REMOVED) ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, mb: 2 }}>
        <Typography fontWeight={600} mb={1}>
          Items
        </Typography>

        {cartItems.map((item: any, i: number) => (
          <Box key={i} display="flex" gap={1.5} mb={2} alignItems="center">
            <Box
              component="img"
              src={item.image}
              sx={{
                width: 52,
                height: 52,
                borderRadius: 1,
                objectFit: "cover",
                border: "1px solid #eee",
              }}
            />

            <Box flex={1}>
              <Typography fontSize={13} fontWeight={600}>
                {item.name}
              </Typography>
              <Typography fontSize={12} color="#666">
                Qty {item.qty}
              </Typography>
            </Box>

            <Typography fontSize={12} fontWeight={600}>
              LKR {(item.price * item.qty).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ================= DELIVERY ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, mb: 2 }}>
        <Typography fontWeight={600} mb={1}>
          Delivery
        </Typography>

        {isFreeTime ? (
          <>
            <Typography fontSize={13} color="green">
              Free Delivery (09:00 PM – 09:00 AM)
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => setOpenAddress(true)}
            >
              Enter Address
            </Button>
          </>
        ) : (
          <>
            <Typography fontSize={13} mb={1}>
              Select Location
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setOpenAddress(true);
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        fontFamily: '"Montserrat", sans-serif',
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="Kalmunai">Kalmunai – LKR 50</MenuItem>
              <MenuItem value="Sainthamaruthu">
                Sainthamaruthu – LKR 70
              </MenuItem>
              <MenuItem value="Maruthamunai">
                Maruthamunai – LKR 100
              </MenuItem>
            </TextField>
          </>
        )}
      </Box>

      {/* ================= ORDER SUMMARY ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2 }}>
        <Typography fontWeight={600} mb={1}>
          Order Summary
        </Typography>

        <Box display="flex" justifyContent="space-between">
          <Typography fontSize={13}>Items</Typography>
          <Typography fontSize={13}>
            LKR {itemsTotal.toLocaleString()}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography fontSize={13}>Delivery</Typography>
          <Typography fontSize={13}>
            LKR {deliveryCharge.toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontWeight={700}>Total</Typography>
          <Typography fontWeight={700}>
            LKR {grandTotal.toLocaleString()}
          </Typography>
        </Box>

       <Button
        fullWidth
        disabled={!addressCompleted}
        sx={{
            bgcolor: "#1f2937",
            color: "#fff",
            py: 1.4,
            borderRadius: 2,
            fontFamily: '"Montserrat", sans-serif',

            "&:hover": {
            bgcolor: "#000",
            },

            /* 🔥 FIX DISABLED TEXT COLOR */
            "&.Mui-disabled": {
            bgcolor: "#1f2937",
            color: "#fff",
            opacity: 0.6, // optional (keeps disabled look)
            },
        }}
        >
        Place order
        </Button>

      </Box>

      {/* ================= ADDRESS MODAL (FONT FIXED) ================= */}
      <Dialog open={openAddress} onClose={() => setOpenAddress(false)} fullWidth>
        <DialogContent
          sx={{
            "& *": {
              fontFamily: '"Montserrat", sans-serif',
            },
            "& .MuiInputBase-input": {
              fontFamily: '"Montserrat", sans-serif',
            },
            "& .MuiFormLabel-root": {
              fontFamily: '"Montserrat", sans-serif',
            },
            "& .MuiButton-root": {
              fontFamily: '"Montserrat", sans-serif',
            },
          }}
        >
          <Typography fontWeight={600} mb={1}>
            Enter address
          </Typography>

          <TextField
            fullWidth
            label="Street address"
            size="small"
            sx={{ mb: 1 }}
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />

          <TextField
            fullWidth
            label="Apartment, unit, suite (optional)"
            size="small"
            sx={{ mb: 1 }}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />

          <TextField
            fullWidth
            label="City"
            size="small"
            sx={{ mb: 1 }}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <Box display="flex" gap={1}>
            <TextField
              label="Postal code"
              size="small"
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
            />
            <TextField value="Sri Lanka" size="small" disabled fullWidth />
          </Box>

          <Button
            fullWidth
            sx={{
              mt: 2,
              bgcolor: "#1f2937",
              color: "#fff",
            }}
            disabled={!addressCompleted}
            onClick={() => setOpenAddress(false)}
          >
            Next
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
