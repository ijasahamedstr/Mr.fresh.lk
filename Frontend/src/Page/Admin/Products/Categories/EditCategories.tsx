import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  InputLabel,
  Link as MuiLink,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  createTheme,
  ThemeProvider,
  type AlertColor,
} from "@mui/material";
import {
  AddBoxOutlined,
  ArrowBackIosNewOutlined,
  CategoryOutlined,
  CloudUploadOutlined,
  DeleteOutline,
  FolderOutlined,
  NavigateNext,
  SaveOutlined,
  WarningAmberRounded,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import type { CategorySection } from "./All Categories"; // Import from your main file or a shared types file

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/+$/,
  ""
);
const CATEGORY_ENDPOINT = `${API_BASE_URL}/Categorysection`;
const IMGBB_API_KEY =
  import.meta.env.VITE_IMGBB_API_KEY || "37cd6333d9f4bd044c4a4dcc867276ae";
const PRIMARY_TEAL = "#004652";
const BORDER_COLOR = "#E2E8F0";
const PRIMARY_FONT = "'Montserrat', sans-serif";

const theme = createTheme({
  typography: {
    fontFamily: PRIMARY_FONT,
    allVariants: { fontFamily: PRIMARY_FONT },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { fontFamily: PRIMARY_FONT, textTransform: "none" },
      },
    },
    MuiInputBase: {
      styleOverrides: { root: { fontFamily: PRIMARY_FONT } },
    },
  },
});

export interface CategoryNode {
  id: string | number;
  title: string;
  icon?: string;
  children?: CategoryNode[];
}

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const compressImage = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target?.result as string;

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 800;
        let width = image.width;
        let height = image.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
          resolve(file);
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            resolve(
              new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          },
          "image/jpeg",
          0.82
        );
      };

      image.onerror = () => reject(new Error("The selected image could not be read."));
    };

    reader.onerror = () => reject(new Error("The selected file could not be read."));
  });

const uploadImageToImgBB = async (file: File): Promise<string> => {
  if (!IMGBB_API_KEY) {
    throw new Error("Missing VITE_IMGBB_API_KEY.");
  }

  const compressedFile = await compressImage(file);
  const formData = new FormData();
  formData.append("image", compressedFile);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(IMGBB_API_KEY)}`,
    { method: "POST", body: formData }
  );
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success || !payload?.data?.url) {
    throw new Error(payload?.error?.message || "Image upload failed.");
  }

  return payload.data.url as string;
};

const isImageUrl = (value?: string): boolean => {
  if (!value) return false;
  return /^(https?:\/\/|\/)/i.test(value.trim());
};

const createNodeId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `category-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const updateNodeInTree = (
  nodes: CategoryNode[],
  targetId: string | number,
  updater: (node: CategoryNode) => CategoryNode
): CategoryNode[] =>
  nodes.map((node) => {
    if (String(node.id) === String(targetId)) return updater(node);

    if (node.children?.length) {
      return {
        ...node,
        children: updateNodeInTree(node.children, targetId, updater),
      };
    }

    return node;
  });

const removeNodeFromTree = (
  nodes: CategoryNode[],
  targetId: string | number
): CategoryNode[] =>
  nodes
    .filter((node) => String(node.id) !== String(targetId))
    .map((node) => ({
      ...node,
      children: node.children
        ? removeNodeFromTree(node.children, targetId)
        : node.children,
    }));

const hasBlankTitle = (nodes: CategoryNode[]): boolean =>
  nodes.some(
    (node) => !node.title.trim() || (node.children ? hasBlankTitle(node.children) : false)
  );

const cleanTree = (nodes: CategoryNode[]): CategoryNode[] =>
  nodes.map((node) => ({
    ...node,
    title: node.title.trim(),
    icon: node.icon?.trim() || undefined,
    children: node.children ? cleanTree(node.children) : [],
  }));

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: "#F8FAFC",
    fontSize: "0.85rem",
    fontWeight: 600,
    "& fieldset": { borderColor: "transparent" },
    "&:hover fieldset": { borderColor: BORDER_COLOR },
    "&.Mui-focused fieldset": { borderColor: PRIMARY_TEAL, borderWidth: 2 },
  },
};

