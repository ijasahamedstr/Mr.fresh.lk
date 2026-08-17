import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Box, Typography, IconButton, Skeleton } from "@mui/material";
import { useSearchParams } from "react-router-dom";

// === ICONS ===
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// === SWIPER IMPORTS ===
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const apiBase = (import.meta as any).env?.VITE_API_URL as string | undefined;

/* ---------------- TYPES ---------------- */
type CategoryNode = { id: string; title: string; icon?: string; children?: CategoryNode[] };
type CategorySection = { categories: CategoryNode[] };

/* ---------------- LIFO HELPER ---------------- */
const lifoCategories = (items: CategoryNode[]): CategoryNode[] => {
  return items.slice().reverse();
};

/* ---------------- MAIN COMPONENT ---------------- */
const Categories: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${apiBase}/Categorysection`);
        let all: CategoryNode[] = [];
        if (Array.isArray(res.data)) {
          res.data.forEach((section: CategorySection) => {
            if (Array.isArray(section.categories)) all = all.concat(section.categories);
          });
        }
        setCategories(lifoCategories(all));
      } catch (error) {
        console.error("Category load failed", error);
      } finally {
        setLoading(false);
      }
    };
    if (apiBase) fetchCategories();
  }, []);

  const handleCategorySelect = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id === selectedCategory) {
      params.delete("category");
    } else {
      params.set("category", id); // Fix: Ensure it sets by ID
    }
    setSearchParams(params);
  };

  // Helper function to capitalize only the first letter and make the rest lowercase
  const formatTitle = (title: string) => {
    if (!title) return "";
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  };

  return (
    <Container maxWidth="lg" disableGutters sx={{ bgcolor: "#ffffff", fontFamily: '"Montserrat", sans-serif', display: "flex", flexDirection: "column", boxSizing: "border-box", pt: { xs: 2, md: 4 }, pb: { xs: 4, md: 6 }, overflow: "hidden" }}>
      <Box sx={{ position: "relative", width: "100%", px: { xs: 0, md: 6 }, py: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", gap: { xs: 2, md: 3 }, px: { xs: 2, md: 0 }, overflow: "hidden" }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Box key={item} sx={{ width: { xs: 74, sm: 86, md: 94 }, height: { xs: 120, sm: 130, md: 140 }, borderRadius: "50px", background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0px 4px 10px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", alignItems: "center", pt: 1.2, gap: 1.5 }}>
                <Skeleton variant="circular" animation="wave" sx={{ width: { xs: 54, sm: 64, md: 70 }, height: { xs: 54, sm: 64, md: 70 }, bgcolor: "#e2e8f0" }} />
                <Skeleton variant="text" animation="wave" width="50%" height={12} sx={{ borderRadius: "8px", bgcolor: "#e2e8f0" }} />
              </Box>
            ))}
          </Box>
        ) : (
          <>
            <IconButton onClick={() => swiperInstance?.slidePrev()} disabled={isBeginning} disableRipple sx={{ display: { xs: "none", md: "flex" }, position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, bgcolor: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0px 8px 24px rgba(0,0,0,0.06), inset 0px 1px 1px rgba(255,255,255,0.8)", border: "1px solid rgba(226, 232, 240, 0.6)", opacity: isBeginning ? 0 : 1, pointerEvents: isBeginning ? "none" : "auto", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.95)", transform: "translateY(-50%) scale(1.1)", boxShadow: "0px 12px 28px rgba(0,0,0,0.1), inset 0px 1px 2px rgba(255,255,255,1)" } }}>
              <ArrowBackIosNewIcon sx={{ color: "#0f172a", ml: 0.5, fontSize: "18px" }} />
            </IconButton>
            <Swiper onSwiper={setSwiperInstance} onSlideChange={(swiper) => { setIsBeginning(swiper.isBeginning); setIsEnd(swiper.isEnd); }} slidesPerView="auto" grabCursor={true} breakpoints={{ 0: { spaceBetween: 14, slidesOffsetBefore: 16, slidesOffsetAfter: 16 }, 768: { spaceBetween: 24, slidesOffsetBefore: 0, slidesOffsetAfter: 0 } }} style={{ width: "100%", padding: "28px 0" }}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id; // Fix: Checking against ID
                return (
                  <SwiperSlide key={cat.id} style={{ width: "auto", height: "auto" }}>
                    <Box onClick={() => handleCategorySelect(cat.id)} sx={{ width: { xs: 74, sm: 86, md: 94 }, minHeight: { xs: 120, sm: 130, md: 140 }, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "8px 6px", borderRadius: "50px", cursor: "pointer", WebkitTapHighlightColor: "transparent", userSelect: "none", position: "relative", background: isSelected ? "linear-gradient(135deg, #d4e354 0%, #aab921 100%)" : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", border: isSelected ? "1px solid rgba(255,255,255,0.4)" : "1px solid #f1f5f9", boxShadow: isSelected ? "0px 16px 32px -4px rgba(179, 194, 43, 0.6), inset 0px 2px 4px rgba(255,255,255,0.4)" : "0px 4px 12px rgba(0,0,0,0.03), inset 0px -2px 6px rgba(0,0,0,0.01)", transform: isSelected ? "translateY(-10px)" : "translateY(0)", transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)", "&:active": { transform: isSelected ? "translateY(-6px) scale(0.96)" : "translateY(2px) scale(0.96)" }, "&:hover": { boxShadow: isSelected ? "0px 20px 36px -4px rgba(179, 194, 43, 0.7), inset 0px 2px 4px rgba(255,255,255,0.5)" : "0px 10px 24px rgba(0,0,0,0.06)", transform: isSelected ? "translateY(-12px)" : "translateY(-6px)", "& .cat-image": { transform: isSelected ? "scale(1.15)" : "scale(1.08)" } } }}>
                      <Box sx={{ width: { xs: "58px", sm: "68px", md: "76px" }, height: { xs: "58px", sm: "68px", md: "76px" }, borderRadius: "50%", background: isSelected ? "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)" : "#ffffff", border: isSelected ? "3px solid rgba(255, 255, 255, 0.95)" : "2px solid #ffffff", boxShadow: isSelected ? "0px 4px 10px rgba(0,0,0,0.1)" : "inset 0px 2px 6px rgba(0,0,0,0.04), 0px 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", mb: "auto", flexShrink: 0, overflow: "hidden", transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
                        {cat.icon && <Box className="cat-image" component="img" src={cat.icon} alt={cat.title} sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)", transform: isSelected ? "scale(1.1)" : "scale(1)" }} />}
                      </Box>
                      <Typography sx={{ fontSize: { xs: "9px", sm: "10px", md: "11px" }, fontWeight: isSelected ? 800 : 600, fontFamily: '"Montserrat", sans-serif', color: isSelected ? "#062c12" : "#64748b", letterSpacing: "0.5px", lineHeight: 1.3, textAlign: "center", width: "90%", whiteSpace: "normal", wordWrap: "break-word", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", mb: 1.5, mt: 1, transition: "color 0.4s ease" }}>
                        {formatTitle(cat.title)}
                      </Typography>
                    </Box>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            <IconButton onClick={() => swiperInstance?.slideNext()} disabled={isEnd} disableRipple sx={{ display: { xs: "none", md: "flex" }, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, bgcolor: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0px 8px 24px rgba(0,0,0,0.06), inset 0px 1px 1px rgba(255,255,255,0.8)", border: "1px solid rgba(226, 232, 240, 0.6)", opacity: isEnd ? 0 : 1, pointerEvents: isEnd ? "none" : "auto", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.95)", transform: "translateY(-50%) scale(1.1)", boxShadow: "0px 12px 28px rgba(0,0,0,0.1), inset 0px 1px 2px rgba(255,255,255,1)" } }}>
              <ArrowForwardIosIcon sx={{ color: "#0f172a", fontSize: "18px" }} />
            </IconButton>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Categories;