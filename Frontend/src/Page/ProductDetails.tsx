import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/* ================= ENV ================= */
const API_HOST = import.meta.env.VITE_API_HOST;

/* ================= FONT ================= */
const Montserrat = '"Montserrat", sans-serif';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(state?.product || null);
  const [variant, setVariant] = useState<any>(null);
  const [mainImage, setMainImage] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    if (!product && id) {
      setLoading(true);
      axios
        .get(`${API_HOST}/Products/${id}`)
        .then((res) => setProduct(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, product]);

  /* ================= SET DEFAULT IMAGE ================= */
  useEffect(() => {
    if (product) {
      setMainImage(product.images?.[0] || "");
    }
  }, [product]);

  /* ================= VARIANT SELECT ================= */
  const handleVariantSelect = (v: any) => {
    setVariant(v);
    setQty(1);
    setMainImage(v.image || v.images?.[0] || product.images?.[0]);
  };

  const formatWeight = (w: any) => {
    if (!w) return "";
    return typeof w === "number" ? `${w} g` : w;
  };

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (!variant) return;

    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");

    const existingIndex = cart.findIndex(
      (item: any) =>
        item.productId === product._id &&
        item.variantId === variant._id
    );

    if (existingIndex !== -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        variantName: variant.title || variant.name,
        weight: variant.weight,
        price: variant.price,
        qty,
        image:
          variant.image ||
          variant.images?.[0] ||
          product.images?.[0],
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setOpenAlert(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!product)
    return (
      <Typography p={3} sx={{ fontFamily: Montserrat, color: "#000" }}>
        Product not found
      </Typography>
    );

  const unitPrice = variant ? variant.price : product.price;
  const totalPrice = unitPrice * qty;

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        p: { xs: 2, md: 4 },
        fontFamily: Montserrat,
        color: "#000",
        bgcolor: "#fff",        // ✅ WHITE BACKGROUND   // ✅ FULL PAGE WHITE
        "& *": {
          fontFamily: Montserrat,
          color: "#000",
        },
      }}
    >
      {/* ================= BACK ================= */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        sx={{
          mb: 2,
          fontWeight: 600,
          textTransform: "none",
          color: "#000",
          fontFamily: Montserrat
        }}
      >
        Back to Home
      </Button>

      <Stack direction={{ xs: "column", md: "row" }} spacing={5}>
        {/* ================= IMAGE ================= */}
        <Box flex={1.2}>
          <Box
            sx={{
              aspectRatio: "1/1",
              bgcolor: "#F8FAFC",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <img
              src={mainImage}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        </Box>

        {/* ================= CONTENT ================= */}
        <Box flex={1}>
          <Typography fontSize={20} fontWeight={700}  sx={{ fontFamily: Montserrat }}>
            {product.name}
          </Typography>

          <Typography fontSize={18} fontWeight={600} my={0.5}  sx={{ fontFamily: Montserrat }}>
            LKR {unitPrice.toLocaleString()}
          </Typography>

          {variant?.weight && (
            <Typography fontSize={12}  sx={{ fontFamily: Montserrat }}>
              Weight: {formatWeight(variant.weight)}
            </Typography>
          )}

          <Typography fontSize={13} mt={2}  sx={{ fontFamily: Montserrat }}>
            {product.description}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* ================= VARIANTS ================= */}
          {product.variants?.map((v: any) => {
          const selected = variant?._id === v._id;

          return (
            <Box
              key={v._id}
              onClick={() => handleVariantSelect(v)}
              sx={{
                border: selected ? "2px solid #000" : "1px solid #CBD5E1",
                borderRadius: 2,
                mb: 1.5,
                p: 1.8,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: selected ? "#E2E8F0" : "#F1F5F9",
                fontFamily: Montserrat, // ✅ CARD FONT
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  component="img"
                  src={v.image || v.images?.[0]}
                  sx={{
                    width: 45,
                    height: 45,
                    borderRadius: 1,
                    objectFit: "cover",
                  }}
                />

                <Box>
                  <Typography
                    fontSize={13}
                    fontWeight={600}
                    sx={{ fontFamily: Montserrat }} // ✅ TITLE FONT
                  >
                    {v.title || v.name}
                  </Typography>

                  {v.weight && (
                    <Typography
                      fontSize={11}
                      sx={{ fontFamily: Montserrat }} // ✅ WEIGHT FONT
                    >
                      {formatWeight(v.weight)}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Typography
                fontSize={12}
                fontWeight={600}
                sx={{ fontFamily: Montserrat }} // ✅ PRICE FONT
              >
                LKR {v.price.toLocaleString()}
              </Typography>
            </Box>
          );
        })}

          {/* ================= QTY ================= */}
          <Stack direction="row" alignItems="center" spacing={2} my={3}>
            <IconButton onClick={() => qty > 1 && setQty(qty - 1)}>
              <RemoveIcon />
            </IconButton>

            <Typography fontWeight={600}>{qty}</Typography>

            <IconButton onClick={() => setQty(qty + 1)}>
              <AddIcon />
            </IconButton>
          </Stack>

          {/* ================= ADD TO CART ================= */}
          <Button
            fullWidth
            variant="contained"
            disabled={!variant}
            onClick={handleAddToCart}
            sx={{
              py: 1.6,
              borderRadius: 2,
              background: "#000",
              color: "#fff",
              "&:hover": { background: "#111" },
            }}
          >
            {variant
              ? `Add to Cart — LKR ${totalPrice.toLocaleString()}`
              : "Please select an option"}
          </Button>
        </Box>
      </Stack>

      {/* ================= SUCCESS ALERT ================= */}
      <Snackbar
        open={openAlert}
        autoHideDuration={1500}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success">
          {product.name} added to cart
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetail;
