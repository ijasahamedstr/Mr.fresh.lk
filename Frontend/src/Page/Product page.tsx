import React from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";

import Products from "./Product"; // <-- Updated import name to match the file/component

/* ---------------- MAIN COMPONENT ---------------- */

const Productpage: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  /* ---------------- RENDER ---------------- */

  return (
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: "column", 
        }}
      >
        {/* MOBILE TOP BAR (Specific to Product Page) */}
        {!isDesktop && (
          <AppBar
            position="static"
            color="transparent"
            elevation={0}
            sx={{ flexShrink: 0, fontFamily: '"Montserrat", sans-serif', color: "#000" }}
          >
            <Toolbar sx={{ px: 0 }}>
              <Typography
                fontWeight={600}
                fontSize={18}
                sx={{ fontFamily: '"Montserrat", sans-serif', color: "#000" }}
              >
                Shop
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* MAIN PRODUCT AREA */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 2,
            borderRadius: 2,
            background: "#fff",
            fontFamily: '"Montserrat", sans-serif',
            color: "#000",
          }}
        >
          <Products />
        </Box>
      </Container>
  );
};

export default Productpage;