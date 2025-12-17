import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const Montserrat = '"Montserrat", sans-serif';

/* ================= ENV ================= */
const API_HOST = import.meta.env.VITE_API_HOST;

/* ================= TYPES ================= */
export type SpecialProduct = {
  id?: string;
  title?: string;
  price?: number | string;
  img?: string;
  weight?: string;
  todaySpecial?: boolean;
  popularProduct?: boolean;
  createdAt?: string;
};

type ProductProps = {
  cardsCount?: number;
  pageSize?: number;
  onAddToBag?: (product: SpecialProduct) => void;
};

/* ================= PRICE FORMAT ================= */
const formatPriceToLKR = (price?: number | string) => {
  if (!price) return "";
  return `LKR ${Number(price).toFixed(2)}`;
};

/* ================= CARD ================= */
const ProductCard: React.FC<{
  product: SpecialProduct;
  onAddToBag?: (product: SpecialProduct) => void;
}> = ({ product, onAddToBag }) => {
  const navigate = useNavigate();

  const handleViewProduct = () => {
    navigate(`/product/${product.id}`, {
      state: { product },
    });
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardMedia
        component="img"
        height={140}
        image={product.img}
        alt={product.title}
        onError={(e: any) =>
          (e.currentTarget.src =
            "https://via.placeholder.com/600x400?text=No+Image")
        }
        sx={{ objectFit: "contain", background: "#fff" }}
      />

      <CardContent>
        <Typography fontWeight={600} noWrap sx={{ fontFamily: Montserrat }}>
          {product.title}
        </Typography>

        {product.weight && (
          <Typography
            fontSize={12}
            color="text.secondary"
            sx={{ fontFamily: Montserrat }}
          >
            {product.weight}
          </Typography>
        )}

        <Typography
          fontWeight={700}
          color="error.main"
          mt={1}
          sx={{ fontFamily: Montserrat }}
        >
          {formatPriceToLKR(product.price)}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          fullWidth
          variant="contained"
          sx={{
            background: "linear-gradient(90deg,#c2d142,#9eb027)",
            color: "#000",
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            fontFamily: Montserrat,
          }}
          onClick={handleViewProduct}
        >
          View The Product
        </Button>
      </CardActions>
    </Card>
  );
};

/* ================= MAIN ================= */
const Product: React.FC<ProductProps> = ({
  cardsCount = 5,
  pageSize = 12,
  onAddToBag,
}) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [todaySpecials, setTodaySpecials] = useState<SpecialProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<SpecialProduct[]>([]);
  const [allProducts, setAllProducts] = useState<SpecialProduct[]>([]);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_HOST}/Products`);
        const products = res.data || [];

        const mapped: SpecialProduct[] = products.map((p: any) => ({
          id: p._id,
          title: p.name,
          price: p.price,
          weight: p.weight ? `${p.weight} g` : undefined,
          img: p.images?.[0],
          todaySpecial: p.todaySpecial,
          popularProduct: p.popularProduct,
          createdAt: p.createdAt,
        }));

        setTodaySpecials(mapped.filter((p) => p.todaySpecial));
        setPopularProducts(mapped.filter((p) => p.popularProduct));

        setAllProducts(
          mapped.sort(
            (a, b) =>
              new Date(b.createdAt || "").getTime() -
              new Date(a.createdAt || "").getTime()
          )
        );
      } catch (err) {
        console.error("Product fetch error", err);
      }
    };

    fetchProducts();
  }, []);

  const loadMore = () =>
    setVisibleCount((v) => Math.min(allProducts.length, v + pageSize));

  const canLoadMore = visibleCount < allProducts.length;

  /* ================= SLIDER ================= */
  const specialRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);

  const scrollByOne = (ref: HTMLDivElement | null, dir: "next" | "prev") => {
    if (!ref) return;
    ref.scrollBy({
      left: dir === "next" ? ref.clientWidth : -ref.clientWidth,
      behavior: "smooth",
    });
  };

  /* ================= UI ================= */
  return (
    <Box px={{ xs: 2, md: 3 }} sx={{ fontFamily: Montserrat }}>
      {/* TODAY SPECIAL */}
      <Section
        title="Today Special Offer"
        products={todaySpecials.slice(0, cardsCount)}
        refEl={specialRef}
        scroll={scrollByOne}
        onAddToBag={onAddToBag}
      />

      {/* POPULAR */}
      <Section
        title="Popular Products"
        products={popularProducts.slice(0, cardsCount)}
        refEl={popularRef}
        scroll={scrollByOne}
        onAddToBag={onAddToBag}
      />

      {/* ALL PRODUCTS */}
      <Typography
        fontSize={22}
        fontWeight={800}
        mb={2}
        sx={{ fontFamily: Montserrat }}
      >
        All Products
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1,1fr)",
          sm: "repeat(2,1fr)",
          md: "repeat(3,1fr)",
          lg: "repeat(5,1fr)",
        }}
        gap={3}
      >
        {allProducts.slice(0, visibleCount).map((p) => (
          <ProductCard key={p.id} product={p} onAddToBag={onAddToBag} />
        ))}
      </Box>

      {canLoadMore && (
        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            sx={{ fontWeight: 600, textTransform: "none", fontFamily: Montserrat }}
            onClick={loadMore}
          >
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
};

/* ================= SECTION ================= */
const Section = ({
  title,
  products,
  refEl,
  scroll,
  onAddToBag,
}: any) => (
  <>
    <Box display="flex" justifyContent="space-between" mb={1}>
      <Typography fontSize={22} fontWeight={800}>
        {title}
      </Typography>

      <Box>
        <IconButton onClick={() => scroll(refEl.current, "prev")}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={() => scroll(refEl.current, "next")}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>

    <Box ref={refEl} display="flex" gap={2} overflow="auto" mb={4}>
      {products.map((p: any) => (
        <Box minWidth={260} key={p.id}>
          <ProductCard product={p} onAddToBag={onAddToBag} />
        </Box>
      ))}
    </Box>
  </>
);

export default Product;
