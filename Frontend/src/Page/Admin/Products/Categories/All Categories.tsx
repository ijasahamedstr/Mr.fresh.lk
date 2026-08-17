import  { useCallback, useEffect, useState, type ComponentType } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import {
  Alert,
  type AlertColor,
  Box,
  Breadcrumbs,
  Button,
  createTheme,
  Dialog,
  IconButton,
  LinearProgress,
  Link as MuiLink,
  Paper,
  Snackbar,
  Stack,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AddBoxOutlined,
  CategoryOutlined,
  DeleteOutline,
  EditOutlined,
  FolderOutlined,
  NavigateNext,
  WarningAmberRounded,
} from "@mui/icons-material";

import { Link } from "react-router-dom";

// --- COMPONENT IMPORTS ---
import NewProductsCreateImport from "./New Products Categories";
const NewProductsCreate = NewProductsCreateImport as ComponentType<{
  onBack: () => void;
}>;

// Cleanly importing EditCategory (now that it has the correct props)
import EditCategory from "./EditCategories";

// --- CONFIGURATION & CONSTANTS ---
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const CATEGORY_ENDPOINT = `${API_BASE_URL}/Categorysection`;
const PRIMARY_TEAL = "#004652";
const ACCENT_AMBER = "#F59E0B";

const montserratTheme = createTheme({
  typography: {
    fontFamily: "'Montserrat', sans-serif",
    allVariants: {
      fontFamily: "'Montserrat', sans-serif",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          textTransform: "none",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
        },
      },
    },
  },
});

/* ---------------------------------------------
   TYPES
--------------------------------------------- */

interface CategoryNode {
  id: string | number;
  title: string;
  icon?: string;
  children?: CategoryNode[];
}

