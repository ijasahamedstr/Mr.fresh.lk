import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  InputBase,
  Typography,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Button,
  Badge,
  SwipeableDrawer,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

/* ---------------- ENV & ANIMATIONS ---------------- */
const API_HOST = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL;
const primaryFont = '"Montserrat", sans-serif';

/* ---------------- HIGH-STYLE COMPONENTS ---------------- */
const SearchContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  flexGrow: 1,
  borderRadius: "50px",
  backgroundColor: "rgba(241, 245, 249, 0.8)",
  display: "flex",
  alignItems: "center",
  maxWidth: 600,
  margin: "0 20px",
  border: "1px solid transparent",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease",
  "&:focus-within": {
    backgroundColor: "#fff",
    border: "1px solid #c2d142",
    boxShadow: "0 4px 12px rgba(194, 209, 66, 0.1)",
  },
  [theme.breakpoints.down("md")]: { margin: "0 10px" },
  [theme.breakpoints.down("sm")]: { margin: "8px 16px 16px 16px", maxWidth: "100%" },
}));

const StyledInput = styled(InputBase)(() => ({
  flex: 1,
  padding: "10px 16px",
  fontSize: "0.9rem",
  fontWeight: 500,
  fontFamily: primaryFont,
  width: "100%",
}));

const SearchButton = styled(IconButton)(() => ({
  background: "#c2d142",
  color: "#1e293b",
  borderRadius: "50%",
  marginRight: "6px",
  padding: "8px",
  transition: "all 0.2s ease",
  "&:hover": {
    background: "#aab921",
  },
}));

const CartImage = styled("img")({
  width: 60, 
  height: 60, 
  borderRadius: "12px",
  objectFit: "cover",
  border: "1px solid #e2e8f0",
  backgroundColor: "#fff",
  padding: "2px",
});

const DragHandle = () => (
  <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 1, width: "100%" }}>
    <Box sx={{ width: 40, height: 4, backgroundColor: "#cbd5e1", borderRadius: 4 }} />
  </Box>
);

/* ---------------- TYPES & HELPERS ---------------- */
type CategoryNode = { id: string; title: string; icon?: string; children?: CategoryNode[] };
type CategorySection = { categories: CategoryNode[] };
type CartItem = { productId: string; variantId: string; name: string; variantName: string; price: number; qty: number; image: string };

const reverseCategories = (items: CategoryNode[]): CategoryNode[] =>
  items.slice().reverse().map((item) => ({ ...item, children: item.children ? reverseCategories(item.children) : undefined }));

// Helper function to capitalize only the first letter and make the rest lowercase
const formatTitle = (title: string) => {
  if (!title) return "";
  return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
};

/* ---------------- CUSTOM MOBILE NAV ITEM ---------------- */
const MobileNavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) => (
  <Box
    onClick={onClick}
    sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 60, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
  >
    <Box sx={{ color: active ? "#c2d142" : "#64748b", mb: 0.5, transition: "color 0.2s" }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: "0.65rem", fontWeight: active ? 700 : 500, color: active ? "#fff" : "#64748b", fontFamily: primaryFont }}>
      {label}
    </Typography>
  </Box>
);

