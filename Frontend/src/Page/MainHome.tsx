import React, { useCallback, useState } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Banner from "./Banner";
import Product from "./Product";

type CategoryItemProps = {
  title: string;
  active?: boolean;
  onSelect?: (title: string) => void;
};

const CategoryItem: React.FC<CategoryItemProps> = React.memo(
  ({ title, active, onSelect }) => {
    const handleClick = () => onSelect?.(title);
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect?.(title);
      }
    };

    return (
      <Box
        tabIndex={0}
        role="button"
        aria-pressed={active ? "true" : "false"}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        sx={{
          minWidth: 110,
          px: 2,
          py: 1,
          borderRadius: 2,
          background: active ? "primary.main" : "#fff",
          color: active ? "#fff" : "text.primary",
          boxShadow: active
            ? "0 6px 18px rgba(0,0,0,0.08)"
            : "0 1px 6px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 400, // NORMAL FONT
          fontSize: 13,
          mr: 1.25,
          cursor: "pointer",
          whiteSpace: "nowrap",
          outline: "none",
        }}
      >
        {title}
      </Box>
    );
  }
);
CategoryItem.displayName = "CategoryItem";

const MainHome: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [selectedCategory, setSelectedCategory] =
    useState<string>("Fruits");

  const categories = [
    "Fruits",
    "Vegetables",
    "Dairy",
    "Bakery",
    "Snacks",
    "Beverages",
    "Frozen",
    "Household",
    "Personal Care",
  ];

  const handleSelectCategory = useCallback((title: string) => {
    setSelectedCategory(title);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        gap: 2,
        p: 1,
        boxSizing: "border-box",
        flexDirection: isDesktop ? "row" : "column",
        bgcolor: "#f4f6f8",
        overflow: "hidden",
      }}
    >
      {/* MOBILE TOP BAR (NO SEARCH BAR) */}
      {!isDesktop && (
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{ mb: 1 }}
        >
          <Toolbar sx={{ px: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              Shop
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* LEFT CATEGORY COLUMN (DESKTOP ONLY - NO SEARCH BAR) */}
      {isDesktop && (
        <Box
          sx={{
            width: 260,
            height: "100%",
            background: "#fff",
            borderRadius: 2,
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            p: 2,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: 16 , fontFamily: "'Montserrat', sans-serif"}}>
            Categories
          </Typography>

          {/* CATEGORY LIST */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              overflowY: "auto",
              pr: 1,
            }}
          >
            {categories.map((c, i) => (
              <Box
                key={c}
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.5,
                  cursor: "pointer",
                  "&:hover": { background: "#f5f5f5" },
                  fontWeight: 400, // NORMAL FONT
                  display: "flex",
                  justifyContent: "space-between",
                }}
                onClick={() => handleSelectCategory(c)}
              >
                <span>{c}</span>
                <span style={{ opacity: 0.6, fontSize: 13 }}>
                  ({10 + i})
                </span>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* RIGHT MAIN SECTION */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* BANNER */}
        <Box
          sx={{
            width: "100%",
            height: isDesktop ? 220 : 170,
            flexShrink: 0,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            background: "#fff",
          }}
        >
          <Banner />
        </Box>

        {/* MOBILE CATEGORY STRIP (NO MENU ICONS) */}
        {!isDesktop && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 0.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                overflowX: "auto",
                px: 0.5,
                py: 0.25,
                "&::-webkit-scrollbar": { display: "none" },
                flex: 1,
              }}
            >
              {categories.map((c) => (
                <CategoryItem
                  key={c}
                  title={c}
                  active={c === selectedCategory}
                  onSelect={handleSelectCategory}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* MAIN CONTENT */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 8 },
            "&::-webkit-scrollbar-thumb": {
              background: "#e0e0e0",
              borderRadius: 8,
            },
          }}
        >
          <Product selectedCategory={selectedCategory} />
        </Box>
      </Box>
    </Box>
  );
};

export default MainHome;
