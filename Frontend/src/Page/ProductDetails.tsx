import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  IconButton,
  Divider,
  Stack,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

/* ================= ENV ================= */
const API_HOST = import.meta.env.VITE_API_HOST;

/* ================= FONT ================= */
const Montserrat = '"Montserrat", sans-serif';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { state } = useLocation();

  const [product, setProduct] = useState<any>(state?.product || null);
  const [variant, setVariant] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

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

  /* ================= DEFAULT VARIANT ================= */
  useEffect(() => {
    if (product) {
      if (product.variants?.length > 0) {
        setVariant(product.variants[0]);
        setMainImage(
          product.variants[0].images?.[0] || product.images?.[0] || ""
        );
      } else {
        setMainImage(product.images?.[0] || "");
      }
    }
  }, [product]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return <Typography p={3}>Product not found</Typography>;
  }

  /* ================= HANDLERS ================= */
  const handleVariantChange = (variantId: string) => {
    const selected = product.variants.find(
      (v: any) => v._id === variantId
    );
    if (selected) {
      setVariant(selected);
      setMainImage(selected.images?.[0] || mainImage);
    }
  };

  const unitPrice = variant?.price || product.price;
  const totalPrice = unitPrice * qty;

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        p: { xs: 2, md: 4 },
        fontFamily: Montserrat,
        "& *": { fontFamily: Montserrat },
      }}
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={6}>
        {/* ================= IMAGE ================= */}
        <Box flex={1.2}>
          <Box
            sx={{
              aspectRatio: "1/1",
              bgcolor: "#f9f9f9",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={mainImage}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>
        </Box>

        {/* ================= CONTENT ================= */}
        <Box flex={1}>
          <Typography variant="h4" fontWeight={700}>
            {product.name}
          </Typography>

          <Typography variant="h5" sx={{ my: 1, fontWeight: 600 }}>
            LKR {unitPrice.toLocaleString()}
          </Typography>

          <Typography sx={{ mb: 3 }}>{product.description}</Typography>

          <Divider sx={{ mb: 3 }} />

          {/* ================= VARIANTS ================= */}
          {product.variants?.length > 0 && (
            <Box mb={4}>
              <Typography fontWeight={700} mb={2}>
                Select Option
              </Typography>

              <RadioGroup
                value={variant?._id || ""}
                onChange={(e) => handleVariantChange(e.target.value)}
              >
                {product.variants.map((v: any) => (
                  <Box
                    key={v._id}
                    sx={{
                      border: "1px solid",
                      borderColor:
                        variant?._id === v._id ? "#1976d2" : "#e0e0e0",
                      borderRadius: 2,
                      mb: 1,
                      px: 2,
                      py: 1,
                    }}
                  >
                    <FormControlLabel
                      value={v._id}
                      control={<Radio />}
                      sx={{ width: "100%", m: 0 }}
                      label={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                              component="img"
                              src={v.images?.[0]}
                              sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 1,
                                objectFit: "cover",
                              }}
                            />
                            <Box>
                              <Typography fontWeight={600} fontSize={14}>
                                {v.name} ({v.weight}kg)
                              </Typography>
                              <Typography fontSize={12} color="text.secondary">
                                {v.weight}kg
                              </Typography>
                            </Box>
                          </Stack>

                          <Typography fontWeight={700}>
                            LKR {v.price.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </RadioGroup>
            </Box>
          )}

          {/* ================= QTY ================= */}
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography fontWeight={600}>Quantity</Typography>
              <Box
                display="flex"
                alignItems="center"
                border="1px solid #ddd"
                borderRadius={2}
              >
                <IconButton
                  size="small"
                  onClick={() => qty > 1 && setQty(qty - 1)}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ minWidth: 40, textAlign: "center" }}>
                  {qty}
                </Typography>
                <IconButton size="small" onClick={() => setQty(qty + 1)}>
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              sx={{
                py: 2,
                borderRadius: 2,
                background: "#000",
                "&:hover": { background: "#333" },
              }}
            >
              Add to Cart — LKR {totalPrice.toLocaleString()}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default ProductDetail;
