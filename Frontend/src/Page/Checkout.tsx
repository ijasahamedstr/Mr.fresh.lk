import { useState, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Divider,
  Button,
  IconButton,
  MenuItem,
  Dialog,
  Snackbar,
  DialogContent,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";


/* ================= API ================= */
const API_HOST = import.meta.env.VITE_API_HOST;

/* ================= FONT ================= */
const font = '"Montserrat", sans-serif';

/* ================= MAP STYLE ================= */
const GOOGLE_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f2efe9" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f2efe9" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e0e0e0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d6d6d6" }] },
];

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 7.4167, lng: 81.8167 };

export default function Checkout() {
  const navigate = useNavigate();

  /* -------- MAP LOADER -------- */
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  /* ---------------- CART ---------------- */
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

  const itemsTotal = cartItems.reduce(
    (sum: number, item: any) => sum + item.price * item.qty,
    0
  );

  /* ---------------- CUSTOMER ---------------- */
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  /* ---------------- DELIVERY ---------------- */
  const [location, setLocation] = useState("");

  const deliveryCharge = useMemo(() => {
    if (location === "Kalmunai") return 50;
    if (location === "Sainthamaruthu") return 70;
    if (location === "Maruthamunai") return 100;
    return 0;
  }, [location]);

  /* ---------------- ADDRESS ---------------- */
  const [openAddress, setOpenAddress] = useState(false);
  const [openMap, setOpenMap] = useState(false);

  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");

  /* ---------------- MAP ---------------- */
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [coords, setCoords] = useState<typeof DEFAULT_CENTER | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const addressCompleted =
    street && city && postal && coords && locationConfirmed;

  const grandTotal = itemsTotal + deliveryCharge;

    /* ---------------- MATERIAL ALERT ---------------- */
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });


