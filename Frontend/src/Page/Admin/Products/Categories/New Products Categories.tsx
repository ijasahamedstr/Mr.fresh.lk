import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { ArrowBackIosNewOutlined, AccountTreeOutlined, CloudUploadOutlined } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import Swal from "sweetalert2";

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "37cd6333d9f4bd044c4a4dcc867276ae";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Simple UID generator
const uid = () => Math.random().toString(36).substring(2, 9);

interface AddAccountProps {
  onBack: () => void;
}

interface CategoryNodeProps {
  node: any;
  onAddChild: (parentId: string, title: string, icon: string) => void;
  onDelete: (id: string) => void;
}

// Custom styled label to match the image's "PRODUCT NAME *" style
const StyledLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: "11px", fontWeight: 800, color: "#475569", mb: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
    {children}
  </Typography>
);

// Custom styled input to match the image's grey background inputs
const StyledInput = (props: TextFieldProps) => (
  <TextField
    {...props}
    variant="outlined"
    sx={{
      "& .MuiOutlinedInput-root": {
        bgcolor: "#f8fafc",
        borderRadius: "8px",
        "& fieldset": { border: "none" },
        "&:hover fieldset": { border: "none" },
        pr: props.InputProps?.endAdornment ? 1 : 0, // Padding adjustment if there is an adornment
      },
      "& .MuiInputBase-input": {
        py: 1.5,
        px: 2,
        fontSize: "14px",
        color: "#0f172a",
        "&::placeholder": {
          color: "#94a3b8",
          opacity: 1,
        }
      },
      ...props.sx
    }}
  />
);

// New Input Component for handling both manual URL entry and ImgBB File Upload
const IconUrlInput = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
      if (response.data?.data?.url) {
        onChange(response.data.data.url);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Image uploaded',
          showConfirmButton: false,
          timer: 2000
        });
      }
    } catch (error) {
      Swal.fire("Upload Failed", "Failed to upload image to ImgBB.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    }
  };

  return (
    <>
      <input 
        type="file" 
        accept="image/*" 
        style={{ display: "none" }} 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <StyledInput
        fullWidth
        placeholder="URL or click icon ->"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton 
              size="small" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{ color: "#004652", bgcolor: "rgba(0,70,82,0.05)", "&:hover": { bgcolor: "rgba(0,70,82,0.15)" } }}
            >
              {uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadOutlined fontSize="small" />}
            </IconButton>
          )
        }}
      />
    </>
  );
};