interface CategoryEditorNodeProps {
  node: CategoryNode;
  level: number;
  onChange: (id: string | number, patch: Partial<CategoryNode>) => void;
  onAddChild: (id: string | number) => void;
  onRemove: (id: string | number) => void;
  onUploadIcon: (id: string | number, file: File) => Promise<void>;
  uploadingNodeId: string | null;
}

function CategoryEditorNode({
  node,
  level,
  onChange,
  onAddChild,
  onRemove,
  onUploadIcon,
  uploadingNodeId,
}: CategoryEditorNodeProps) {
  return (
    <Box sx={{ ml: { xs: 0, sm: level > 0 ? 3 : 0 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2,
          borderRadius: "16px",
          border: `1px solid ${level === 0 ? "#C7DDD9" : BORDER_COLOR}`,
          bgcolor: level === 0 ? "#FCFEFD" : "#FFFFFF",
          position: "relative",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <Box sx={{ flex: 1 }}>
            <InputLabel
              sx={{ mb: 0.75, ml: 0.5, fontSize: "0.68rem", fontWeight: 800 }}
            >
              {level === 0 ? "MAIN CATEGORY" : `SUBCATEGORY LEVEL ${level}`}
            </InputLabel>
            <TextField
              fullWidth
              value={node.title}
              onChange={(event) => onChange(node.id, { title: event.target.value })}
              placeholder="Category name"
              sx={inputStyle}
            />
          </Box>

          <Box sx={{ flex: 1.25 }}>
            <InputLabel
              sx={{ mb: 0.75, ml: 0.5, fontSize: "0.68rem", fontWeight: 800 }}
            >
              ICON OR IMAGE URL
            </InputLabel>

            <Stack direction="row" spacing={1} alignItems="stretch">
              {node.icon && (
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: "10px",
                    border: `1px solid ${BORDER_COLOR}`,
                    bgcolor: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {isImageUrl(node.icon) ? (
                    <Box
                      component="img"
                      src={node.icon}
                      alt={`${node.title || "Category"} icon`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: "1.1rem" }}>{node.icon}</Typography>
                  )}
                </Box>
              )}

              <TextField
                fullWidth
                value={node.icon ?? ""}
                onChange={(event) => onChange(node.id, { icon: event.target.value })}
                placeholder="Emoji, icon text, or image URL"
                sx={inputStyle}
              />

              <Tooltip title="Upload icon or image">
                <Button
                  component="label"
                  variant="contained"
                  disabled={uploadingNodeId === String(node.id)}
                  sx={{
                    minWidth: 44,
                    width: 44,
                    height: 44,
                    p: 0,
                    borderRadius: "10px",
                    bgcolor: PRIMARY_TEAL,
                    flexShrink: 0,
                    "&:hover": { bgcolor: "#002D35" },
                  }}
                >
                  {uploadingNodeId === String(node.id) ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CloudUploadOutlined />
                  )}
                  <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) await onUploadIcon(node.id, file);
                    }}
                  />
                </Button>
              </Tooltip>

              {node.icon && (
                <Tooltip title="Clear icon">
                  <IconButton
                    onClick={() => onChange(node.id, { icon: "" })}
                    sx={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: "10px",
                      bgcolor: "#F8FAFC",
                      color: "#64748B",
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Add child category">
              <Button
                variant="outlined"
                onClick={() => onAddChild(node.id)}
                startIcon={<AddBoxOutlined />}
                sx={{
                  minHeight: 42,
                  borderRadius: "10px",
                  color: PRIMARY_TEAL,
                  borderColor: PRIMARY_TEAL,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                Add Child
              </Button>
            </Tooltip>

            <Tooltip title="Remove category">
              <IconButton
                onClick={() => onRemove(node.id)}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "10px",
                  bgcolor: "#FEF2F2",
                  color: "#EF4444",
                  "&:hover": { bgcolor: "#FEE2E2" },
                }}
              >
                <DeleteOutline />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {node.children && node.children.length > 0 && (
          <Box
            sx={{
              mt: 2.5,
              pl: { xs: 1.5, sm: 2.5 },
              borderLeft: "2px dashed #CBD5E1",
            }}
          >
            {node.children.map((child) => (
              <CategoryEditorNode
                key={String(child.id)}
                node={child}
                level={level + 1}
                onChange={onChange}
                onAddChild={onAddChild}
                onRemove={onRemove}
                onUploadIcon={onUploadIcon}
                uploadingNodeId={uploadingNodeId}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

// ---- PROP DEFINITION ----
export interface EditCategoryProps {
  categoryData: CategorySection;
  onBack: () => void;
}

export default function EditCategory({ categoryData, onBack }: EditCategoryProps) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingNodeId, setUploadingNodeId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const totalNodes = useMemo(() => {
    const countNodes = (nodes: CategoryNode[]): number =>
      nodes.reduce(
        (total, node) => total + 1 + (node.children ? countNodes(node.children) : 0),
        0
      );
    return countNodes(categories);
  }, [categories]);

  const showToast = (message: string, severity: AlertColor = "success") => {
    setToast({ open: true, message, severity });
  };

  // Populate Categories on Mount
  useEffect(() => {
    if (categoryData) {
      setCategories(Array.isArray(categoryData.categories) ? categoryData.categories : []);
    }
  }, [categoryData]);

  const changeNode = (nodeId: string | number, patch: Partial<CategoryNode>) => {
    setCategories((current) =>
      updateNodeInTree(current, nodeId, (node) => ({ ...node, ...patch }))
    );
  };

  const uploadNodeIcon = async (nodeId: string | number, file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "warning");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("The image must be smaller than 10 MB.", "warning");
      return;
    }

    setUploadingNodeId(String(nodeId));
    try {
      const imageUrl = await uploadImageToImgBB(file);
      changeNode(nodeId, { icon: imageUrl });
      showToast("Category icon uploaded successfully.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";
      showToast(message, "error");
    } finally {
      setUploadingNodeId(null);
    }
  };

  const addRootCategory = () => {
    setCategories((current) => [
      ...current,
      { id: createNodeId(), title: "", icon: "", children: [] },
    ]);
  };

  const addChildCategory = (parentId: string | number) => {
    const child: CategoryNode = {
      id: createNodeId(),
      title: "",
      icon: "",
      children: [],
    };

    setCategories((current) =>
      updateNodeInTree(current, parentId, (node) => ({
        ...node,
        children: [...(node.children ?? []), child],
      }))
    );
  };

  const removeCategory = (nodeId: string | number) => {
    setCategories((current) => removeNodeFromTree(current, nodeId));
  };

  const requestSave = () => {
    if (categories.length === 0) {
      showToast("Add at least one category before saving.", "warning");
      return;
    }

    if (hasBlankTitle(categories)) {
      showToast("Every category must have a name.", "warning");
      return;
    }

    setConfirmOpen(true);
  };

  const saveCategoryTree = async () => {
    setConfirmOpen(false);
    setSaving(true);

    try {
      const cleanedCategories = cleanTree(categories);
      await axios.put(
        `${CATEGORY_ENDPOINT}/${encodeURIComponent(categoryData._id)}`,
        { categories: cleanedCategories }
      );

      showToast("Category tree updated successfully.", "success");
      
      // Delay navigation back so the user can see the success toast
      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update category tree.";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#F4F7FA",
          p: { xs: 1.5, md: 3 },
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "flex-end" }}
            spacing={2}
            mb={4}
          >
            <Box>
              <Breadcrumbs
                separator={<NavigateNext sx={{ fontSize: "0.8rem" }} />}
                sx={{ mb: 0.75 }}
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
                <MuiLink
                  component="button"
                  onClick={onBack}
                  underline="hover"
                  color="inherit"
                  sx={{ fontSize: "0.65rem", fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                >
                  ALL CATEGORIES
                </MuiLink>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: PRIMARY_TEAL }}>
                  EDIT TREE
                </Typography>
              </Breadcrumbs>

              <Typography
                variant="h5"
                sx={{ fontWeight: 900, color: PRIMARY_TEAL, letterSpacing: "-0.5px" }}
              >
                Update Category Tree
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>
                Edit category names, icons, and nested subcategories. {totalNodes} node
                {totalNodes === 1 ? "" : "s"} currently in this tree.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                onClick={onBack}
                variant="outlined"
                startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: 15 }} />}
                sx={{
                  borderRadius: "10px",
                  borderColor: "#CBD5E1",
                  color: "#64748B",
                  fontWeight: 800,
                }}
              >
                Back
              </Button>
              <Button
                onClick={requestSave}
                disabled={saving || uploadingNodeId !== null}
                variant="contained"
                startIcon={saving ? <CircularProgress size={17} color="inherit" /> : <SaveOutlined />}
                sx={{
                  borderRadius: "10px",
                  bgcolor: PRIMARY_TEAL,
                  px: 3,
                  fontWeight: 800,
                  boxShadow: "0 6px 16px rgba(0,70,82,0.18)",
                  "&:hover": { bgcolor: "#002D35" },
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Stack>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              mb: 3,
              borderRadius: "20px",
              border: `1px solid ${BORDER_COLOR}`,
              bgcolor: "#FFFFFF",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
              mb={3}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    bgcolor: "rgba(0,70,82,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FolderOutlined sx={{ color: PRIMARY_TEAL }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, color: "#1E293B" }}>
                    Tree Structure
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>
                    Add unlimited nested child categories.
                  </Typography>
                </Box>
              </Stack>

              <Button
                onClick={addRootCategory}
                variant="outlined"
                startIcon={<CategoryOutlined />}
                sx={{
                  borderRadius: "10px",
                  color: PRIMARY_TEAL,
                  borderColor: PRIMARY_TEAL,
                  fontWeight: 800,
                }}
              >
                Add Main Category
              </Button>
            </Stack>

            {categories.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: "center",
                  bgcolor: "#F8FAFC",
                  borderRadius: "16px",
                  border: "1px dashed #CBD5E1",
                }}
              >
                <CategoryOutlined sx={{ fontSize: 46, color: "#CBD5E1", mb: 1 }} />
                <Typography sx={{ color: "#64748B", fontWeight: 700, mb: 2 }}>
                  This category tree is empty.
                </Typography>
                <Button onClick={addRootCategory} variant="contained" sx={{ bgcolor: PRIMARY_TEAL }}>
                  Add First Category
                </Button>
              </Box>
            ) : (
              categories.map((node) => (
                <CategoryEditorNode
                  key={String(node.id)}
                  node={node}
                  level={0}
                  onChange={changeNode}
                  onAddChild={addChildCategory}
                  onRemove={removeCategory}
                  onUploadIcon={uploadNodeIcon}
                  uploadingNodeId={uploadingNodeId}
                />
              ))
            )}
          </Paper>
        </Box>

        {/* CONFIRMATION DIALOG */}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
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
                bgcolor: "#FFFBEB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2.5,
              }}
            >
              <WarningAmberRounded sx={{ color: "#F59E0B", fontSize: 36 }} />
            </Box>

            <Typography
              sx={{
                fontWeight: 800,
                color: "#1E293B",
                fontSize: "1.1rem",
                mb: 1,
              }}
            >
              Confirm Changes
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
              Are you sure you want to save these updates to the category tree? This will overwrite the existing structure.
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                size="large"
                onClick={() => setConfirmOpen(false)}
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
                onClick={saveCategoryTree}
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: PRIMARY_TEAL,
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  boxShadow: "0 4px 12px rgba(0,70,82,0.2)",
                  "&:hover": {
                    bgcolor: "#002D35",
                  },
                }}
              >
                Confirm Save
              </Button>
            </Stack>
          </Box>
        </Dialog>

        {/* SNACKBAR */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
            sx={{
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.85rem",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}