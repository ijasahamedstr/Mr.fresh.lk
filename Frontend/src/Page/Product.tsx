import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Container,
  Stack,
  Skeleton,
  Chip,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2Icon from "@mui/icons-material/Inventory2";

/* ================= ENV & GLOBAL STYLES ================= */
const API_HOST = (import.meta as unknown as { env: { VITE_API_URL: string } }).env.VITE_API_URL;
const FONT_FAMILY = '"Montserrat", sans-serif';

/* ================= HELPER ================= */
const calculateDiscount = (original: number, current: number) => {
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

/* ================= MAIN COMPONENT ================= */
// Component now uses URL state entirely instead of props
const Products: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Read State directly from the URL
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category");
  const isSearching = Boolean(searchQuery);

  useEffect(() => {
    axios
      .get(`${API_HOST}/Products`)
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Error loading products", err))
      .finally(() => setLoading(false));
  }, []);

  /* ================= FILTER LOGIC ================= */
  const filteredItems = items.filter((p) => {
    // 1. Check Category match
    const matchesCategory = selectedCategory
      ? p.mainCategory === selectedCategory || p.category === selectedCategory
      : true;

    // 2. Check Search Match (Live Search Logic)
    const matchesSearch = searchQuery
      ? p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  const todaySpecials = filteredItems.filter((p) => p.todaySpecial);
  const popularProducts = filteredItems.filter((p) => p.popularProduct);

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.id || product._id}`, {
      state: { product },
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, fontFamily: FONT_FAMILY, "& *": { fontFamily: FONT_FAMILY } }}>
        <Skeleton variant="text" width={250} height={60} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={180} height={30} sx={{ mb: 3 }} />
        <Stack direction="row" spacing={3}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" width={240} height={340} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5, fontFamily: FONT_FAMILY, "& *": { fontFamily: `${FONT_FAMILY} !important` } }}>
      
      {/* ================= TODAY SPECIAL ================= */}
      {!isSearching && todaySpecials.length > 0 && (
        <>
          <SectionHeader title="Today's Special Offers" subtitle="Grab them before they're gone!" icon={<LocalOfferIcon />} />
          <HorizontalScrollBox>
            {todaySpecials.map((item) => (
              <ProductCard key={item.id || item._id} item={item} onClick={() => handleProductClick(item)} />
            ))}
          </HorizontalScrollBox>
        </>
      )}

      {/* ================= POPULAR PRODUCTS ================= */}
      {!isSearching && popularProducts.length > 0 && (
        <>
          <SectionHeader title="Trending & Popular" subtitle="Our most loved products this week" icon={<WhatshotIcon sx={{ color: "#ef4444" }} />} />
          <HorizontalScrollBox>
            {popularProducts.map((item) => (
              <ProductCard key={item.id || item._id} item={item} onClick={() => handleProductClick(item)} />
            ))}
          </HorizontalScrollBox>
        </>
      )}

      {/* ================= ALL PRODUCTS / SEARCH RESULTS ================= */}
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mt: 7, mb: 4, pb: 2, borderBottom: "2px solid #f3f4f6" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isSearching || selectedCategory ? (
            <SearchIcon sx={{ color: "#d98f2b", fontSize: 32 }} />
          ) : (
            <Inventory2Icon sx={{ color: "#d98f2b", fontSize: 32 }} />
          )}
          <Typography variant="h4" fontWeight={800} sx={{ background: "linear-gradient(45deg, #1a1a1a 30%, #d98f2b 90%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.5px" }}>
            {isSearching ? `Results for "${searchQuery}"` : selectedCategory ? `${selectedCategory} Products` : "All Products"}
          </Typography>
        </Box>
        <Chip label={`${filteredItems.length} Items Found`} size="small" sx={{ bgcolor: "#fff3e0", color: "#d98f2b", fontWeight: 700, border: "1px solid #ffe0b2" }} />
      </Box>

      {filteredItems.length > 0 ? (
        <Box display="grid" gap={3} gridTemplateColumns={{ xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)", xl: "repeat(5, 1fr)" }}>
          {filteredItems.map((item) => (
            <ProductCard key={item.id || item._id} item={item} onClick={() => handleProductClick(item)} />
          ))}
        </Box>
      ) : (
        <Box sx={{ py: 10, textAlign: "center", bgcolor: "#f9fafb", borderRadius: 3, border: "1px dashed #d1d5db" }}>
          <SearchIcon sx={{ fontSize: 60, color: "#9ca3af", mb: 2 }} />
          <Typography variant="h5" fontWeight={600} color="#4b5563" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body1" color="#9ca3af">
            {isSearching
              ? `We couldn't find anything matching "${searchQuery}". Try a different keyword.`
              : "There are currently no products available in this category."}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

/* ================= SUB COMPONENTS ================= */

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon }) => (
  <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={6} mb={3}>
    <Box display="flex" flexDirection="column" gap={0.5}>
      <Box display="flex" alignItems="center" gap={1.5}>
        {icon && (
          <Box sx={{ display: "flex", color: "#d98f2b", bgcolor: "#fff3e0", p: 0.8, borderRadius: "20%" }}>
            {icon}
          </Box>
        )}
        <Typography variant="h5" fontWeight={800} sx={{ background: "linear-gradient(90deg, #1a1a1a 0%, #4b5563 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.5px" }}>
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 500, ml: icon ? 5.5 : 0 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    <Box display="flex" gap={1}>
      <IconButton size="small" sx={{ bgcolor: "#fff", border: "1px solid #e5e7eb", "&:hover": { bgcolor: "#f9fafb" } }}>
        <ChevronLeftIcon />
      </IconButton>
      <IconButton size="small" sx={{ bgcolor: "#1a1a1a", color: "#fff", border: "1px solid #1a1a1a", "&:hover": { bgcolor: "#374151" } }}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  </Box>
);

