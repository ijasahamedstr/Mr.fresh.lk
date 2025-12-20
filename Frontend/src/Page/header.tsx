import { useState, useEffect } from "react";
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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Collapse,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

/* ---------------- ENV ---------------- */
const API_HOST = import.meta.env.VITE_API_HOST as string | undefined;
const font = '"Montserrat", sans-serif';

/* ---------------- STYLED ---------------- */
const SearchContainer = styled("div")(() => ({
  position: "relative",
  flexGrow: 1,
  borderRadius: "50px",
  border: "1px solid #ccc",
  backgroundColor: "#E7E5E4",
  display: "flex",
  alignItems: "center",
  maxWidth: 700,
  margin: "0 40px",
}));

const StyledInput = styled(InputBase)(() => ({
  flex: 1,
  padding: "10px 16px",
  fontSize: "1rem",
  fontFamily: font,
}));

const SearchButton = styled(IconButton)(() => ({
  backgroundColor: "#c2d142",
  color: "#fff",
  borderRadius: "50%",
  marginRight: "6px",
}));

/* ---------------- TYPES ---------------- */
type CategoryNode = {
  id: string;
  title: string;
  icon?: string;
  children?: CategoryNode[];
};

type CategorySection = {
  categories: CategoryNode[];
};

type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  qty: number;
  image: string;
};

/* ---------------- HELPERS ---------------- */
const reverseCategories = (items: CategoryNode[]): CategoryNode[] =>
  items
    .slice()
    .reverse()
    .map((item) => ({
      ...item,
      children: item.children ? reverseCategories(item.children) : undefined,
    }));

