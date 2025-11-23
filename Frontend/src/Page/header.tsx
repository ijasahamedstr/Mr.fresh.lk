import { useState } from "react";
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
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import HomeIcon from "@mui/icons-material/Home";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

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
  fontSize: "0.95rem",
  color: "#333",
  fontFamily: '"Montserrat", sans-serif',
}));

const SearchButton = styled(IconButton)(() => ({
  backgroundColor: "#c2d142",
  color: "#fff",
  borderRadius: "50%",
  marginRight: "6px",
  "&:hover": {
    backgroundColor: "#b0c635",
  },
}));

export default function EtsyStyleHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const showSearchAndRight = !(isMobile || isTablet);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState("home");

  const categories = [
    "Home & Living",
    "Jewelry & Accessories",
    "Clothing & Shoes",
    "Wedding & Party",
    "Toys & Entertainment",
    "Art & Collectibles",
    "Craft Supplies",
    "Vintage",
  ];

  const logoUrl =
    "https://i.ibb.co/JRPnDfqQ/cmh6a26eo000h04jmaveg5yzp-removebg-preview.png";

  const isDarkMode = theme.palette.mode === "dark";
  const bgColor = isDarkMode ? "#0f172a" : "#ffffff";
  const iconColor = isDarkMode ? "#cbd5e1" : "#555";

  // Updated handler to open drawer when clicking "Categories"
  const handleBottomNavClick = (value: string) => {
    setBottomNavValue(value);
    if (value === "categories") {
      setDrawerOpen(true);
    }
  };

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
          {/* Left Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              component="img"
              src={logoUrl}
              alt="Logo"
              sx={{
                height: "100%",
                width: "auto",
                cursor: "pointer",
                objectFit: "contain",
              }}
            />

            {showSearchAndRight && (
              <Box
                onClick={() => setDrawerOpen(true)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.9rem",
                  color: "#555",
                  cursor: "pointer",
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                <MenuIcon fontSize="small" />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, fontFamily: '"Montserrat", sans-serif' }}
                >
                  Categories
                </Typography>
              </Box>
            )}
          </Box>

          {/* Search */}
          {showSearchAndRight && (
            <SearchContainer>
              <StyledInput
                placeholder="Search for anything"
                inputProps={{ "aria-label": "search" }}
              />
              <SearchButton>
                <SearchIcon />
              </SearchButton>
            </SearchContainer>
          )}

          {/* Right icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {showSearchAndRight ? (
              <IconButton
                sx={{
                  bgcolor: "#E7E5E4",
                  borderRadius: "50%",
                  p: 1,
                  "&:hover": { bgcolor: "#dcdcdc" },
                }}
              >
                <ShoppingCartOutlinedIcon sx={{ color: "#555" }} />
              </IconButton>
            ) : (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#555" }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{ width: 260, fontFamily: '"Montserrat", sans-serif', py: 2 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box
              component="img"
              src={logoUrl}
              alt="Logo"
              sx={{ height: 60, width: "auto", objectFit: "contain" }}
            />
          </Box>

          <List>
            {categories.map((text) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{
                      sx: { fontFamily: '"Montserrat", sans-serif', fontWeight: 500 },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />
          <Typography
            variant="body2"
            sx={{ px: 2, py: 1, color: "#777", fontFamily: '"Montserrat", sans-serif' }}
          >
            View all categories
          </Typography>
        </Box>
      </Drawer>

      {/* MOBILE / TABLET BOTTOM NAV */}
      {(isMobile || isTablet) && (
        <Paper
          elevation={10}
          sx={{
            position: "fixed",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: "95%",
            maxWidth: 500,
            bgcolor: bgColor,
            borderRadius: 2,
            p: 1.3,
          }}
        >
          <BottomNavigation
            showLabels
            value={bottomNavValue}
            onChange={(_, newValue) => handleBottomNavClick(newValue)}
            sx={{
              bgcolor: "transparent",
              height: 70,
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            {[
              { label: "Home", value: "home", icon: <HomeIcon /> },
              { label: "Categories", value: "categories", icon: <MenuIcon /> },
              { label: "Cart", value: "addcard", icon: <ShoppingCartOutlinedIcon /> },
              { label: "Chat", value: "chat", icon: <ChatBubbleOutlineIcon /> },
            ].map((item) => (
              <BottomNavigationAction
                key={item.value}
                value={item.value}
                label={item.label}
                icon={
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "50%",
                      bgcolor: bottomNavValue === item.value ? "#000" : "transparent",
                      color: bottomNavValue === item.value ? "#fff" : iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        transform: "scale(1.15)",
                        bgcolor:
                          bottomNavValue === item.value
                            ? "#000"
                            : "rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                }
                sx={{
                  "& .MuiBottomNavigationAction-label": {
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: "0.7rem",
                    marginTop: "4px",
                    color: bottomNavValue === item.value ? "#000" : "#777",
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </>
  );
}
