import React, { useEffect, useCallback, useState } from "react";
import axios from "axios";
import {
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";

import Banner from "./Banner";
import Product from "./Product";

const apiBase = import.meta.env.VITE_API_HOST as string | undefined;

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

/* ---------------- LIFO HELPER ---------------- */

const lifoCategories = (items: CategoryNode[]): CategoryNode[] => {
  return items
    .slice()
    .reverse()
    .map((item) => ({
      ...item,
      children: item.children ? lifoCategories(item.children) : item.children,
    }));
};

/* ---------------- MAIN COMPONENT ---------------- */

const MainHome: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH API ---------------- */

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${apiBase}/Categorysection`);

        let all: CategoryNode[] = [];

        if (Array.isArray(res.data)) {
          res.data.forEach((section: CategorySection) => {
            if (Array.isArray(section.categories)) {
              all = all.concat(section.categories);
            }
          });
        }

        const lifoData = lifoCategories(all);

        setCategories(lifoData);
        if (lifoData.length) {
          setSelectedCategory(lifoData[0].title);
          setOpenCategory(lifoData[0].id);
        }
      } catch (error) {
        console.error("Category load failed", error);
      } finally {
        setLoading(false);
      }
    };

    if (apiBase) fetchCategories();
  }, []);

  const handleCategoryClick = useCallback((cat: CategoryNode) => {
    setSelectedCategory(cat.title);
    setOpenCategory((prev) => (prev === cat.id ? null : cat.id));
  }, []);

  /* ---------------- RENDER ---------------- */

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        gap: 2,
        p: 1,
        flexDirection: isDesktop ? "row" : "column",
        bgcolor: "#f4f6f8",
        fontFamily: '"Montserrat", sans-serif',
      }}
    >
      {/* MOBILE TOP BAR */}
      {!isDesktop && (
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{ flexShrink: 0, fontFamily: '"Montserrat", sans-serif' }}
        >
          <Toolbar sx={{ px: 0 }}>
            <Typography
              fontWeight={600}
              fontSize={18}
              sx={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              Shop
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* DESKTOP CATEGORY MENU */}
      {isDesktop && (
        <Box
          sx={{
            width: 280,
            height: "100%",
            background: "#fff",
            borderRadius: 2,
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            p: 2,
            overflowY: "auto",
            flexShrink: 0,
            fontFamily: '"Montserrat", sans-serif',
          }}
        >
          <Typography
            fontWeight={600}
            fontSize={18}
            mb={1.5}
            sx={{ fontFamily: '"Montserrat", sans-serif' }}
          >
            Categories
          </Typography>

          {!loading &&
            categories.map((cat) => {
              const isOpen = openCategory === cat.id;

              return (
                <Box key={cat.id}>
                  <Box
                    onClick={() => handleCategoryClick(cat)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1,
                      py: 1.3,
                      borderRadius: 1,
                      cursor: "pointer",
                      background:
                        selectedCategory === cat.title
                          ? "#f5f7ff"
                          : "transparent",
                      "&:hover": { background: "#f5f5f5" },
                      fontFamily: '"Montserrat", sans-serif',
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      {cat.icon && (
                        <Box
                          component="img"
                          src={cat.icon}
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: "#f4f6f8",
                            padding: "3px",
                          }}
                        />
                      )}
                      <Typography
                        fontSize={16}
                        fontWeight={500}
                        sx={{ fontFamily: '"Montserrat", sans-serif' }}
                      >
                        {cat.title}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 20,
                        opacity: 0.4,
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        fontFamily: '"Montserrat", sans-serif',
                      }}
                    >
                      ›
                    </Typography>
                  </Box>

                  {isOpen &&
                    cat.children?.map((sub) => (
                      <Box
                        key={sub.id}
                        sx={{
                          ml: 4.5,
                          px: 1,
                          py: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                          borderRadius: 1,
                          cursor: "pointer",
                          "&:hover": { background: "#f5f5f5" },
                          fontFamily: '"Montserrat", sans-serif',
                        }}
                      >
                        {sub.icon && (
                          <Box
                            component="img"
                            src={sub.icon}
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: "#f4f6f8",
                              padding: "3px",
                            }}
                          />
                        )}
                        <Typography
                          fontSize={14}
                          sx={{ fontFamily: '"Montserrat", sans-serif' }}
                        >
                          {sub.title}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              );
            })}
        </Box>
      )}

      {/* RIGHT MAIN AREA */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
          fontFamily: '"Montserrat", sans-serif',
        }}
      >
        <Box
          sx={{
            height: isDesktop ? 220 : 170,
            borderRadius: 2,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            flexShrink: 0,
          }}
        >
          <Banner />
        </Box>

        {!isDesktop && !loading && (
          <Box
            sx={{
              display: "flex",
              gap: 4,
              overflowX: "auto",
              whiteSpace: "nowrap",
              background: "#fff",
              borderRadius: 2,
              p: 2,
              flexShrink: 0,
              scrollBehavior: "smooth",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            {categories.map((cat) => (
              <Box
                key={cat.id}
                onClick={() => setSelectedCategory(cat.title)}
                sx={{
                  minWidth: 90, // 👈 controls card width
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                {cat.icon && (
                  <Box
                    component="img"
                    src={cat.icon}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "#f4f6f8",
                      p: "8px",
                      mb: 1,
                    }}
                  />
                )}

                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: '"Montserrat", sans-serif',
                  }}
                >
                  {cat.title}
                </Typography>
              </Box>
            ))}
          </Box>
        )}


        <Box
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            background: "#fff",
            fontFamily: '"Montserrat", sans-serif',
          }}
        >
          <Product />
        </Box>
      </Box>
    </Box>
  );
};

export default MainHome;
