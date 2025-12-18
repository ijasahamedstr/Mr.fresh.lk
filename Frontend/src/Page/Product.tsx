import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Container,
  Stack,
  Skeleton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { keyframes } from "@mui/system";

/* ================= ENV ================= */
const API_HOST = import.meta.env.VITE_API_HOST;
const Montserrat = '"Montserrat", sans-serif';

/* ================= ANIMATION ================= */
const blink = keyframes`
  0% { box-shadow: 0 0 0 rgba(211,47,47,0.4); }
  50% { box-shadow: 0 0 20px rgba(211,47,47,0.9); }
  100% { box-shadow: 0 0 0 rgba(211,47,47,0.4); }
`;

const Products: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_HOST}/Products`)
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Error loading products", err))
      .finally(() => setLoading(false));
  }, []);

  const todaySpecials = items.filter((p) => p.todaySpecial);
  const popularProducts = items.filter((p) => p.popularProduct);

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.id || product._id}`, {
      state: { product },
    });
  };

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: 8,
          fontFamily: Montserrat,
          "& *": { fontFamily: Montserrat },
        }}
      >
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Stack direction="row" spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={280}
              height={350}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Stack>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        fontFamily: Montserrat,
        "& *": { fontFamily: Montserrat },
      }}
    >
      {/* ================= TODAY SPECIAL ================= */}
      <SectionHeader title="Today Special Offer" />
      <HorizontalScrollBox>
        {todaySpecials.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            variant="today"
            onClick={() => handleProductClick(item)}
          />
        ))}
      </HorizontalScrollBox>

      {/* ================= POPULAR PRODUCTS ================= */}
      <SectionHeader title="Popular Products" />
      <HorizontalScrollBox>
        {popularProducts.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            variant="popular"
            onClick={() => handleProductClick(item)}
          />
        ))}
      </HorizontalScrollBox>

      {/* ================= ALL PRODUCTS ================= */}
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{ mt: 4, mb: 3, fontFamily: Montserrat }}
      >
        All Products
      </Typography>

      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        }}
      >
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onClick={() => handleProductClick(item)}
          />
        ))}
      </Box>
    </Container>
  );
};

/* ================= SUB COMPONENTS ================= */

const SectionHeader = ({ title }: { title: string }) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mt={4}
    mb={2}
    sx={{ fontFamily: Montserrat }}
  >
    <Typography variant="h5" fontWeight={800} sx={{ fontFamily: Montserrat }}>
      {title}
    </Typography>
    <Box>
      <IconButton size="small" sx={{ fontFamily: Montserrat }}>
        <ChevronLeftIcon />
      </IconButton>
      <IconButton size="small" sx={{ fontFamily: Montserrat }}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  </Box>
);

const HorizontalScrollBox = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      display: "flex",
      gap: 3,
      overflowX: "auto",
      pb: 2,
      fontFamily: Montserrat,
      "& *": { fontFamily: Montserrat },
      "&::-webkit-scrollbar": { display: "none" },
      scrollbarWidth: "none",
    }}
  >
    {children}
  </Box>
);

/* ================= PRODUCT CARD ================= */

const ProductCard = ({
  item,
  onClick,
  variant = "normal",
}: {
  item: any;
  onClick: () => void;
  variant?: "today" | "popular" | "normal";
}) => {
  const isToday = variant === "today";
  const isPopular = variant === "popular";

  return (
    <Card
      elevation={0}
      sx={{
        minWidth: 260,
        maxWidth: 280,
        borderRadius: 4,
        position: "relative",
        border: "1px solid #eee",
        transition: "0.3s",
        fontFamily: Montserrat,
        "& *": { fontFamily: Montserrat },

        ...(isToday && {
          border: "2px solid #d32f2f",
          animation: `${blink} 1.4s infinite`,
        }),
        ...(isPopular && {
          border: "2px solid #c2d142",
        }),

        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* TODAY OFFER BADGE */}
      {isToday && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            bgcolor: "#d32f2f",
            color: "#fff",
            px: 1.5,
            py: 0.5,
            fontSize: 12,
            fontWeight: 800,
            borderRadius: 1,
            zIndex: 2,
            fontFamily: Montserrat,
          }}
        >
          TODAY OFFER
        </Box>
      )}

      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          fontFamily: Montserrat,
        }}
      >
        <CardMedia
          component="img"
          height="180"
          image={item.images?.[0] || item.img}
          alt={item.name}
          sx={{ objectFit: "contain" }}
        />
      </Box>

      <CardContent sx={{ pt: 0, fontFamily: Montserrat }}>
        <Typography fontWeight={600} fontSize={15} sx={{ fontFamily: Montserrat,}}>
          {item.name || item.title}
        </Typography>

        {item.originalPrice && isToday && (
          <Typography
            fontSize={12}
            sx={{ textDecoration: "line-through", color: "#999",fontFamily: Montserrat, }}
          >
            LKR {item.originalPrice.toLocaleString()}
          </Typography>
        )}

        <Typography
          fontWeight={500}
          fontSize={16}
          color={isToday ? "#d32f2f" : "#000"}
          sx={{fontFamily: Montserrat,}}
        >
          LKR {item.price?.toLocaleString()}
        </Typography>
      </CardContent>

      <Box sx={{ p: 2, pt: 0, fontFamily: Montserrat }}>
        <Button
          fullWidth
          onClick={onClick}
          sx={{
            bgcolor: "#c2d142",
            color: "#000",
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 2,
            fontFamily: Montserrat,
            boxShadow: "none",
            "&:hover": { bgcolor: "#adb837" },
          }}
        >
          View The Product
        </Button>
      </Box>
    </Card>
  );
};

export default Products;
