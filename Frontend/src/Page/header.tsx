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
} from "@mui/material";
import { styled } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

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

/* ---------------- RECURSIVE CATEGORY LIST ---------------- */

const RenderCategories = ({
  items,
  level = 0,
}: {
  items: CategoryNode[];
  level?: number;
}) => (
  <>
    {items.map((cat) => (
      <Box key={cat.id}>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              pl: 2 + level * 2,
              py: 1.2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* ICON */}
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
                  padding: "3px",
                }}
              />
            )}

            {/* TITLE */}
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
          </ListItemButton>
        </ListItem>

        {/* CHILDREN */}
        {cat.children && cat.children.length > 0 && (
          <RenderCategories items={cat.children} level={level + 1} />
        )}
      </Box>
    ))}
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

  const logoUrl =
    "https://i.ibb.co/JRPnDfqQ/cmh6a26eo000h04jmaveg5yzp-removebg-preview.png";

  /* ---------------- FETCH CATEGORIES ---------------- */

  useEffect(() => {
    if (!API_HOST) return;

    axios
      .get(`${API_HOST}/Categorysection`)
      .then((res) => {
        setCategories(res.data?.categories || []);
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
      });
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
                <Typography
                  fontWeight={600}
                  fontSize={16}
                  sx={{ fontFamily: '"Montserrat", sans-serif' }}
                >
                  Categories
                </Typography>
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
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: 280,
            py: 2,
            fontFamily: '"Montserrat", sans-serif',
          }}
        >
          {/* LOGO */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box component="img" src={logoUrl} sx={{ height: 60 }} />
          </Box>

          {/* CATEGORY LIST */}
          <List>
            <RenderCategories items={categories} />
          </List>

          <Divider />

          <Typography
            sx={{
              px: 2,
              py: 1.5,
              color: "#777",
              fontSize: 14,
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            View all categories
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
