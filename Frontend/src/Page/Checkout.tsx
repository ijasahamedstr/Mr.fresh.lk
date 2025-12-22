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
  DialogContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useNavigate } from "react-router-dom";

/* ================= GOOGLE MAP ================= */
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

/* ================= FONT ================= */
const font = '"Montserrat", sans-serif';

/* ---------- LIGHT MAP STYLE ---------- */
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

  /* -------- GOOGLE MAP LOADER -------- */
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  /* -------- MAP REF -------- */
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

  /* ---------------- GPS ---------------- */
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter({ lat, lng });
        setCoords({ lat, lng });
      },
      () => alert("Please enable location permission")
    );
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
        "& *": { fontFamily: font },
      }}
    >
      {/* ================= HEADER ================= */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography fontWeight={700} sx={{fontFamily:font}}>Checkout</Typography>
          <Typography fontSize={13} color="#555" sx={{fontFamily:font}}>
            Mr.Fresh.lk
          </Typography>
        </Box>
      </Box>

      {/* ================= CUSTOMER ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, mb: 2 }}>
        <Typography fontWeight={600} mb={1} sx={{fontFamily:font}}>
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

            /* Label font */
            "& .MuiInputLabel-root": {
              fontFamily: font,
            },

            /* Input text font */
            "& .MuiInputBase-input": {
              fontFamily: font,
            },
          }}
        />

        <Box display="flex" gap={1}>
          <TextField value="+94" size="small" disabled sx={{
            mb: 1.5,

            /* Label font */
            "& .MuiInputLabel-root": {
              fontFamily: font,
            },

            /* Input text font */
            "& .MuiInputBase-input": {
              fontFamily: font,
            },
          }} />
          <TextField
            fullWidth
            size="small"
            label="WhatsApp number"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            sx={{
            mb: 1.5,

            /* Label font */
            "& .MuiInputLabel-root": {
              fontFamily: font,
            },

            /* Input text font */
            "& .MuiInputBase-input": {
              fontFamily: font,
            },
          }}
          />
        </Box>
      </Box>

      {/* ================= ITEMS ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, mb: 2 }}>
        <Typography fontWeight={600} mb={1} sx={{fontFamily:font}}>
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
              sx={{ fontFamily: font }}
            >
              {item.name}
            </Typography>

            <Typography
              fontSize={12}
              color="#666"
              sx={{ fontFamily: font }}
            >
              Qty {item.qty}
            </Typography>
          </Box>

          <Typography
            fontSize={12}
            fontWeight={600}
            sx={{ fontFamily: font }}
          >
            LKR {(item.price * item.qty).toLocaleString()}
          </Typography>
        </Box>
      ))}
      </Box>

      {/* ================= DELIVERY ================= */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2, mb: 2 }}>
        <Typography fontWeight={600} mb={1} sx={{fontFamily:font}}>
          Delivery
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
          sx={{
            /* Selected value */
            "& .MuiSelect-select": {
              fontFamily: font,
            },

            /* Label (safe even if none now) */
            "& .MuiInputLabel-root": {
              fontFamily: font,
            },
          }}
        >
          <MenuItem value="Kalmunai" sx={{ fontFamily: font }}>
            Kalmunai – LKR 50
          </MenuItem>

          <MenuItem value="Sainthamaruthu" sx={{ fontFamily: font }}>
            Sainthamaruthu – LKR 70
          </MenuItem>

          <MenuItem value="Maruthamunai" sx={{ fontFamily: font }}>
            Maruthamunai – LKR 100
          </MenuItem>
        </TextField>
      </Box>

      {/* ================= CONFIRM LOCATION CARD ================= */}
      {locationConfirmed && coords && (
        <Box
          sx={{
            mx: 2,
            mb: 2,
            p: 1.5,
            bgcolor: "#fff",
            borderRadius: 2,
            border: "1px solid #e5e7eb",
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
              <Typography fontSize={13} fontWeight={600}>
                Confirm your location
              </Typography>
              <Typography fontSize={12} color="#6b7280">
                {street}, {city}
              </Typography>
              <Typography fontSize={12} color="#6b7280">
                {postal}
              </Typography>
            </Box>

            <Button
              size="small"
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
      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mx: 2 }}>
        <Typography fontWeight={600} mb={1} sx={{fontFamily:font}}>
          Order Summary
        </Typography>

        <Box display="flex" justifyContent="space-between">
          <Typography fontSize={13} sx={{fontFamily:font}}>Items</Typography>
          <Typography fontSize={13} sx={{fontFamily:font}}>
            LKR {itemsTotal.toLocaleString()}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography fontSize={13} sx={{fontFamily:font}}>Delivery</Typography>
          <Typography fontSize={13} sx={{fontFamily:font}}>
            LKR {deliveryCharge.toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontWeight={700} sx={{fontFamily:font}}>Total</Typography>
          <Typography fontWeight={700} sx={{fontFamily:font}}>
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
            "&.Mui-disabled": { opacity: 0.5 },
            fontFamily:font
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
            fontFamily: font,
            "& *": { fontFamily: font },
          },
        }}
      >
        <DialogContent>
          <Typography fontWeight={600} mb={1}>
            Enter address
          </Typography>

          <TextField fullWidth label="Street address" size="small" sx={{ mb: 1 }} value={street} onChange={(e) => setStreet(e.target.value)} />
          <TextField fullWidth label="Apartment / unit (optional)" size="small" sx={{ mb: 1 }} value={unit} onChange={(e) => setUnit(e.target.value)} />
          <TextField fullWidth label="City" size="small" sx={{ mb: 1 }} value={city} onChange={(e) => setCity(e.target.value)} />

          <Box display="flex" gap={1}>
            <TextField label="Postal code" size="small" value={postal} onChange={(e) => setPostal(e.target.value)} />
            <TextField value="Sri Lanka" size="small" disabled fullWidth />
          </Box>

          <Button
            fullWidth
            sx={{ mt: 2, bgcolor: "#1f2937", color: "#fff" }}
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
            fontFamily: font,
            "& *": { fontFamily: font },
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 1.5, borderBottom: "1px solid #eee" }}>
            <Typography fontWeight={600}>
              Drag map to exact location
            </Typography>
          </Box>

          <Box sx={{ height: 360, position: "relative" }}>
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={center}
                zoom={17}
                options={{
                  styles: GOOGLE_MAP_STYLE,
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
                onLoad={(map: google.maps.Map) => {
                  mapRef.current = map;
                }}
                onIdle={() => {
                  if (!mapRef.current) return;
                  const c = mapRef.current.getCenter();
                  if (!c) return;
                  setCenter({ lat: c.lat(), lng: c.lng() });
                  setCoords({ lat: c.lat(), lng: c.lng() });
                }}
              />
            )}

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
                borderRadius: 2,
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
    </Box>
  );
}
