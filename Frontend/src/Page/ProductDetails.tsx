import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/* ================= ENV ================= */

const API_HOST = import.meta.env.VITE_API_HOST || "";

/* ================= DESIGN ================= */

const FONT_FAMILY = '"Montserrat", sans-serif';

const PRIMARY_COLOR = "#c2d142";
const PRIMARY_HOVER = "#b2c132";
const PRIMARY_DARK = "#596000";
const PRIMARY_LIGHT = "#f8fad9";
const PRIMARY_EXTRA_LIGHT = "#fcfdeb";

/* ================= TYPES ================= */

interface ProductVariant {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price: number;
  originalPrice?: number;
  weight?: number | string;
  image?: string;
  images?: string[];
  quantity?: number;
  soldOut?: boolean;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  variants?: ProductVariant[];
}

interface LocationState {
  product?: Product;
}

interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  weight?: number | string;
  price: number;
  qty: number;
  image: string;
}

/* ================= COMPONENT ================= */

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as LocationState | null;

  const [product, setProduct] = useState<Product | null>(
    locationState?.product || null
  );

  /*
   * No variant is selected automatically.
   * The customer must select one manually.
   */
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  const [mainImage, setMainImage] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  /* ================= LOAD MONTSERRAT FONT ================= */

  useEffect(() => {
    const fontLinkId = "product-detail-montserrat-font";

    if (!document.getElementById(fontLinkId)) {
      const fontLink = document.createElement("link");

      fontLink.id = fontLinkId;
      fontLink.rel = "stylesheet";
      fontLink.href =
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap";

      document.head.appendChild(fontLink);
    }
  }, []);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    if (product || !id) return;

    let active = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await axios.get<Product>(
          `${API_HOST}/Products/${id}`
        );

        if (active) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      active = false;
    };
  }, [id, product]);

  /* ================= INITIAL PRODUCT STATE ================= */

  useEffect(() => {
    if (!product) return;

    /*
     * Keep the variant empty when the page first opens.
     */
    setSelectedVariant(null);
    setQty(1);
    setImageLoaded(false);
    setMainImage(product.images?.[0] || "");
  }, [product?._id]);

  /* ================= HELPERS ================= */

  const getVariantId = (
    variant: ProductVariant
  ): string => {
    return variant._id || variant.id || "";
  };

  const getVariantName = (
    variant?: ProductVariant | null,
    index?: number
  ): string => {
    if (!variant) {
      return "Default Variant";
    }

    return (
      variant.title ||
      variant.name ||
      `Variant ${(index ?? 0) + 1}`
    );
  };

  const getVariantImage = (
    variant?: ProductVariant | null
  ): string => {
    return (
      variant?.image ||
      variant?.images?.[0] ||
      product?.images?.[0] ||
      ""
    );
  };

  const isVariantSelected = (
    variant: ProductVariant
  ): boolean => {
    if (!selectedVariant) return false;

    const selectedId = getVariantId(selectedVariant);
    const currentId = getVariantId(variant);

    if (selectedId && currentId) {
      return selectedId === currentId;
    }

    return selectedVariant === variant;
  };

  const formatPrice = (price?: number): string => {
    return Number(price || 0).toLocaleString("en-LK");
  };

  const formatWeight = (
    weight?: number | string
  ): string => {
    if (
      weight === undefined ||
      weight === null ||
      weight === ""
    ) {
      return "";
    }

    if (typeof weight === "number") {
      return `${weight} g`;
    }

    return String(weight);
  };

  /* ================= SELECT VARIANT ================= */

  const handleVariantSelect = (
    variant: ProductVariant
  ) => {
    if (variant.soldOut) return;

    setSelectedVariant(variant);
    setQty(1);

    const selectedImage = getVariantImage(variant);

    if (selectedImage !== mainImage) {
      setImageLoaded(false);
      setMainImage(selectedImage);
    }
  };

  /* ================= QUANTITY ================= */

  const decreaseQuantity = () => {
    setQty((currentQty) =>
      Math.max(1, currentQty - 1)
    );
  };

  const increaseQuantity = () => {
    if (
      !selectedVariant ||
      selectedVariant.soldOut
    ) {
      return;
    }

    const availableQuantity = Number(
      selectedVariant.quantity || 0
    );

    if (
      availableQuantity > 0 &&
      qty >= availableQuantity
    ) {
      return;
    }

    setQty((currentQty) => currentQty + 1);
  };

  /* ================= ADD TO CART ================= */

  const handleAddToCart = () => {
    if (
      !product ||
      !selectedVariant ||
      selectedVariant.soldOut
    ) {
      return;
    }

    try {
      const storedCart =
        localStorage.getItem("cartItems");

      let cart: CartItem[] = [];

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          cart = parsedCart;
        }
      }

      const variantId =
        getVariantId(selectedVariant);

      const existingItemIndex = cart.findIndex(
        (item) =>
          item.productId === product._id &&
          item.variantId === variantId
      );

      if (existingItemIndex !== -1) {
        cart[existingItemIndex] = {
          ...cart[existingItemIndex],
          qty: cart[existingItemIndex].qty + qty,
        };
      } else {
        cart.push({
          productId: product._id,
          variantId,
          name: product.name,
          variantName: getVariantName(
            selectedVariant
          ),
          weight: selectedVariant.weight,
          price: Number(selectedVariant.price),
          qty,
          image: getVariantImage(selectedVariant),
        });
      }

      localStorage.setItem(
        "cartItems",
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      setOpenAlert(true);
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error
      );
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          fontFamily: FONT_FAMILY,

          "& *": {
            fontFamily: `${FONT_FAMILY} !important`,
          },
        }}
      >
        <CircularProgress
          size={50}
          thickness={3}
          sx={{
            color: PRIMARY_COLOR,
          }}
        />
      </Box>
    );
  }

  /* ================= PRODUCT NOT FOUND ================= */

  if (!product) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
        sx={{
          fontFamily: FONT_FAMILY,

          "& *": {
            fontFamily: `${FONT_FAMILY} !important`,
          },
        }}
      >
        <Typography
          fontSize={20}
          fontWeight={700}
        >
          Product not found
        </Typography>

        <Button
          onClick={() => navigate("/")}
          sx={{
            color: PRIMARY_DARK,
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  /* ================= CALCULATED VALUES ================= */

  const hasVariants =
    Array.isArray(product.variants) &&
    product.variants.length > 0;

  const unitPrice = Number(
    selectedVariant?.price ?? product.price ?? 0
  );

  const totalPrice = unitPrice * qty;

  const selectedVariantSoldOut = Boolean(
    selectedVariant?.soldOut
  );

  const availableQuantity = Number(
    selectedVariant?.quantity || 0
  );

  const reachedMaximumQuantity =
    availableQuantity > 0 &&
    qty >= availableQuantity;

  /* ================= UI ================= */

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#FFFFFF",
          pb: 10,
          fontFamily: FONT_FAMILY,

          /*
           * Apply Montserrat to every text element
           * inside this complete page.
           */
          "&, & *": {
            fontFamily: `${FONT_FAMILY} !important`,
          },

          "& button": {
            fontFamily: `${FONT_FAMILY} !important`,
          },

          "& input": {
            fontFamily: `${FONT_FAMILY} !important`,
          },

          "& textarea": {
            fontFamily: `${FONT_FAMILY} !important`,
          },

          "& select": {
            fontFamily: `${FONT_FAMILY} !important`,
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 1100,
            mx: "auto",
            p: {
              xs: 2,
              sm: 4,
              md: 5,
            },
          }}
        >
          {/* ================= BACK BUTTON ================= */}

          <Button
            startIcon={
              <ArrowBackIcon
                sx={{ fontSize: 18 }}
              />
            }
            onClick={() => navigate(-1)}
            disableRipple
            sx={{
              mb: 3,
              color: "#6B7280",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "none",
              transition: "all 0.2s ease",

              "&:hover": {
                color: "#111827",
                bgcolor: "transparent",
                transform: "translateX(-4px)",
              },
            }}
          >
            Back
          </Button>

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={{
              xs: 4,
              md: 6,
              lg: 8,
            }}
            alignItems="flex-start"
          >
            {/* ================= PRODUCT IMAGE ================= */}

            <Box
              flex={0.8}
              width="100%"
              maxWidth={{ md: 450 }}
              mx="auto"
              position="relative"
            >
              <Box
                sx={{
                  position: {
                    xs: "relative",
                    md: "sticky",
                  },
                  top: 40,
                  aspectRatio: "1 / 1",
                  bgcolor: "#F9FAFB",
                  borderRadius: 5,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  boxShadow:
                    "inset 0 0 40px rgba(0,0,0,0.02)",
                }}
              >
                {!imageLoaded && mainImage && (
                  <CircularProgress
                    size={30}
                    sx={{
                      position: "absolute",
                      color: PRIMARY_COLOR,
                    }}
                  />
                )}

                {mainImage ? (
                  <Box
                    component="img"
                    src={mainImage}
                    alt={product.name}
                    onLoad={() =>
                      setImageLoaded(true)
                    }
                    onError={() =>
                      setImageLoaded(true)
                    }
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      opacity: imageLoaded ? 1 : 0,
                      transition:
                        "opacity 0.5s ease, transform 0.3s ease",

                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                ) : (
                  <Typography
                    color="#9CA3AF"
                    fontSize={13}
                    fontWeight={600}
                  >
                    No image available
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ================= PRODUCT DETAILS ================= */}

            <Box
              flex={1.2}
              width="100%"
              display="flex"
              flexDirection="column"
            >
              {/* Product badges */}

              <Stack
                direction="row"
                spacing={1}
                mb={1.5}
                flexWrap="wrap"
                useFlexGap
              >
                <Chip
                  label="New Arrival"
                  size="small"
                  sx={{
                    height: 22,
                    bgcolor: PRIMARY_COLOR,
                    color: "#111827",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                  }}
                />

                {selectedVariant?.weight && (
                  <Chip
                    label={formatWeight(
                      selectedVariant.weight
                    )}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 22,
                      borderColor: "#E5E7EB",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                )}

                {selectedVariantSoldOut && (
                  <Chip
                    label="Sold Out"
                    size="small"
                    sx={{
                      height: 22,
                      bgcolor: "#FEE2E2",
                      color: "#B91C1C",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  />
                )}
              </Stack>

              {/* Product name */}

              <Typography
                component="h1"
                color="#111827"
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs: 24,
                    md: 30,
                  },
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                {product.name}
              </Typography>

              {/* Product price */}

              <Typography
                mt={1}
                color="#111827"
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs: 20,
                    md: 22,
                  },
                }}
              >
                LKR {formatPrice(unitPrice)}
              </Typography>

              {/* Product description */}

              <Typography
                mt={2.5}
                color="#4B5563"
                fontSize={13}
                lineHeight={1.7}
              >
                {product.description ||
                  "Experience the perfect blend of quality and craftsmanship with our latest offering. Designed meticulously for your everyday needs."}
              </Typography>

              <Divider
                sx={{
                  my: 3.5,
                  borderColor: "#F3F4F6",
                }}
              />

              {/* ================= VARIANT SELECTION ================= */}

              {hasVariants && (
                <Box mb={4}>
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="space-between"
                    alignItems={{
                      xs: "flex-start",
                      sm: "center",
                    }}
                    spacing={0.7}
                    mb={1.5}
                  >
                    <Typography
                      color={PRIMARY_DARK}
                      fontSize={13}
                      fontWeight={800}
                      textTransform="uppercase"
                      letterSpacing={0.5}
                    >
                      Select Variant
                    </Typography>

                    <Typography
                      color={
                        selectedVariant
                          ? PRIMARY_DARK
                          : "#DC2626"
                      }
                      fontSize={11}
                      fontWeight={700}
                    >
                      {selectedVariant
                        ? `Selected: ${getVariantName(
                            selectedVariant
                          )}`
                        : "Please select a variant"}
                    </Typography>
                  </Stack>

                  <Stack
                    spacing={1.5}
                    role="radiogroup"
                    aria-label="Select product variant"
                  >
                    {product.variants?.map(
                      (variant, index) => {
                        const selected =
                          isVariantSelected(variant);

                        const variantName =
                          getVariantName(
                            variant,
                            index
                          );

                        const variantImage =
                          getVariantImage(variant);

                        const soldOut = Boolean(
                          variant.soldOut
                        );

                        const variantKey =
                          getVariantId(variant) ||
                          `${variantName}-${index}`;

                        return (
                          <Box
                            key={variantKey}
                            component="button"
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={`Select ${variantName}`}
                            disabled={soldOut}
                            onClick={() =>
                              handleVariantSelect(
                                variant
                              )
                            }
                            sx={{
                              width: "100%",
                              appearance: "none",
                              WebkitAppearance:
                                "none",
                              position: "relative",
                              boxSizing:
                                "border-box",
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems: "center",
                              gap: 2,
                              textAlign: "left",
                              fontFamily:
                                FONT_FAMILY,

                              border: selected
                                ? `2px solid ${PRIMARY_COLOR}`
                                : "1px solid #E5E7EB",

                              borderRadius: 2.5,

                              p: selected
                                ? 1.4
                                : 1.5,

                              bgcolor: selected
                                ? PRIMARY_LIGHT
                                : "#FFFFFF",

                              cursor: soldOut
                                ? "not-allowed"
                                : "pointer",

                              opacity: soldOut
                                ? 0.55
                                : 1,

                              boxShadow: selected
                                ? "0 0 0 3px rgba(194, 209, 66, 0.24)"
                                : "none",

                              transition:
                                "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",

                              "&:hover": {
                                borderColor: soldOut
                                  ? "#E5E7EB"
                                  : selected
                                    ? PRIMARY_COLOR
                                    : PRIMARY_HOVER,

                                bgcolor: soldOut
                                  ? "#FFFFFF"
                                  : selected
                                    ? PRIMARY_LIGHT
                                    : PRIMARY_EXTRA_LIGHT,

                                transform:
                                  selected ||
                                  soldOut
                                    ? "none"
                                    : "translateY(-1px)",

                                boxShadow: selected
                                  ? "0 0 0 3px rgba(194, 209, 66, 0.24)"
                                  : soldOut
                                    ? "none"
                                    : "0 5px 14px rgba(194, 209, 66, 0.18)",
                              },

                              "&:focus-visible": {
                                outline:
                                  "3px solid rgba(194, 209, 66, 0.38)",
                                outlineOffset: 2,
                              },

                              "&:disabled": {
                                color: "inherit",
                              },
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                              minWidth={0}
                            >
                              {/* Variant image */}

                              <Box
                                sx={{
                                  position:
                                    "relative",
                                  flexShrink: 0,
                                }}
                              >
                                {variantImage ? (
                                  <Box
                                    component="img"
                                    src={variantImage}
                                    alt={variantName}
                                    sx={{
                                      width: 52,
                                      height: 52,
                                      borderRadius:
                                        1.5,
                                      objectFit:
                                        "cover",
                                      bgcolor:
                                        "#F9FAFB",

                                      border: selected
                                        ? `2px solid ${PRIMARY_COLOR}`
                                        : "1px solid #F3F4F6",
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 52,
                                      height: 52,
                                      borderRadius:
                                        1.5,
                                      bgcolor:
                                        "#F3F4F6",

                                      border: selected
                                        ? `2px solid ${PRIMARY_COLOR}`
                                        : "1px solid #E5E7EB",
                                    }}
                                  />
                                )}

                                {selected && (
                                  <CheckCircleIcon
                                    sx={{
                                      position:
                                        "absolute",
                                      right: -6,
                                      bottom: -6,
                                      fontSize: 21,
                                      color:
                                        PRIMARY_COLOR,
                                      bgcolor:
                                        "#FFFFFF",
                                      borderRadius:
                                        "50%",
                                    }}
                                  />
                                )}
                              </Box>

                              {/* Variant information */}

                              <Box minWidth={0}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  <Typography
                                    noWrap
                                    fontSize={14}
                                    fontWeight={
                                      selected
                                        ? 800
                                        : 700
                                    }
                                    color={
                                      selected
                                        ? PRIMARY_DARK
                                        : "#111827"
                                    }
                                  >
                                    {variantName}
                                  </Typography>

                                  {selected && (
                                    <Chip
                                      label="Selected"
                                      size="small"
                                      sx={{
                                        height: 20,
                                        bgcolor:
                                          PRIMARY_COLOR,
                                        color:
                                          "#111827",
                                        fontSize: 9,
                                        fontWeight: 800,
                                      }}
                                    />
                                  )}

                                  {soldOut && (
                                    <Chip
                                      label="Sold Out"
                                      size="small"
                                      sx={{
                                        height: 20,
                                        bgcolor:
                                          "#FEE2E2",
                                        color:
                                          "#B91C1C",
                                        fontSize: 9,
                                        fontWeight: 800,
                                      }}
                                    />
                                  )}
                                </Stack>

                                {variant.weight && (
                                  <Typography
                                    mt={0.3}
                                    color="#6B7280"
                                    fontSize={12}
                                  >
                                    {formatWeight(
                                      variant.weight
                                    )}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>

                            {/* Variant price */}

                            <Typography
                              flexShrink={0}
                              fontSize={14}
                              fontWeight={800}
                              color={
                                selected
                                  ? PRIMARY_DARK
                                  : "#111827"
                              }
                            >
                              LKR{" "}
                              {formatPrice(
                                variant.price
                              )}
                            </Typography>
                          </Box>
                        );
                      }
                    )}
                  </Stack>
                </Box>
              )}

              {/* ================= QUANTITY AND CART ================= */}

              <Box mt="auto">
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                  alignItems="center"
                >
                  {/* Quantity selector */}

                  <Box
                    sx={{
                      width: {
                        xs: "100%",
                        sm: 120,
                      },
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      border:
                        "1px solid #E5E7EB",
                      borderRadius: 50,
                      bgcolor: "#FFFFFF",
                      p: 0.4,
                    }}
                  >
                    <IconButton
                      aria-label="Decrease quantity"
                      disabled={
                        !selectedVariant ||
                        qty <= 1
                      }
                      onClick={decreaseQuantity}
                      size="small"
                      sx={{
                        color: "#111827",

                        "&:hover": {
                          bgcolor:
                            PRIMARY_LIGHT,
                        },

                        "&.Mui-disabled": {
                          color: "#D1D5DB",
                        },
                      }}
                    >
                      <RemoveIcon
                        sx={{ fontSize: 18 }}
                      />
                    </IconButton>

                    <Typography
                      fontSize={15}
                      fontWeight={700}
                    >
                      {qty}
                    </Typography>

                    <IconButton
                      aria-label="Increase quantity"
                      disabled={
                        !selectedVariant ||
                        selectedVariantSoldOut ||
                        reachedMaximumQuantity
                      }
                      onClick={increaseQuantity}
                      size="small"
                      sx={{
                        color: "#111827",

                        "&:hover": {
                          bgcolor:
                            PRIMARY_LIGHT,
                        },

                        "&.Mui-disabled": {
                          color: "#D1D5DB",
                        },
                      }}
                    >
                      <AddIcon
                        sx={{ fontSize: 18 }}
                      />
                    </IconButton>
                  </Box>

                  {/* Add to cart button */}

                  <Button
                    fullWidth
                    variant="contained"
                    disabled={
                      !selectedVariant ||
                      selectedVariantSoldOut
                    }
                    onClick={handleAddToCart}
                    startIcon={
                      <ShoppingBagOutlinedIcon
                        sx={{ fontSize: 18 }}
                      />
                    }
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 50,

                      bgcolor:
                        selectedVariant &&
                        !selectedVariantSoldOut
                          ? PRIMARY_COLOR
                          : "#F3F4F6",

                      color:
                        selectedVariant &&
                        !selectedVariantSoldOut
                          ? "#111827"
                          : "#9CA3AF",

                      fontSize: 14,
                      fontWeight: 800,
                      textTransform: "none",

                      boxShadow:
                        selectedVariant &&
                        !selectedVariantSoldOut
                          ? "0 8px 18px -6px rgba(89, 96, 0, 0.45)"
                          : "none",

                      transition:
                        "all 0.3s ease",

                      "&:hover": {
                        bgcolor:
                          selectedVariant &&
                          !selectedVariantSoldOut
                            ? PRIMARY_HOVER
                            : "#F3F4F6",

                        transform:
                          selectedVariant &&
                          !selectedVariantSoldOut
                            ? "translateY(-2px)"
                            : "none",

                        boxShadow:
                          selectedVariant &&
                          !selectedVariantSoldOut
                            ? "0 10px 22px -8px rgba(89, 96, 0, 0.55)"
                            : "none",
                      },

                      "&.Mui-disabled": {
                        bgcolor: "#F3F4F6",
                        color: "#9CA3AF",
                      },
                    }}
                  >
                    {!selectedVariant
                      ? "Select a variant"
                      : selectedVariantSoldOut
                        ? "Selected variant is sold out"
                        : `Add to Cart — LKR ${formatPrice(
                            totalPrice
                          )}`}
                  </Button>
                </Stack>

                {reachedMaximumQuantity &&
                  availableQuantity > 0 && (
                    <Typography
                      mt={1}
                      textAlign={{
                        xs: "center",
                        sm: "right",
                      }}
                      color="#B45309"
                      fontSize={11}
                      fontWeight={600}
                    >
                      Only {availableQuantity} items
                      available
                    </Typography>
                  )}
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* ================= SUCCESS ALERT ================= */}

        <Snackbar
          open={openAlert}
          autoHideDuration={3000}
          onClose={() =>
            setOpenAlert(false)
          }
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <Alert
            severity="success"
            onClose={() =>
              setOpenAlert(false)
            }
            sx={{
              borderRadius: 3,
              bgcolor: "#111827",
              color: "#FFFFFF",
              boxShadow:
                "0 10px 30px -10px rgba(0,0,0,0.25)",

              "& .MuiAlert-icon": {
                color: PRIMARY_COLOR,
              },

              "& .MuiAlert-message": {
                fontFamily: `${FONT_FAMILY} !important`,
              },
            }}
          >
            <Typography
              fontSize={13}
              fontWeight={600}
            >
              {product.name}
              {selectedVariant
                ? ` (${getVariantName(
                    selectedVariant
                  )})`
                : ""}{" "}
              added to your cart
            </Typography>
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default ProductDetail;