const CategoryNode: React.FC<CategoryNodeProps> = ({ node, onAddChild, onDelete }) => {
  const [childTitle, setChildTitle] = useState("");
  const [childIcon, setChildIcon] = useState("");

  const handleAddChild = () => {
    if (!childTitle.trim()) return;
    onAddChild(node.id, childTitle, childIcon);
    setChildTitle("");
    setChildIcon("");
  };

  return (
    <Box sx={{ mt: 2, p: { xs: 2, md: 3 }, border: "1px solid #e2e8f0", borderRadius: "12px", bgcolor: "#ffffff", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.02)" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#004652" }}>
          {node.title} {node.icon && <span style={{ color: "#64748B", fontWeight: 500, fontSize: "0.9rem" }}>({node.icon})</span>}
        </Typography>
        <Button size="small" color="error" onClick={() => onDelete(node.id)} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Remove
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={1} flexWrap="wrap" alignItems="flex-end">
        <Box flex={1} minWidth="200px">
          <StyledLabel>Subcategory Name *</StyledLabel>
          <StyledInput
            fullWidth
            placeholder="e.g. T-Shirts"
            value={childTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChildTitle(e.target.value)}
          />
        </Box>
        <Box flex={1} minWidth="200px">
          {/* UPLOAD APPLIED HERE FOR SUBCATEGORIES */}
          <StyledLabel>Icon URL / Upload</StyledLabel>
          <IconUrlInput value={childIcon} onChange={setChildIcon} />
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddChild}
          sx={{ 
            height: "46px", 
            bgcolor: "#0f172a", 
            "&:hover": { bgcolor: "#334155" },
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            boxShadow: "none"
          }}
        >
          Add
        </Button>
      </Box>

      {node.children && node.children.length > 0 && (
        <Box sx={{ ml: { xs: 1, md: 3 }, mt: 3, pl: { xs: 2, md: 3 }, borderLeft: "2px dashed #e2e8f0" }}>
          {node.children.map((child: any) => (
            <CategoryNode
              key={child.id}
              node={child}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const NewProductsCategories = ({ onBack }: AddAccountProps) => {
  const [mainTitle, setMainTitle] = useState("");
  const [mainIcon, setMainIcon] = useState("");
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* -------- Tree Operations -------- */
  const addMainCategory = () => {
    if (!mainTitle.trim()) return;

    setTree((prev) => [
      ...prev,
      {
        id: uid(),
        title: mainTitle.trim(),
        icon: mainIcon.trim(),
        children: [],
      },
    ]);

    setMainTitle("");
    setMainIcon("");
  };

  const addChild = (parentId: string, title: string, icon: string) => {
    const recursiveAdd = (nodes: any[]): any[] =>
      nodes.map((n) =>
        n.id === parentId
          ? {
              ...n,
              children: [...n.children, { id: uid(), title, icon, children: [] }],
            }
          : { ...n, children: recursiveAdd(n.children) }
      );

    setTree((prev) => recursiveAdd(prev));
  };

  const deleteNode = (id: string) => {
    const recursiveDelete = (nodes: any[]): any[] =>
      nodes
        .filter((n) => n.id !== id)
        .map((n) => ({ ...n, children: recursiveDelete(n.children) }));

    setTree((prev) => recursiveDelete(prev));
  };

  const handleSubmit = async () => {
    if (tree.length === 0) {
      Swal.fire("Error", "Add at least one category", "error");
      return;
    }

    setLoading(true);
    Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

    try {
      await axios.post(`${API_BASE_URL}/Categorysection`, {
        categories: tree,
      });

      Swal.fire("Success", "Categories saved successfully", "success");
      setTree([]);
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.message || "Failed to save categories", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "1500px", mx: "auto", pb: 5 }}>
      {/* HEADERBAR */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: "14px" }} />}
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "none",
            color: "#64748B",
            "&:hover": { bgcolor: "rgba(0,70,82,0.05)", color: "#004652" },
          }}
        >
          Back to Inventory
        </Button>
      </Stack>

      <Box>
        <Card 
          sx={{ 
            borderRadius: "16px", 
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #e2e8f0",
            p: { xs: 3, md: 4 } 
          }}
        >
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: "12px", 
                bgcolor: "#f8fafc", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                border: "1px solid #e2e8f0"
              }}
            >
              <AccountTreeOutlined sx={{ color: "#004652" }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#004652", fontSize: "1.1rem" }}>
                Category Details
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mt: 0.2, fontSize: "0.85rem" }}>
                Enter the core hierarchy and attributes for categories.
              </Typography>
            </Box>
          </Box>

          {/* Main Category Form */}
          <Box display="flex" gap={2} mb={4} flexWrap="wrap" alignItems="flex-end">
            <Box flex={1} minWidth="250px">
              <StyledLabel>Main Category Name *</StyledLabel>
              <StyledInput
                fullWidth
                placeholder="e.g. Clothing"
                value={mainTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMainTitle(e.target.value)}
              />
            </Box>
            <Box flex={1} minWidth="250px">
              {/* UPLOAD APPLIED HERE FOR MAIN CATEGORIES */}
              <StyledLabel>Icon URL / Upload</StyledLabel>
              <IconUrlInput value={mainIcon} onChange={setMainIcon} />
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={addMainCategory}
              sx={{ 
                height: "46px",
                bgcolor: "#0f172a", 
                "&:hover": { bgcolor: "#334155" },
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "none",
                px: 4
              }}
            >
              Add Category
            </Button>
          </Box>

          <Box sx={{ borderTop: "1px solid #e2e8f0", pt: 4, mt: 2 }}>
            <StyledLabel>Category Tree Structure</StyledLabel>
            {tree.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                <AccountTreeOutlined sx={{ color: "#94a3b8", fontSize: 40, mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  No categories added yet. Start by adding a main category above.
                </Typography>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {tree.map((node) => (
                  <CategoryNode
                    key={node.id}
                    node={node}
                    onAddChild={addChild}
                    onDelete={deleteNode}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box mt={5} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ 
                bgcolor: "#004652", 
                "&:hover": { bgcolor: "#00333d" },
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "none",
                px: 4,
                py: 1.2,
                fontSize: "0.95rem"
              }}
            >
              {loading ? "Saving..." : "Save Categories"}
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default NewProductsCategories;