/* ---------------- RECURSIVE CATEGORY ---------------- */
const RenderCategories = ({ items, level = 0, openCategory, onToggle, onSelectCategory }: { items: CategoryNode[]; level?: number; openCategory: string | null; onToggle: (id: string) => void; onSelectCategory: (id: string) => void }) => (
  <>
    {items.map((cat) => {
      const isOpen = openCategory === cat.id;
      return (
        <Box key={cat.id}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { onToggle(cat.id); onSelectCategory(cat.id); }}
              sx={{
                pl: 2 + level * 2, py: 1, display: "flex", alignItems: "center", gap: 1.5, mx: 1, mb: 0.5,
                borderRadius: "12px",
                transition: "all 0.2s ease",
                border: "1px solid transparent",
                "&:hover": { backgroundColor: "#f1f5f9" },
                ...(isOpen && { backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" })
              }}
            >
              {cat.icon && <Box component="img" src={cat.icon} sx={{ width: level === 0 ? 24 : 20, height: level === 0 ? 24 : 20, borderRadius: "6px" }} />}
              <ListItemText 
                primary={formatTitle(cat.title)} 
                primaryTypographyProps={{ sx: { fontFamily: primaryFont, fontSize: level === 0 ? "0.9rem" : "0.8rem", fontWeight: level === 0 ? 600 : 500, color: "#1e293b" } }} 
              />
              {cat.children && (
                <Box sx={{ color: "#64748b", display: "flex", alignItems: "center" }}>
                  {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </Box>
              )}
            </ListItemButton>
          </ListItem>
          {cat.children && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <Box sx={{ borderLeft: "1px solid #e2e8f0", ml: 3.5, mt: 0.5, mb: 0.5 }}>
                <RenderCategories items={cat.children} level={level + 1} openCategory={openCategory} onToggle={onToggle} onSelectCategory={onSelectCategory} />
              </Box>
            </Collapse>
          )}
        </Box>
      );
    })}
  </>
);

/* ---------------- MAIN COMPONENT ---------------- */
export default function ModernAppHeader() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const [categoryDrawer, setCategoryDrawer] = useState(false);
  const [cartDrawer, setCartDrawer] = useState(false);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  const [scrolled, setScrolled] = useState(false);

  const hideHeaderContent = categoryDrawer || cartDrawer;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoUrl = "https://i.ibb.co/gMKsF5Fd/image-1.webp";
  const searchQuery = searchParams.get("q") || "";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set("q", val);
    else newParams.delete("q");
    setSearchParams(newParams);
  };

  const handleCategorySelect = (id: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("category", id);
    navigate(`/?${newParams.toString()}`);
    setCategoryDrawer(false); 
  };

  useEffect(() => {
    if (!API_HOST) return;
    axios.get(`${API_HOST}/Categorysection`).then((res) => {
      let all: CategoryNode[] = [];
      res.data?.forEach((sec: CategorySection) => {
        if (sec.categories) all = all.concat(sec.categories);
      });
      setCategories(reverseCategories(all));
    });
  }, []);

  useEffect(() => {
    const loadCart = () => { try { setCartItems(JSON.parse(localStorage.getItem("cartItems") || "[]")); } catch { setCartItems([]); } };
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    window.addEventListener("storage", loadCart);
    return () => { window.removeEventListener("cartUpdated", loadCart); window.removeEventListener("storage", loadCart); };
  }, []);

  const updateCart = (updated: CartItem[]) => {
    localStorage.setItem("cartItems", JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQty = (i: number) => { const c = [...cartItems]; c[i].qty++; updateCart(c); };
  const decreaseQty = (i: number) => { const c = [...cartItems]; c[i].qty > 1 ? c[i].qty-- : c.splice(i, 1); updateCart(c); };

  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  useEffect(() => {
    if (location.pathname === "/") setBottomNavValue(0);
    else if (location.pathname === "/login") setBottomNavValue(3);
  }, [location.pathname]);

  return (
    <>
      {/* ================= SUPER STYLIZED APP BAR ================= */}
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          backgroundColor: "transparent", 
          zIndex: theme.zIndex.appBar,
          pt: { xs: 0, md: scrolled ? 2 : 0 },
          px: { xs: 0, md: scrolled ? 4 : 0 },
          opacity: hideHeaderContent ? 0 : 1,
          visibility: hideHeaderContent ? "hidden" : "visible",
          transform: hideHeaderContent ? "translateY(-100%)" : "translateY(0)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          fontFamily: primaryFont,
        }}
      >
        <Box
          sx={{
            transition: "all 0.3s ease",
            overflow: "hidden",
            ...(scrolled
              ? {
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(12px)",
                  borderRadius: { xs: 0, md: "16px" },
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  border: { xs: "none", md: "1px solid #e2e8f0" },
                }
              : {
                  backgroundColor: "transparent",
                  borderRadius: 0,
                  boxShadow: "none",
                  border: "none",
                }),
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", py: { xs: 1, md: 1 }, px: { xs: 2, sm: 4, md: 4 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Box component="img" src={logoUrl} sx={{ height: { xs: 36, sm: 70 }, cursor: "pointer" }} onClick={() => { searchParams.delete("category"); setSearchParams(searchParams); navigate("/"); }} />
              {!isMobile && (
                <Button 
                  onClick={() => setCategoryDrawer(true)} 
                  startIcon={<GridViewOutlinedIcon fontSize="small" />} 
                  sx={{ color: "#fff", background: "#0f172a", fontFamily: primaryFont, fontWeight: 600, fontSize: "0.85rem", borderRadius: "8px", px: 2, py: 0.8, "&:hover": { background: "#1e293b" } }}
                >
                  Explore
                </Button>
              )}
            </Box>

            {!isMobile && (
              <SearchContainer>
                <StyledInput placeholder="Search everything you need..." value={searchQuery} onChange={handleSearchChange} />
                <SearchButton><SearchIcon fontSize="small" /></SearchButton>
              </SearchContainer>
            )}

            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button onClick={() => navigate("/login")} startIcon={<PersonOutlineIcon />} sx={{ color: "#475569", fontFamily: primaryFont, fontWeight: 600, fontSize: "0.9rem", borderRadius: "8px" }}>Sign In</Button>
                <IconButton 
                  onClick={() => setCartDrawer(true)} 
                  sx={{ backgroundColor: "#f1f5f9", p: 1, borderRadius: "12px", "&:hover": { backgroundColor: "#e2e8f0" } }}
                >
                  <Badge badgeContent={totalQty} sx={{ "& .MuiBadge-badge": { backgroundColor: "#c2d142", color: "#1e293b", fontWeight: "bold", fontFamily: primaryFont, fontSize: "0.75rem", minWidth: 20, height: 20 } }}>
                    <ShoppingBagOutlinedIcon sx={{ color: "#0f172a", fontSize: "1.3rem" }} />
                  </Badge>
                </IconButton>
              </Box>
            )}
          </Toolbar>
          
          {isMobile && (
            <Box sx={{ pb: 1.5 }}>
              <SearchContainer>
                <StyledInput placeholder="What are you looking for?" value={searchQuery} onChange={handleSearchChange} />
                <SearchButton><SearchIcon fontSize="small" /></SearchButton>
              </SearchContainer>
            </Box>
          )}
        </Box>
      </AppBar>

      {/* ================= HYPER-MODERN DARK MOBILE NAV ================= */}
      {isMobile && (
        <Box 
          sx={{ 
            position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 1000, 
            backgroundColor: "#0f172a",
            borderRadius: "24px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", 
            display: "flex", justifyContent: "space-between", alignItems: "center", 
            px: 2, py: 1
          }}
        >
          <MobileNavItem icon={<HomeOutlinedIcon />} label="Home" active={bottomNavValue === 0} onClick={() => { setBottomNavValue(0); navigate("/"); }} />
          <MobileNavItem icon={<GridViewOutlinedIcon />} label="Menu" active={bottomNavValue === 1} onClick={() => { setBottomNavValue(1); setCategoryDrawer(true); }} />
          
          <MobileNavItem 
            icon={
              <Badge badgeContent={totalQty} sx={{ "& .MuiBadge-badge": { backgroundColor: "#c2d142", color: "#0f172a", fontWeight: "bold", fontFamily: primaryFont, fontSize: "0.7rem", minWidth: 18, height: 18 } }}>
                <ShoppingBagOutlinedIcon />
              </Badge>
            } 
            label="Cart" 
            active={bottomNavValue === 2 || cartDrawer} 
            onClick={() => { setBottomNavValue(2); setCartDrawer(true); }} 
          />
          
          <MobileNavItem icon={<PersonOutlineIcon />} label="Profile" active={bottomNavValue === 3} onClick={() => { setBottomNavValue(3); navigate("/login"); }} />
        </Box>
      )}

      {/* ================= CATEGORIES FLOATING DRAWER (SIMPLIFIED) ================= */}
      <SwipeableDrawer 
        anchor={isMobile ? "bottom" : "left"} open={categoryDrawer} onClose={() => setCategoryDrawer(false)} onOpen={() => setCategoryDrawer(true)} disableSwipeToOpen={!isMobile} disableDiscovery={iOS} disableBackdropTransition={!iOS}
        PaperProps={{ 
          sx: { 
            fontFamily: primaryFont,
            backgroundColor: "#ffffff",
            ...(isMobile ? { 
              borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "85vh",
              boxShadow: "0px -4px 20px rgba(0,0,0,0.08)",
            } : {
              width: 320, m: 2, height: "calc(100vh - 32px)", borderRadius: "16px",
              boxShadow: "4px 0 24px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0"
            }) 
          } 
        }}
      >
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
          {isMobile && <DragHandle />}
          <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, fontFamily: primaryFont, color: "#0f172a" }}>
              Explore
            </Typography>
            <IconButton size="small" onClick={() => setCategoryDrawer(false)} sx={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}><CloseIcon fontSize="small" /></IconButton>
          </Box>
          <List sx={{ flex: 1, overflowY: "auto", pt: 1, pb: isMobile ? 10 : 2, px: 1, "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#cbd5e1", borderRadius: "4px" } }}>
            <RenderCategories items={categories} openCategory={openCategory} onToggle={(id) => setOpenCategory((prev) => (prev === id ? null : id))} onSelectCategory={handleCategorySelect} />
          </List>
        </Box>
      </SwipeableDrawer>

      {/* ================= CART DRAWER (SIMPLIFIED) ================= */}
      <SwipeableDrawer 
        anchor={isMobile ? "bottom" : "right"} open={cartDrawer} onClose={() => setCartDrawer(false)} onOpen={() => setCartDrawer(true)} disableSwipeToOpen={!isMobile} disableDiscovery={iOS} disableBackdropTransition={!iOS}
        PaperProps={{ 
          sx: { 
            fontFamily: primaryFont,
            backgroundColor: "#ffffff",
            ...(isMobile ? { 
              borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "85vh",
              boxShadow: "0px -4px 20px rgba(0,0,0,0.08)",
            } : {
              width: 380, m: 2, height: "calc(100vh - 32px)", borderRadius: "16px",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0"
            }) 
          } 
        }}
      >
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: primaryFont }}>
          {isMobile && <DragHandle />}
          <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, fontFamily: primaryFont, color: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}>
              Your Bag <Box component="span" sx={{ background: "#f1f5f9", px: 1.5, py: 0.2, borderRadius: "8px", fontSize: 13, color: "#475569", fontWeight: 600, fontFamily: primaryFont }}>{totalQty}</Box>
            </Typography>
            <IconButton size="small" onClick={() => setCartDrawer(false)} sx={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}><CloseIcon fontSize="small" /></IconButton>
          </Box>
          
          <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 3 }, "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#cbd5e1", borderRadius: "4px" } }}>
            {cartItems.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 2, color: "#94a3b8" }}>
                <Box sx={{ width: 80, height: 80, borderRadius: "24px", background: "#f8fafc", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AutoAwesomeOutlinedIcon sx={{ fontSize: 32, color: "#94a3b8" }} />
                </Box>
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 600, fontSize: 16, color: "#1e293b" }}>It's empty here!</Typography>
                <Typography sx={{ fontFamily: primaryFont, fontSize: 13, textAlign: "center", px: 2, color: "#64748b" }}>Discover amazing products and add them to your bag.</Typography>
                <Button variant="outlined" sx={{ mt: 1, borderRadius: "8px", px: 3, py: 1, borderColor: "#e2e8f0", color: "#0f172a", textTransform: "none", fontSize: "0.9rem", fontFamily: primaryFont, fontWeight: 600 }} onClick={() => setCartDrawer(false)}>Start Exploring</Button>
              </Box>
            ) : (
              cartItems.map((item, i) => (
                <Box key={i} sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", backgroundColor: "#fff", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <CartImage src={item.image} alt={item.name} />
                  <Box flex={1}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.2, lineHeight: 1.2, color: "#0f172a", fontFamily: primaryFont }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: 12, mb: 1.5, color: "#64748b", fontWeight: 500, fontFamily: primaryFont }}>{item.variantName}</Typography>
                    <Box display="flex" alignItems="center" gap={1.5} sx={{ backgroundColor: "#f8fafc", width: "fit-content", borderRadius: "8px", p: "2px", border: "1px solid #f1f5f9" }}>
                      <IconButton size="small" onClick={() => decreaseQty(i)} sx={{ p: 0.5, color: "#475569" }}><Typography fontSize={14} fontWeight="bold" fontFamily={primaryFont}>−</Typography></IconButton>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, width: 16, textAlign: "center", color: "#0f172a", fontFamily: primaryFont }}>{item.qty}</Typography>
                      <IconButton size="small" onClick={() => increaseQty(i)} sx={{ p: 0.5, color: "#475569" }}><Typography fontSize={14} fontWeight="bold" fontFamily={primaryFont}>+</Typography></IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <Typography color="#0f172a" sx={{ fontSize: 15, fontWeight: 700, fontFamily: primaryFont }}>LKR {(item.price * item.qty).toLocaleString()}</Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>
          
          {cartItems.length > 0 && (
            <Box sx={{ p: 3, pb: isMobile ? 10 : 3, borderTop: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography sx={{ fontWeight: 600, color: "#64748b", fontSize: 14, fontFamily: primaryFont }}>Estimated Total</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#0f172a", fontFamily: primaryFont }}>LKR {totalPrice.toLocaleString()}</Typography>
              </Box>
              <Button fullWidth sx={{ background: "#c2d142", color: "#0f172a", py: 1.5, borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700, textTransform: "none", fontFamily: primaryFont, "&:hover": { background: "#aab921" }, transition: "all 0.2s ease" }} onClick={() => { setCartDrawer(false); navigate("/checkout"); }}>
                Secure Checkout
              </Button>
            </Box>
          )}
        </Box>
      </SwipeableDrawer>
    </>
  );
}