export interface CategorySection {
  _id: string;
  categories: CategoryNode[];
  [key: string]: unknown;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

type SyncStatus = "idle" | "syncing" | "error";

/* ---------------------------------------------
   RECURSIVE TREE NODE
--------------------------------------------- */

function TreeNode({
  node,
  level = 0,
}: {
  node: CategoryNode;
  level?: number;
}) {
  const isUrlIcon = Boolean(
    node.icon &&
      (node.icon.startsWith("http") || node.icon.startsWith("/"))
  );

  return (
    <Box ml={level === 0 ? 0 : 2} mt={1}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "6px",
            bgcolor: level === 0 ? "#E6F4F1" : "#F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PRIMARY_TEAL,
            flexShrink: 0,
          }}
        >
          {isUrlIcon ? (
            <img
              src={node.icon}
              alt={`${node.title} icon`}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : node.icon ? (
            <Typography sx={{ fontSize: "0.9rem" }}>
              {node.icon}
            </Typography>
          ) : node.children && node.children.length > 0 ? (
            <FolderOutlined sx={{ fontSize: "1rem" }} />
          ) : (
            <CategoryOutlined sx={{ fontSize: "1rem" }} />
          )}
        </Box>

        <Typography
          sx={{
            fontWeight: level === 0 ? 800 : 600,
            color: level === 0 ? PRIMARY_TEAL : "#475569",
            fontSize: "0.85rem",
          }}
        >
          {node.title}
        </Typography>
      </Stack>

      {Array.isArray(node.children) && node.children.length > 0 && (
        <Box
          sx={{
            borderLeft: "1px dashed #CBD5E1",
            ml: 1.5,
            pl: 1,
            mt: 0.5,
          }}
        >
          {node.children.map((child) => (
            <TreeNode
              key={`${node.id}-${child.id}`}
              node={child}
              level={level + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

/* ---------------------------------------------
   MAIN VIEW
--------------------------------------------- */

export default function AllCategories() {
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  
  // ---> States to control same-page rendering <---
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategorySection | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    idToDelete: string | null;
  }>({
    open: false,
    idToDelete: null,
  });

  const triggerSnackbar = useCallback(
    (message: string, severity: AlertColor = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  /* -------- Fetch all category sections -------- */
  const fetchSections = useCallback(async () => {
    setSyncStatus("syncing");

    try {
      const response = await axios.get(CATEGORY_ENDPOINT);
      const data = response.data;

      const normalizedData: unknown[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.categorySections)
            ? data.categorySections
            : data
              ? [data]
              : [];

      const validSections = normalizedData.filter(
        (item): item is CategorySection =>
          typeof item === "object" &&
          item !== null &&
          "_id" in item &&
          "categories" in item &&
          Array.isArray((item as CategorySection).categories)
      );

      setSections(validSections);
      setSyncStatus("idle");
    } catch (error) {
      console.error("Failed to load category sections:", error);
      setSyncStatus("error");
      triggerSnackbar("Failed to load categories", "error");
    }
  }, [triggerSnackbar]);

  useEffect(() => {
    void fetchSections();
  }, [fetchSections]);

  /* -------- Delete actions -------- */
  const confirmDelete = async () => {
    const id = deleteDialog.idToDelete;

    setDeleteDialog({
      open: false,
      idToDelete: null,
    });

    if (!id) return;

    try {
      await axios.delete(`${CATEGORY_ENDPOINT}/${id}`);
      setSections((previousSections) =>
        previousSections.filter((item) => item._id !== id)
      );
      triggerSnackbar("Category tree deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete category tree:", error);
      triggerSnackbar("Failed to delete category tree", "error");
    }
  };


  /* =====================================================================
     CONDITIONAL RENDERING FOR FORMS
  ===================================================================== */
  
  if (showAddForm) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <NewProductsCreate 
          onBack={() => { 
            setShowAddForm(false); 
            void fetchSections(); 
          }} 
        />
      </ThemeProvider>
    );
  }

  if (categoryToEdit) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <EditCategory 
          categoryData={categoryToEdit} 
          onBack={() => { 
            setCategoryToEdit(null); 
            void fetchSections(); 
          }} 
        />
      </ThemeProvider>
    );
  }

  /* =====================================================================
     MAIN CATEGORY LIST VIEW
  ===================================================================== */

  return (
    <ThemeProvider theme={montserratTheme}>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#F4F7FA",
          p: { xs: 1.5, md: 3 },
          "@keyframes pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.35 },
          },
        }}
      >
        {/* HEADER */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-end" }}
          mb={4}
          spacing={2}
        >
          <Box>
            <Breadcrumbs
              separator={<NavigateNext sx={{ fontSize: "0.8rem" }} />}
              sx={{ mb: 0.5 }}
            >
              <MuiLink
                component={Link}
                to="/"
                underline="hover"
                color="inherit"
                sx={{ fontSize: "0.65rem", fontWeight: 700 }}
              >
                DASHBOARD
              </MuiLink>

              <Typography
                color="text.primary"
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  color: PRIMARY_TEAL,
                }}
              >
                ALL CATEGORIES
              </Typography>
            </Breadcrumbs>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: PRIMARY_TEAL,
                letterSpacing: "-0.5px",
                fontSize: "1.4rem",
              }}
            >
              Category Trees
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor:
                    syncStatus === "idle"
                      ? "#10B981"
                      : syncStatus === "error"
                        ? "#EF4444"
                        : "#F59E0B",
                  animation:
                    syncStatus === "syncing"
                      ? "pulse 1.5s infinite"
                      : "none",
                }}
              />

              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "#64748B",
                  letterSpacing: 0.5,
                }}
              >
                {syncStatus === "syncing"
                  ? "SYNCING DATA..."
                  : syncStatus === "error"
                    ? "SYNC ERROR"
                    : "CATEGORIES UP TO DATE"}
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              type="button"
              size="medium"
              variant="contained"
              startIcon={<AddBoxOutlined fontSize="small" />}
              onClick={() => setShowAddForm(true)}
              sx={{
                bgcolor: PRIMARY_TEAL,
                borderRadius: "8px",
                px: 3,
                py: 1,
                fontSize: "0.8rem",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(0,70,82,0.15)",
                "&:hover": {
                  bgcolor: "#002d35",
                },
              }}
            >
              Add New Tree
            </Button>
          </Stack>
        </Stack>

        {/* PROGRESS BAR */}
        <Box sx={{ position: "relative", width: "100%", mb: 2 }}>
          {syncStatus === "syncing" && (
            <LinearProgress
              sx={{
                position: "absolute",
                top: -10,
                left: 0,
                right: 0,
                height: 3,
                borderRadius: "4px",
                bgcolor: "transparent",
                "& .MuiLinearProgress-bar": {
                  bgcolor: PRIMARY_TEAL,
                },
              }}
            />
          )}
        </Box>

        {/* 3 COLUMN FLEX LAYOUT */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {sections.length === 0 && syncStatus !== "syncing" ? (
              <Box sx={{ width: "100%" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <FolderOutlined
                    sx={{ fontSize: 50, color: "#CBD5E1", mb: 1 }}
                  />
                  <Typography sx={{ color: "#94A3B8", fontWeight: 600 }}>
                    No category trees found in the database.
                  </Typography>
                </Paper>
              </Box>
            ) : (
              sections.map((section, index) => (
                <Box
                  key={section._id}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "calc(50% - 12px)",
                      md: "calc(33.333% - 16px)",
                    },
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      overflow: "hidden",
                      height: "100%",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {/* Card Header */}
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: "#F8FAFC",
                        borderBottom: "1px solid #E2E8F0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          color: "#64748B",
                          letterSpacing: 0.5,
                        }}
                      >
                        TREE STRUCTURE #{index + 1}
                      </Typography>

                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit Tree">
                          <IconButton
                            size="small"
                            onClick={() => setCategoryToEdit(section)}
                            sx={{
                              color: ACCENT_AMBER,
                              bgcolor: "#FFFBEB",
                              "&:hover": {
                                bgcolor: "#FEF3C7",
                              },
                            }}
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Tree">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                idToDelete: section._id,
                              })
                            }
                            sx={{
                              color: "#EF4444",
                              bgcolor: "#FEF2F2",
                              "&:hover": {
                                bgcolor: "#FEE2E2",
                              },
                            }}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    {/* Card Body - Recursive Tree */}
                    <Box
                      sx={{
                        p: 2,
                        flex: 1,
                        overflowY: "auto",
                        maxHeight: "350px",
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#CBD5E1",
                          borderRadius: "10px",
                        },
                      }}
                    >
                      {section.categories.length > 0 ? (
                        section.categories.map((node) => (
                          <TreeNode
                            key={`${section._id}-${node.id}`}
                            node={node}
                          />
                        ))
                      ) : (
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            color: "#94A3B8",
                            fontStyle: "italic",
                            textAlign: "center",
                            mt: 2,
                          }}
                        >
                          Empty Tree
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Box>
              ))
            )}
          </Box>
        </motion.div>

        {/* DELETE CONFIRMATION DIALOG */}
        <Dialog
          open={deleteDialog.open}
          onClose={() =>
            setDeleteDialog({ open: false, idToDelete: null })
          }
          PaperProps={{
            sx: {
              borderRadius: "16px",
              p: 1,
              maxWidth: "380px",
            },
          }}
        >
          <Box textAlign="center" p={3}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                bgcolor: "#FFF1F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2.5,
              }}
            >
              <WarningAmberRounded
                sx={{ color: "#EF4444", fontSize: 36 }}
              />
            </Box>

            <Typography
              sx={{
                fontWeight: 800,
                color: "#1E293B",
                fontSize: "1.1rem",
                mb: 1,
              }}
            >
              Confirm Deletion
            </Typography>

            <Typography
              sx={{
                color: "#64748B",
                mb: 4,
                fontWeight: 500,
                fontSize: "0.85rem",
                lineHeight: 1.5,
              }}
            >
              You are about to permanently delete this category tree and all
              nested children. This action cannot be undone.
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                size="large"
                onClick={() =>
                  setDeleteDialog({ open: false, idToDelete: null })
                }
                fullWidth
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  color: "#64748B",
                  borderColor: "#CBD5E1",
                  fontSize: "0.8rem",
                }}
              >
                Cancel
              </Button>

              <Button
                size="large"
                onClick={() => void confirmDelete()}
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: "#EF4444",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  boxShadow: "0 4px 12px rgba(239,68,68,0.2)",
                  "&:hover": {
                    bgcolor: "#DC2626",
                  },
                }}
              >
                Delete Tree
              </Button>
            </Stack>
          </Box>
        </Dialog>

        {/* SNACKBAR */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() =>
            setSnackbar((currentSnackbar) => ({
              ...currentSnackbar,
              open: false,
            }))
          }
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() =>
              setSnackbar((currentSnackbar) => ({
                ...currentSnackbar,
                open: false,
              }))
            }
            sx={{
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.85rem",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}