const HorizontalScrollBox = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: "flex", gap: 3, overflowX: "auto", pb: 2, pt: 1, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
    {children}
  </Box>
);

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ item, onClick }: { item: any; onClick: () => void }) => {
  const discount = calculateDiscount(item.originalPrice, item.price);

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{ minWidth: 220, maxWidth: 250, width: "100%", display: "flex", flexDirection: "column", borderRadius: 3, position: "relative", bgcolor: "#ffffff", border: "1px solid #eaeaea", cursor: "pointer", transition: "all 0.3s ease", "&:hover": { boxShadow: "0 10px 25px rgba(0,0,0,0.08)", borderColor: "transparent", transform: "translateY(-4px)" } }}
    >
      {discount > 0 && (
        <Box sx={{ position: "absolute", top: 12, left: 12, background: "linear-gradient(45deg, #ef4444, #f97316)", color: "#fff", px: 1.2, py: 0.4, fontSize: 11, fontWeight: 700, borderRadius: 1.5, zIndex: 10, boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)" }}>
          -{discount}% OFF
        </Box>
      )}

      <Box sx={{ p: 2, pb: 0 }}>
        <CardMedia component="img" height="160" image={item.images?.[0] || item.img} alt={item.name} sx={{ objectFit: "contain", width: "100%", transition: "transform 0.3s", "&:hover": { transform: "scale(1.05)" } }} />
      </Box>

      <CardContent sx={{ p: 2.5, pt: 2, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", "&:last-child": { pb: 2.5 } }}>
        <Box>
          <Typography fontSize={11} fontWeight={600} sx={{ color: "#d98f2b", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {item.category || "Category"}
          </Typography>
          <Typography fontWeight={700} fontSize={15} sx={{ color: "#1f2937", lineHeight: 1.3, mb: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", minHeight: "2.6em" }}>
            {item.name || item.title}
          </Typography>
          <Typography fontSize={12} sx={{ color: "#6b7280", mb: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", minHeight: "2.4em", lineHeight: 1.5 }}>
            {item.description || item.subtitle || "Product details..."}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: "auto" }}>
          <Box>
            {item.originalPrice && (
              <Typography fontSize={11} fontWeight={500} sx={{ textDecoration: "line-through", color: "#9ca3af", mb: 0.2 }}>
                RS. {item.originalPrice.toLocaleString()}
              </Typography>
            )}
            <Typography fontWeight={800} fontSize={16} sx={{ color: "#111827" }}>
              RS. {item.price?.toLocaleString()}
            </Typography>
          </Box>
          <IconButton 
            onClick={(e) => { 
              e.stopPropagation(); 
              onClick(); // Triggers the exact same function as clicking the card
            }} 
            sx={{ bgcolor: "#111827", color: "#ffffff", width: 36, height: 36, transition: "all 0.2s", "&:hover": { bgcolor: "#d98f2b", transform: "scale(1.1)" } }}
          >
            <AddIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Products;