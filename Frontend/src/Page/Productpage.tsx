import React, { useState } from "react";

import {
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";

import Categories from "./Categories";
import Product from "./Product";

/* ---------------- MAIN COMPONENT ---------------- */

const Productpage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(
    theme.breakpoints.up("md")
  );

  /*
   * Empty string means no category is selected.
   *
   * When it is empty:
   * - Today's Special Offers are visible
   * - Popular Products are visible
   * - All products are visible
   *
   * When category ID exists:
   * - Special and popular sections are hidden
   * - Selected category products are shown
   */
  useState<string>("");

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: "column",
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {/* MOBILE TOP BAR */}

      {!isDesktop && (
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            flexShrink: 0,
            fontFamily: '"Montserrat", sans-serif',
            color: "#000",
          }}
        >
          <Toolbar sx={{ px: 0 }}>
            <Typography
              fontWeight={600}
              fontSize={18}
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                color: "#000",
              }}
            >
              Shop
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* CATEGORY SLIDER */}

      <Categories />

      {/* PRODUCT AREA */}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: { xs: 1, sm: 2 },
          borderRadius: 2,
          background: "#ffffff",
          fontFamily: '"Montserrat", sans-serif',
          color: "#000000",
        }}
      >
        <Product />
      </Box>
    </Container>
  );
};

export default Productpage;