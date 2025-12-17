import { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

/* ---------------- ENV ---------------- */
const API_HOST = import.meta.env.VITE_API_HOST as string | undefined;

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
  fontFamily: '"Montserrat", sans-serif',
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
                    objectFit: "cover",
                    background: "#f4f6f8",
                    p: "3px",
                  }}
                />
              )}

              <ListItemText
                primary={cat.title}
                primaryTypographyProps={{
                  sx: {
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: level === 0 ? 16 : 14,
                    fontWeight: level === 0 ? 600 : 400,
                  },
                }}
              />

              {cat.children && (
                isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
              )}
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const showSearchAndRight = !(isMobile || isTablet);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const logoUrl =
    "https://i.ibb.co/JRPnDfqQ/cmh6a26eo000h04jmaveg5yzp-removebg-preview.png";

  /* ---------------- FETCH CATEGORIES ---------------- */

  useEffect(() => {
    if (!API_HOST) return;

    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_HOST}/Categorysection`);

        let all: CategoryNode[] = [];

        if (Array.isArray(res.data)) {
          res.data.forEach((section: CategorySection) => {
            if (Array.isArray(section.categories)) {
              all = all.concat(section.categories);
            }
          });
        }

        setCategories(all);

        if (all.length) {
          setSelectedCategory(all[0].title);
          setOpenCategory(all[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    fetchCategories();
  }, []);

  /* ---------------- HANDLER ---------------- */

  const handleCategoryClick = useCallback((cat: CategoryNode) => {
    setSelectedCategory(cat.title);
    setOpenCategory((prev) => (prev === cat.id ? null : cat.id));
  }, []);

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#F8FAFC",
          color: "#000",
          px: { xs: 3, sm: 6, md: 10 },
          mt: "55px",
          fontFamily: '"Montserrat", sans-serif',
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
            py: 1,
          }}
        >
          {/* LOGO */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box component="img" src={logoUrl} sx={{ height: 50 }} />

            {showSearchAndRight && (
              <Box
                onClick={() => setDrawerOpen(true)}
                sx={{
                  display: "flex",
                  gap: 1,
                  cursor: "pointer",
                  alignItems: "center",
                }}
              >
                <MenuIcon fontSize="small" />
                <Typography fontWeight={600} sx={{fontFamily: '"Montserrat", sans-serif'}}>Categories</Typography>
              </Box>
            )}
          </Box>

          {/* SEARCH */}
          {showSearchAndRight && (
            <SearchContainer>
              <StyledInput placeholder="Search for anything" />
              <SearchButton>
                <SearchIcon />
              </SearchButton>
            </SearchContainer>
          )}

          {/* CART / MENU */}
          <IconButton onClick={() => setDrawerOpen(true)}>
            {showSearchAndRight ? (
              <ShoppingBagOutlinedIcon />
            ) : (
              <MenuIcon />
            )}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, py: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box component="img" src={logoUrl} sx={{ height: 60 }} />
          </Box>

          <List>
            <RenderCategories
              items={categories}
              openCategory={openCategory}
              onClick={handleCategoryClick}
            />
          </List>

          <Divider />

          <Typography sx={{ px: 2, py: 1.5, color: "#777", fontSize: 14,fontFamily: '"Montserrat", sans-serif' }}>
            Selected: {selectedCategory}
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}