/* ---------------- GPS ---------------- */
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setSnack({
        open: true,
        message: "GPS not supported",
        severity: "error",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter({ lat, lng });
        setCoords({ lat, lng });
      },
      () =>
        setSnack({
          open: true,
          message: "Please enable location permission",
          severity: "error",
        })
    );
  };

  /* ---------------- WHATSAPP ---------------- */
    const openWhatsApp = (orderId: string) => {
    const mapUrl =
      coords && coords.lat && coords.lng
        ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
        : "Location not available";

    const orderNames = cartItems
      .map(
        (item: any) =>
          `• ${item.name}${item.variant ? ` (${item.variant})` : ""} x ${item.qty}`
      )
      .join("\n");

    const message = `
  *🛒 New Order Received*

  *Name:* ${name || "N/A"}
  *Mobile:* +94${whatsapp || "N/A"}
  *Delivery Area:* ${location || "N/A"}

  *Address:*
  ${street}, ${unit ? unit + "," : ""} ${city}
  ${postal}

  *Order ID:* ${orderId}

  *Order Items:*
  ${orderNames}

  *Items Total:* LKR ${itemsTotal.toLocaleString()}
  *Delivery:* LKR ${deliveryCharge.toLocaleString()}
  *Grand Total:* LKR ${grandTotal.toLocaleString()}

  📍 Map:
  ${mapUrl}

  _Sent via MrFresh.lk Checkout_
    `;

    const phoneNumber = "94767080553";
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  /* ---------------- PLACE ORDER ---------------- */
  const placeOrder = async () => {
    try {
      const payload = {
        customer: {
          name,
          whatsapp: `+94${whatsapp}`,
        },
        items: cartItems,
        delivery: {
          location,
          charge: deliveryCharge,
        },
        address: {
          street,
          unit,
          city,
          postal,
          country: "Sri Lanka",
        },
        mapLocation: {
          lat: coords?.lat,
          lng: coords?.lng,
        },
        totals: {
          itemsTotal,
          grandTotal,
        },
      };

      const resp = await fetch(`${API_HOST}/Productsoder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error();

      const data = await resp.json();
      const orderId = data?.orderId || "AUTO";

      // ✅ SEND WHATSAPP AFTER SAVE
      openWhatsApp(orderId);

      // ✅ LIVE CLEAR CART (IMMEDIATE)
      localStorage.setItem("cartItems", JSON.stringify([]));

      // ✅ FIRE EVENT (HEADER LISTENS TO THIS)
      window.dispatchEvent(new Event("cartUpdated"));


     setSnack({
        open: true,
        message: "Order placed successfully & sent to WhatsApp",
        severity: "success",
      });

      localStorage.removeItem("cartItems");
      setTimeout(() => navigate("/"), 1500);
    } catch {
      setSnack({
        open: true,
        message: "Failed to place order",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: "auto",
        bgcolor: "#F8FAFC",
        pt: 2,
        pb: 6,
        fontFamily: font,
        color: "#000",              // ✅ FORCE BLACK TEXT
        "& *": {
          fontFamily: font,
          color: "#000",            // ✅ ALL CHILD TEXT BLACK
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
          <Typography fontSize={13} color="#555" sx={{fontFamily:font}}>
            Mr.Fresh.lk
          </Typography>
        </Box>
      </Box>

      {/* ================= CUSTOMER ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, mb: 2 }}>
        <Typography
          fontWeight={600}
          mb={1}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          Customer
        </Typography>

        <TextField
          fullWidth
          label="Name"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{
            mb: 1.5,
            "& .MuiInputLabel-root": {
              fontFamily: '"Montserrat", sans-serif',
            },
            "& .MuiInputBase-input": {
              fontFamily: '"Montserrat", sans-serif',
            },
          }}
        />

        <Box display="flex" gap={1}>
          <TextField
            value="+94"
            size="small"
            disabled
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: '"Montserrat", sans-serif',
              },
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="WhatsApp number"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": {
                fontFamily: '"Montserrat", sans-serif',
              },
              "& .MuiInputBase-input": {
                fontFamily: '"Montserrat", sans-serif',
              },
            }}
          />
        </Box>
      </Box>


        {/* ================= ITEMS ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, mb: 2 }}>
        <Typography
          fontWeight={600}
          mb={1}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
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
              <Typography
                fontSize={13}
                fontWeight={600}
                sx={{ fontFamily: '"Montserrat", sans-serif' }}
              >
                {item.name}
              </Typography>

              <Typography
                fontSize={12}
                color="#666"
                sx={{ fontFamily: '"Montserrat", sans-serif' }}
              >
                Qty {item.qty}
              </Typography>
            </Box>

            <Typography
              fontSize={12}
              fontWeight={600}
              sx={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              LKR {(item.price * item.qty).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>


      {/* ================= DELIVERY ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, mb: 2 }}>
        <Typography
          fontWeight={600}
          mb={1}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          Delivery
        </Typography>

        <TextField
          select
          fullWidth
          size="small"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setLocationConfirmed(false);
            setOpenAddress(true);
          }}
          sx={{
            "& .MuiInputLabel-root": {
              fontFamily: '"Montserrat", sans-serif',
            },
            "& .MuiSelect-select": {
              fontFamily: '"Montserrat", sans-serif',
            },
            "& .MuiInputBase-input": {
              fontFamily: '"Montserrat", sans-serif',
            },
          }}
        >
          <MenuItem sx={{ fontFamily: '"Montserrat", sans-serif' }} value="Kalmunai">
            Kalmunai – LKR 50
          </MenuItem>

          <MenuItem
            sx={{ fontFamily: '"Montserrat", sans-serif' }}
            value="Sainthamaruthu"
          >
            Sainthamaruthu – LKR 70
          </MenuItem>

          <MenuItem
            sx={{ fontFamily: '"Montserrat", sans-serif' }}
            value="Maruthamunai"
          >
            Maruthamunai – LKR 100
          </MenuItem>
        </TextField>
      </Box>


      {/* ================= CONFIRM LOCATION CARD (FIXED) ================= */}
        {locationConfirmed && coords && (
          <Box
            sx={{
              mx: 2,
              mb: 2,
              p: 1.5,
              bgcolor: "#fff",
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            <Box sx={{ height: 120, borderRadius: 1.5, overflow: "hidden", mb: 1 }}>
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={coords}
                  zoom={17}
                  options={{
                    styles: GOOGLE_MAP_STYLE,
                    disableDefaultUI: true,
                    draggable: false,
                  }}
                />
              )}
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography
                  fontSize={13}
                  fontWeight={600}
                  sx={{ fontFamily: '"Montserrat", sans-serif' }}
                >
                  Confirm your location
                </Typography>

                <Typography
                  fontSize={12}
                  color="#6b7280"
                  sx={{ fontFamily: '"Montserrat", sans-serif' }}
                >
                  {street}, {city}
                </Typography>

                <Typography
                  fontSize={12}
                  color="#6b7280"
                  sx={{ fontFamily: '"Montserrat", sans-serif' }}
                >
                  {postal}
                </Typography>
              </Box>

              <Button
                size="small"
                sx={{ fontFamily: '"Montserrat", sans-serif' }}
                onClick={() => {
                  setLocationConfirmed(false);
                  setOpenMap(true);
                }}
              >
                Edit
              </Button>
            </Box>
          </Box>
        )}


      {/* ================= ORDER SUMMARY ================= */}
    <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, fontFamily: '"Montserrat", sans-serif' }}>
      <Typography
        fontWeight={600}
        mb={1}
        sx={{ fontFamily: '"Montserrat", sans-serif' }}
      >
        Order Summary
      </Typography>

      <Box display="flex" justifyContent="space-between">
        <Typography
          fontSize={13}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          Items
        </Typography>
        <Typography
          fontSize={13}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          LKR {itemsTotal.toLocaleString()}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between">
        <Typography
          fontSize={13}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          Delivery
        </Typography>
        <Typography
          fontSize={13}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          LKR {deliveryCharge.toLocaleString()}
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography
          fontWeight={700}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          Total
        </Typography>
        <Typography
          fontWeight={700}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          LKR {grandTotal.toLocaleString()}
        </Typography>
      </Box>

      <Button
        fullWidth
        disabled={!addressCompleted}
        onClick={placeOrder}
        sx={{
          bgcolor: "#1f2937",
          color: "#fff",
          py: 1.4,
          borderRadius: 2,
          fontFamily: '"Montserrat", sans-serif',
          "&.Mui-disabled": { opacity: 0.5 },
        }}
      >
        Place order
      </Button>
    </Box>


      {/* ================= ADDRESS MODAL ================= */}
      <Dialog
      open={openAddress}
      fullWidth
      PaperProps={{
        sx: {
          fontFamily: '"Montserrat", sans-serif',
          "& *": { fontFamily: '"Montserrat", sans-serif' },
        },
      }}
    >
      <DialogContent>
        <Typography
          fontWeight={600}
          mb={1}
          sx={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          Enter address
        </Typography>

        <TextField
          fullWidth
          label="Street address"
          size="small"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          sx={{
            mb: 1,
            "& .MuiInputLabel-root": {
              fontFamily: '"Montserrat", sans-serif',
            },
            "& .MuiInputBase-input": {
              fontFamily: '"Montserrat", sans-serif',
            },
          }}
        />

        <TextField
          fullWidth
          label="Apartment / unit (optional)"
          size="small"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          sx={{
            mb: 1,
            "& .MuiInputLabel-root": {
              fontFamily: '"Montserrat", sans-serif',
            },
            "& .MuiInputBase-input": {
              fontFamily: '"Montserrat", sans-serif',
            },
          }}
        />

        <TextField
          fullWidth
          label="City"
          size="small"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          sx={{
            mb: 1,
            "& .MuiInputLabel-root": {
              fontFamily: '"Montserrat", sans-serif',
            },
            "& .MuiInputBase-input": {
              fontFamily: '"Montserrat", sans-serif',
            },
          }}
        />

        <Box display="flex" gap={1}>
          <TextField
            label="Postal code"
            size="small"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": {
                fontFamily: '"Montserrat", sans-serif',
              },
              "& .MuiInputBase-input": {
                fontFamily: '"Montserrat", sans-serif',
              },
            }}
          />

          <TextField
            value="Sri Lanka"
            size="small"
            disabled
            fullWidth
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: '"Montserrat", sans-serif',
              },
            }}
          />
        </Box>

        <Button
          fullWidth
          sx={{
            mt: 2,
            bgcolor: "#1f2937",
            color: "#fff",
            fontFamily: '"Montserrat", sans-serif',
          }}
          disabled={!street || !city || !postal}
          onClick={() => {
            setOpenAddress(false);
            setOpenMap(true);
          }}
        >
          Next
        </Button>
      </DialogContent>
    </Dialog>


      {/* ================= MAP MODAL ================= */}
      <Dialog
        open={openMap}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            fontFamily: '"Montserrat", sans-serif',
            "& *": { fontFamily: '"Montserrat", sans-serif' },
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: 360, position: "relative" }}>
            {/* 🔙 BACK TO ADDRESS */}
            <IconButton
            onClick={() => {
              setOpenMap(false);
              setOpenAddress(true);
            }}
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 10,
              bgcolor: "#fff",
              color: "#000",
              boxShadow: 2,
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

            {/* 🧹 CLEAR MAP SELECTION */}
            <Button
              onClick={() => {
                setCoords(null);
                setLocationConfirmed(false);
                setCenter(DEFAULT_CENTER);
              }}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                bgcolor: "#fff",
                color: "#000",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 2,
                fontFamily:font,
              }}
            >
              Clear
            </Button>
+
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={center}
                zoom={17}
                options={{ styles: GOOGLE_MAP_STYLE, disableDefaultUI: true }}
                onLoad={(map: google.maps.Map) => {
                  mapRef.current = map;
                }}
                onIdle={() => {
                  if (!mapRef.current) return;
                  const c = mapRef.current.getCenter();
                  if (!c) return;
                  setCoords({ lat: c.lat(), lng: c.lng() });
                }}
              />
            )}

            {/* 📍 USE MY LOCATION */}
            <IconButton
              onClick={useMyLocation}
              sx={{
                position: "absolute",
                bottom: 80,
                right: 12,
                bgcolor: "#fff",
                boxShadow: 2,
              }}
            >
              <MyLocationIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 1.5 }}>
            <Button
              fullWidth
              disabled={!coords}
              sx={{
                bgcolor: "#1f2937",
                color: "#fff",
                py: 1.3,
              }}
              onClick={() => {
                setLocationConfirmed(true);
                setOpenMap(false);
              }}
            >
              Confirm
            </Button>
          </Box>
        </DialogContent>
      </Dialog>



        {/* ================= MATERIAL ALERT ================= */}
          <Snackbar
            open={snack.open}
            autoHideDuration={3000}
            onClose={() => setSnack({ ...snack, open: false })}
          >
            <Alert severity={snack.severity}>{snack.message}</Alert>
          </Snackbar>
    
    </Box>
  );
}
