import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import { 
  Facebook, 
  Instagram, 
  Email, 
  Phone, 
  WhatsApp,
  LinkedIn,
  YouTube
} from "@mui/icons-material";

const Footer: React.FC = () => {
  const primaryFont = '"Montserrat", sans-serif';
  const brandBlue = "#0a5397"; 

  const socialLinks = [
    { icon: <Phone fontSize="small" />, link: "tel:+94760959385", color: "#4caf50" },
    { icon: <WhatsApp fontSize="small" />, link: "https://wa.me/94760959385", color: "#25D366" },
    { icon: <Email fontSize="small" />, link: "mailto:info@brainiacs.edu.lk", color: "#EA4335" },
    { icon: <Facebook fontSize="small" />, link: "https://www.facebook.com/profile.php?id=61564872388676", color: "#1877F2" },
    { icon: <Instagram fontSize="small" />, link: "https://www.instagram.com/brainiacs_campus", color: "#E4405F" },
    { icon: <LinkedIn fontSize="small" />, link: "https://www.linkedin.com/company/brainiacs-campus/?lipi=urn%3Ali%3Apage%3Ad_flagship3_search_srp_all%3BQiHcjGfBQU6Bs6h05dssPA%3D%3D", color: "#0A66C2" },
    { icon: <YouTube fontSize="small" />, link: "https://www.youtube.com/@BrainiacsCampus", color: "#FF0000" },
  ];

  return (
    <Box component="footer" sx={{ fontFamily: primaryFont }}>
      {/* Main Footer Section */}
      <Box
        sx={{
          backgroundColor: "#e1eeff",
          backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(225,238,255,1) 100%)",
          color: "#000000",
          py: { xs: 8, md: 10 },
          px: { xs: 2, sm: 4 },
          position: "relative",
          "&::before": { // Aesthetic top border line
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, transparent, ${brandBlue}, transparent)`,
          }
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", md: "flex-start" },
              gap: 6,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            {/* Logo & Social Icons */}
            <Box
              sx={{
                flexBasis: { xs: "100%", md: "30%" },
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", md: "flex-start" },
                gap: 3,
              }}
            >
              <Box
                component="img"
                src="https://i.ibb.co/gMKsF5Fd/image-1.webp"
                alt="Brainiacs Campus Logo"
                sx={{
                  width: 180,
                  height: "auto",
                  mb: 1,
                  filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.05))",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.02)" }
                }}
              />
              
              <Typography
                variant="body2"
                sx={{ 
                  fontWeight: 700, 
                  fontSize: "0.75rem", 
                  textTransform: "uppercase", 
                  letterSpacing: 2,
                  fontFamily: primaryFont,
                  color: brandBlue,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -5,
                    left: { xs: "50%", md: "0" },
                    transform: { xs: "translateX(-50%)", md: "none" },
                    width: "40px",
                    height: "2px",
                    backgroundColor: brandBlue,
                    opacity: 0.3
                  }
                }}
              >
                Connect with us
              </Typography>

              {/* Reduced size for icons and spacing */}
              <Stack 
                direction="row" 
                spacing={{ xs: 0.5, sm: 1 }} 
                sx={{ justifyContent: { xs: "center", md: "flex-start" } }}
              >
                {socialLinks.map((item, index) => (
                  <IconButton
                    key={index}
                    href={item.link}
                    target="_blank"
                    sx={{
                      color: "#333",
                      backgroundColor: "rgba(255,255,255,0.6)",
                      backdropFilter: "blur(4px)",
                      borderRadius: { xs: "8px", sm: "12px" }, // Adjusted border radius for smaller icons
                      width: { xs: 28, sm: 32 }, // Distinctly smaller icon diameters
                      height: { xs: 28, sm: 32 },
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      border: "1px solid rgba(255,255,255,0.8)",
                      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      "&:hover": {
                        backgroundColor: item.color,
                        color: "#fff",
                        borderColor: item.color,
                        transform: "translateY(-8px) rotate(8deg)",
                        boxShadow: `0 15px 30px ${item.color}44`,
                      },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: { xs: "none", md: "block" },
                borderColor: "rgba(0, 0, 0, 0.08)",
              }}
            />

            {/* Address Section */}
            <Box sx={{ flexBasis: { xs: "100%", md: "25%" } }}>
              <Typography
                variant="h6"
                sx={{ 
                    mb: 3, 
                    fontSize: "0.9rem", 
                    fontWeight: 800, 
                    fontFamily: primaryFont,
                    color: brandBlue,
                    letterSpacing: 1
                }}
              >
                OFFICE LOCATION
              </Typography>
              <Typography
                variant="body2"
                sx={{ lineHeight: 2, color: "#444", fontFamily: primaryFont, fontSize: "0.9rem" }}
              >
                <strong>Click Lanka</strong>
                <br />
                P.O.BOX 32300,
                <br />
                Tel: +94 77 068 38 09,
                <br />
                No. 55/1 Mathavan Road,
                <br />
                Office Kalmunai-03 - SriLanka
              </Typography>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: { xs: "none", md: "block" },
                borderColor: "rgba(0, 0, 0, 0.08)",
              }}
            />


            {/* Contact Section */}
            <Box sx={{ flexBasis: { xs: "100%", md: "20%" } }}>
              <Typography
                variant="h6"
                sx={{ 
                    mb: 3, 
                    fontSize: "0.9rem", 
                    fontWeight: 800, 
                    fontFamily: primaryFont,
                    color: brandBlue,
                    letterSpacing: 1
                }}
              >
                GET IN TOUCH
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body2" sx={{ fontFamily: primaryFont, color: "#444", fontWeight: 600 }}>
                  +94 77 068 38 09 <br /> +94 75 815 12 46
                </Typography>
                <Link
                  href="mailto:info@clicklanka.com"
                  sx={{
                    color: brandBlue,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    fontFamily: primaryFont,
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    "&:hover": { 
                        opacity: 0.7,
                        paddingLeft: "5px" 
                    },
                  }}
                >
                  info@clicklanka.com
                </Link>
              </Box>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: { xs: "none", md: "block" },
                borderColor: "rgba(0, 0, 0, 0.08)",
              }}
            />

            {/* Opening Hours */}
            <Box sx={{ flexBasis: { xs: "100%", md: "20%" } }}>
              <Typography
                variant="h6"
                sx={{ 
                    mb: 3, 
                    fontSize: "0.9rem", 
                    fontWeight: 800, 
                    fontFamily: primaryFont,
                    color: brandBlue,
                    letterSpacing: 1
                }}
              >
                WORKING HOURS
              </Typography>
              <Box sx={{ 
                backgroundColor: "rgba(255,255,255,0.5)", 
                p: 2, 
                borderRadius: "12px",
                border: "1px solid rgba(10, 83, 151, 0.1)"
              }}>
                <Typography
                    variant="body2"
                    sx={{ lineHeight: 1.8, color: "#444", fontFamily: primaryFont }}
                >
                    <strong>Sat - Thu:</strong>
                    <br />
                    8:00 AM - 6:00 PM
                    <br />
                    <Typography component="span" sx={{ color: "#d32f2f", fontSize: "0.8rem", fontWeight: 700,fontFamily: primaryFont }}>
                        Friday: Closed
                    </Typography>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Bottom Footer Bar */}
      <Box sx={{ backgroundColor: "#000", py: 3, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontFamily: primaryFont }}
          >
            © 2026 <strong>Brainiacs Campus</strong>. All Rights Reserved.
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={3} 
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {["Home", "Portfolio", "Project", "Expertise", "Contact us"].map((text) => (
              <Link
                key={text}
                href="#"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontFamily: primaryFont,
                  position: "relative",
                  transition: "color 0.3s",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    width: "0%",
                    height: "1px",
                    bottom: -4,
                    left: 0,
                    backgroundColor: brandBlue,
                    transition: "width 0.3s ease"
                  },
                  "&:hover": { 
                    color: "#FFF",
                    "&::after": { width: "100%" }
                  },
                }}
              >
                {text}
              </Link>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;