/* ---------------- RECURSIVE CATEGORY ---------------- */
const RenderCategories = ({
  items,
  level = 0,
  openCategory,
  onClick,
}: {
  items: CategoryNode[];
  level?: number;
  openCategory: string | null;
  onClick: (cat: CategoryNode) => void;
}) => (
  <>
    {items.map((cat) => {
      const isOpen = openCategory === cat.id;

      return (
        <Box key={cat.id}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onClick(cat)}
              sx={{
                pl: 2 + level * 2,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              {cat.icon && (
                <Box
                  component="img"
                  src={cat.icon}
                  sx={{
                    width: level === 0 ? 26 : 22,
                    height: level === 0 ? 26 : 22,
                    borderRadius: "50%",
                    background: "#f4f6f8",
                    p: "3px",
                  }}
                />
              )}

              <ListItemText
                primary={cat.title}
                primaryTypographyProps={{
                  sx: {
                    fontFamily: font,
                    fontSize: level === 0 ? 16 : 14,
                    fontWeight: level === 0 ? 600 : 400,
                  },
                }}
              />

              {cat.children &&
                (isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
            </ListItemButton>
          </ListItem>

          {cat.children && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <RenderCategories
                items={cat.children}
                level={level + 1}
                openCategory={openCategory}
                onClick={onClick}
              />
            </Collapse>
          )}
        </Box>
      );
    })}
  </>
);

/* ---------------- MAIN COMPONENT ---------------- */
export default function EtsyStyleHeader() {
  const theme = useTheme();
  const navigate = useNavigate();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const showSearchAndRight = !(isMobile || isTablet);

  const [categoryDrawer, setCategoryDrawer] = useState(false);
  const [cartDrawer, setCartDrawer] = useState(false);

  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const logoUrl =
    "https://i.ibb.co/JRPnDfqQ/cmh6a26eo000h04jmaveg5yzp-removebg-preview.png";

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    if (!API_HOST) return;

    axios.get(`${API_HOST}/Categorysection`).then((res) => {
      let all: CategoryNode[] = [];
      res.data?.forEach((sec: CategorySection) => {
        if (sec.categories) all = all.concat(sec.categories);
      });

      const lifo = reverseCategories(all);
      setCategories(lifo);
      if (lifo.length) setOpenCategory(lifo[0].id);
    });
  }, []);

  /* ---------------- LOAD CART ---------------- */
  useEffect(() => {
    const loadCart = () =>
      setCartItems(JSON.parse(localStorage.getItem("cartItems") || "[]"));

    loadCart();
    window.addEventListener("cartUpdated", loadCart);

    return () => window.removeEventListener("cartUpdated", loadCart);
  }, []);

  /* ---------------- CART HELPERS ---------------- */
  const updateCart = (updated: CartItem[]) => {
    localStorage.setItem("cartItems", JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQty = (i: number) => {
    const c = [...cartItems];
    c[i].qty++;
    updateCart(c);
  };

  const decreaseQty = (i: number) => {
    const c = [...cartItems];
    c[i].qty > 1 ? c[i].qty-- : c.splice(i, 1);
    updateCart(c);
  };

  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <>
      {/* ================= HEADER ================= */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#F8FAFC",
          color: "#000",
          px: { xs: 3, sm: 6, md: 10 },
          mt: "55px",
          fontFamily: font,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box component="img" src={logoUrl} sx={{ height: 50 }} />

            {showSearchAndRight && (
              <Box
                onClick={() => setCategoryDrawer(true)}
                sx={{ display: "flex", gap: 1, cursor: "pointer" }}
              >
                <MenuIcon fontSize="small" />
                <Typography fontWeight={600} sx={{ fontFamily: font }}>
                  Categories
                </Typography>
              </Box>
            )}
          </Box>

          {showSearchAndRight && (
            <SearchContainer>
              <StyledInput placeholder="Search for anything" />
              <SearchButton>
                <SearchIcon />
              </SearchButton>
            </SearchContainer>
          )}

          <IconButton onClick={() => setCartDrawer(true)}>
            <ShoppingBagOutlinedIcon />
            {totalQty > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  bgcolor: "#000",
                  color: "#fff",
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {totalQty}
              </Box>
            )}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ================= CATEGORIES DRAWER ================= */}
      <Drawer
        anchor="left"
        open={categoryDrawer}
        onClose={() => setCategoryDrawer(false)}
      >
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <Box component="img" src={logoUrl} sx={{ height: 45 }} />
          </Box>

          <Divider />

          <List disablePadding>
            <RenderCategories
              items={categories}
              openCategory={openCategory}
              onClick={(cat) =>
                setOpenCategory((p) => (p === cat.id ? null : cat.id))
              }
            />
          </List>
        </Box>
      </Drawer>

      {/* ================= CART DRAWER ================= */}
      <Drawer
        anchor="right"
        open={cartDrawer}
        onClose={() => setCartDrawer(false)}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Typography fontSize={18} fontWeight={600} sx={{ fontFamily: font }}>
            Your Bag
          </Typography>

          <Divider sx={{ my: 2 }} />

          {cartItems.length === 0 ? (
            <Typography color="#777" sx={{fontFamily: '"Montserrat", sans-serif',}}>Your cart is empty</Typography>
          ) : (
            <>
              {cartItems.map((item, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", gap: 1.5, mb: 2 }}
                >
                  <Box
                    component="img"
                    src={item.image}
                    sx={{ width: 50, height: 50, borderRadius: 1, fontFamily: '"Montserrat", sans-serif', }}
                  />

                  <Box flex={1}>
                    <Typography fontSize={13} fontWeight={600} sx={{fontFamily: '"Montserrat", sans-serif',}}>
                      {item.name}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} sx={{fontFamily: '"Montserrat", sans-serif',}}>
                      <Button size="small" onClick={() => decreaseQty(i)}>
                        −
                      </Button>
                      <Typography fontSize={12} sx={{fontFamily: '"Montserrat", sans-serif',}}>{item.qty}</Typography>
                      <Button size="small" onClick={() => increaseQty(i)}>
                        +
                      </Button>
                    </Box>
                  </Box>

                  <Typography fontSize={12} fontWeight={600} sx={{fontFamily: '"Montserrat", sans-serif',}}>
                    LKR {(item.price * item.qty).toLocaleString()}
                  </Typography>
                </Box>
              ))}

              <Divider />

              <Box display="flex" justifyContent="space-between" my={2}>
                <Typography fontWeight={600} sx={{fontFamily: '"Montserrat", sans-serif',}}>Total</Typography>
                <Typography fontWeight={700} sx={{fontFamily: '"Montserrat", sans-serif',}}>
                  LKR {totalPrice.toLocaleString()}
                </Typography>
              </Box>

              <Button
                fullWidth
                sx={{
                  bgcolor: "#000",
                  color: "#fff",
                  fontFamily: '"Montserrat", sans-serif',
                  py: 1.3,
                  "&:hover": { bgcolor: "#333" },
                }}
                onClick={() => {
                  setCartDrawer(false);
                  navigate("/checkout");
                }}
              >
                Proceed to Checkout
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
