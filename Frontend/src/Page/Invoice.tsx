import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import html2pdf from "html2pdf.js";

/* ================= CONFIG ================= */
const API_HOST = import.meta.env.VITE_API_HOST;
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const Montserrat = '"Montserrat", sans-serif';

const MAP_STYLE = { width: "100%", height: "160px" };

export default function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_KEY,
  });

  useEffect(() => {
    fetch(`${API_HOST}/Productsoder/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data));
  }, [id]);

  if (!order)
    return (
      <Typography
        textAlign="center"
        mt={5}
        sx={{ fontFamily: Montserrat }}
      >
        Loading invoice...
      </Typography>
    );

  const center = {
    lat: order.mapLocation.lat,
    lng: order.mapLocation.lng,
  };

  /* ================= PDF DOWNLOAD ================= */
  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;

    html2pdf()
      .set({
        margin: 8,
        filename: `Invoice_${order._id.slice(-6)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(invoiceRef.current)
      .save();
  };

  /* ================= PRINT ================= */
  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ pt: 4, pb: 6, px: 1.5, fontFamily: Montserrat }}>
      {/* ================= INVOICE CARD ================= */}
      <Box
        ref={invoiceRef}
        className="print-area"
        sx={{
          maxWidth: 420,
          mx: "auto",
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          p: 2,
          fontFamily: Montserrat,
          "& *": { fontFamily: Montserrat },
        }}
      >
        {/* ================= HEADER ================= */}
        <Box position="relative" textAlign="center" mb={2}>
          <Box
            className="no-print"
            sx={{ position: "absolute", top: 0, right: 0 }}
          >
            <IconButton onClick={handleDownloadPDF}>
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Box>

          <Box
            component="img"
            src="https://i.ibb.co/JRPnDfqQ/cmh6a26eo000h04jmaveg5yzp-removebg-preview.png"
            alt="Mr Fresh"
            sx={{ width: 70, mx: "auto", mb: 1 }}
          />

          <Typography fontWeight={700} fontSize={18} sx={{fontFamily:Montserrat}}>
            Mr.Fresh.lk
          </Typography>
          <Typography fontSize={12} sx={{fontFamily:Montserrat}}>
            take.app/mrfreshlk
          </Typography>
          <Typography fontSize={12}  sx={{fontFamily:Montserrat}}>
            +94 76 708 0553
          </Typography>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* ================= META ================= */}
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography fontSize={12} sx={{fontFamily:Montserrat}}>Invoice No</Typography>
          <Typography fontSize={12} fontWeight={600} sx={{fontFamily:Montserrat}}>
            #{order._id.slice(-6)}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontSize={12} sx={{fontFamily:Montserrat}}>Order date</Typography>
          <Typography fontSize={12} sx={{fontFamily:Montserrat}}>
            {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* ================= ITEMS ================= */}
        <Typography fontWeight={600} mb={1}>
          Items
        </Typography>

        {order.items.map((item: any, i: number) => (
          <Box key={i} display="flex" justifyContent="space-between" mb={1.5}>
            <Box display="flex" gap={1.2}>
              <Box
                component="img"
                src={item.image}
                alt={item.name}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1,
                  objectFit: "cover",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Box>
                <Typography fontSize={13} fontWeight={600}>
                  {item.name}
                </Typography>
                <Typography fontSize={12} >
                  {item.qty} × LKR {item.price.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Typography fontSize={13} fontWeight={600}>
              LKR {(item.qty * item.price).toLocaleString()}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* ================= TOTALS ================= */}
        <Row label="Items total" value={order.totals.itemsTotal} />
        <Row label="Delivery" value={order.delivery.charge} />
        <Divider sx={{ my: 1 }} />
        <Row label="Total" value={order.totals.grandTotal} bold />

        <Divider sx={{ my: 2 }} />

        {/* ================= ORDER DETAILS ================= */}
        <Typography fontWeight={600} mb={1} sx={{fontFamily:Montserrat}} >
          Order Details
        </Typography>

        <Typography fontSize={12}  sx={{fontFamily:Montserrat}}>
          Customer
        </Typography>
        <Typography fontSize={13} mb={1} sx={{fontFamily:Montserrat}}>
          {order.customer.name} / {order.customer.whatsapp}
        </Typography>

        <Typography fontSize={12}  sx={{fontFamily:Montserrat}}>
          Delivery Address
        </Typography>
        <Typography fontSize={13} sx={{fontFamily:Montserrat}}>
          {order.address.street}, {order.address.city}
        </Typography>
        <Typography fontSize={13} mb={1} sx={{fontFamily:Montserrat}}>
          {order.address.postal}
        </Typography>

        {/* ================= MAP ================= */}
        <Typography fontSize={12}  mb={0.5} sx={{fontFamily:Montserrat}}>
          Location
        </Typography>

        <Box className="no-print" sx={{ borderRadius: 2, overflow: "hidden", mb: 1 }} >
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={MAP_STYLE}
              center={center}
              zoom={16}
              options={{ disableDefaultUI: true }}
            >
              <Marker position={center} />
            </GoogleMap>
          )}
        </Box>

        <Typography className="no-print" fontSize={12} color="#2563eb" mb={2} sx={{fontFamily:Montserrat}}>
          View on Google Maps
        </Typography>

        {/* ================= ACTION BUTTONS ================= */}
        <Button
          className="no-print"
          fullWidth
          sx={{
            mt: 2,
            bgcolor: "#111827",
            color: "#fff",
            py: 1.3,
            fontFamily: Montserrat,
          }}
        >
          Pay
        </Button>

        <Button
          className="no-print"
          fullWidth
          sx={{
            mt: 1.5,
            bgcolor: "#f3f4f6",
            color: "#000",
            py: 1.2,
            fontFamily: Montserrat,
          }}
        >
          Order again
        </Button>
      </Box>

      {/* ================= PRINT CSS ================= */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area,
            .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </Box>
  );
}

/* ================= ROW COMPONENT ================= */
function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <Box display="flex" justifyContent="space-between">
      <Typography
        fontSize={13}
        fontWeight={bold ? 700 : 400}
        sx={{ fontFamily: '"Montserrat", sans-serif' }}
      >
        {label}
      </Typography>
      <Typography
        fontSize={13}
        fontWeight={bold ? 700 : 400}
        sx={{ fontFamily: '"Montserrat", sans-serif' }}
      >
        LKR {value.toLocaleString()}
      </Typography>
    </Box>
  );
}
