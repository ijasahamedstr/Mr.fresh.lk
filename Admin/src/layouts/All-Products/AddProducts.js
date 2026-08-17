import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  Button,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  MenuItem,
  CircularProgress,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Swal from "sweetalert2";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

/* ================= CATEGORY HELPERS ================= */

const flattenCategories = (nodes = [], level = 0, parentId = null, rootId = null) => {
  let result = [];

  nodes.forEach((node) => {
    const mainId = rootId || node.id;

    result.push({
      id: node.id,
      title: `${"— ".repeat(level)}${node.title}`,
      parentId,
      rootId: mainId,
      level,
    });

    if (node.children?.length) {
      result = result.concat(flattenCategories(node.children, level + 1, node.id, mainId));
    }
  });

  return result;
};

export default function AddProducts() {
  const [loading, setLoading] = useState(false);
  const [categoriesFlat, setCategoriesFlat] = useState([]);
  const [imageInput, setImageInput] = useState("");

  const apiBase = process.env.REACT_APP_API_HOST || "";

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    name: "",
    category: "",
    mainCategory: "",
    price: "",
    originalPrice: "",
    sku: "",
    weight: 0,
    description: "",
    images: [],
    visibility: true,
    soldOut: false,
    trackQty: true,
    quantity: 0,
    minQty: 0,
    maxQty: 0,
    tags: "",
    variants: [],
  });

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${apiBase}/Categorysection`);
        let all = [];
        res.data.forEach((doc) => {
          if (doc.categories?.length) all = all.concat(doc.categories);
        });
        setCategoriesFlat(flattenCategories(all));
      } catch {
        Swal.fire("Error", "Failed to load categories", "error");
      }
    };
    fetchCategories();
  }, [apiBase]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  /* ================= PRODUCT IMAGES ================= */
  const addImage = () => {
    if (!imageInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, imageInput.trim()],
    }));
    setImageInput("");
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  /* ================= VARIANTS ================= */
  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: "",
          price: "",
          originalPrice: "",
          sku: "",
          weight: 0,
          images: [],
          imageInput: "", // ✅ ADDED (NO REMOVAL)
        },
      ],
    }));
  };

  const updateVariant = (i, key, val) => {
    const updated = [...form.variants];
    updated[i][key] = val;
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  const removeVariant = (i) => {
    const updated = [...form.variants];
    updated.splice(i, 1);
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  /* ================= VARIANT IMAGES ================= */
  const addVariantImage = (variantIndex) => {
    const updated = [...form.variants];
    const url = updated[variantIndex].imageInput;

    if (!url.trim()) return;

    updated[variantIndex].images.push(url.trim());
    updated[variantIndex].imageInput = "";

    setForm((prev) => ({ ...prev, variants: updated }));
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    const updated = [...form.variants];
    updated[variantIndex].images.splice(imageIndex, 1);
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) {
      Swal.fire("Error", "Please fill required fields", "error");
      return;
    }

    setLoading(true);
    Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

    try {
      await axios.post(`${apiBase}/Products`, form);
      Swal.fire("Success", "Product added successfully", "success");
    } catch {
      Swal.fire("Error", "Failed to add product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6}>
        <Grid container spacing={3}>
          {/* LEFT */}
          <Grid item xs={12} md={8}>
            <Card>
              <MDBox p={3}>
                <TextField
                  fullWidth
                  label="Product Name *"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />

                <TextField
                  select
                  fullWidth
                  label="Category *"
                  value={form.category}
                  sx={{
                    mt: 2,
                    "& .MuiInputBase-root": {
                      height: 40,
                    },
                    "& .MuiInputBase-input": {
                      padding: "8px 14px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  onChange={(e) => {
                    const selected = categoriesFlat.find((c) => c.id === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                      mainCategory: selected?.rootId || e.target.value,
                    }));
                  }}
                >
                  {categoriesFlat.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  label="Main Category (Auto)"
                  disabled
                  value={categoriesFlat.find((c) => c.id === form.mainCategory)?.title || ""}
                />

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                />

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={form.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Original Price"
                      type="number"
                      value={form.originalPrice}
                      onChange={(e) => handleChange("originalPrice", e.target.value)}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  label="Weight (g)"
                  type="number"
                  value={form.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                />

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  multiline
                  rows={3}
                  label="Description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />

                {/* PRODUCT IMAGES */}
                <Box display="flex" gap={1} mt={2}>
                  <TextField
                    fullWidth
                    label="Add Image URL & press Enter"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addImage();
                      }
                    }}
                  />
                  <Button variant="contained" onClick={addImage}>
                    ADD
                  </Button>
                </Box>

                <Grid container spacing={1} mt={2}>
                  {form.images.map((img, i) => (
                    <Grid item xs={4} key={i}>
                      <Box sx={{ position: "relative" }}>
                        <img
                          src={img}
                          alt=""
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                          }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "#fff",
                          }}
                          onClick={() => removeImage(i)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>
            </Card>

            {/* VARIANTS */}
            <Card sx={{ mt: 3 }}>
              <MDBox p={3}>
                <MDTypography variant="h6">
                  Variants
                  <IconButton onClick={addVariant}>
                    <AddIcon />
                  </IconButton>
                </MDTypography>

                {form.variants.map((v, i) => (
                  <Box key={i} sx={{ border: "1px solid #ddd", p: 2, mt: 2 }}>
                    <IconButton color="error" onClick={() => removeVariant(i)}>
                      <DeleteIcon />
                    </IconButton>

                    <TextField
                      fullWidth
                      label="Variant Name"
                      value={v.name}
                      onChange={(e) => updateVariant(i, "name", e.target.value)}
                    />

                    <Grid container spacing={2} mt={1}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Price"
                          value={v.price}
                          onChange={(e) => updateVariant(i, "price", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Original Price"
                          value={v.originalPrice}
                          onChange={(e) => updateVariant(i, "originalPrice", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="SKU"
                          value={v.sku}
                          onChange={(e) => updateVariant(i, "sku", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Weight"
                          value={v.weight}
                          onChange={(e) => updateVariant(i, "weight", e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    {/* VARIANT IMAGE ADD WITH BUTTON */}
                    <Box display="flex" gap={1} mt={2}>
                      <TextField
                        fullWidth
                        label="Variant Image URL"
                        value={v.imageInput}
                        onChange={(e) => updateVariant(i, "imageInput", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addVariantImage(i);
                          }
                        }}
                      />
                      <Button variant="outlined" onClick={() => addVariantImage(i)}>
                        ADD
                      </Button>
                    </Box>

                    <Grid container spacing={1} mt={1}>
                      {v.images.map((img, imgIndex) => (
                        <Grid item xs={4} key={imgIndex}>
                          <Box sx={{ position: "relative" }}>
                            <img
                              src={img}
                              alt=""
                              style={{
                                width: "100%",
                                height: 90,
                                objectFit: "cover",
                              }}
                            />
                            <IconButton
                              size="small"
                              color="error"
                              sx={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                bgcolor: "#fff",
                              }}
                              onClick={() => removeVariantImage(i, imgIndex)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </MDBox>
            </Card>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.visibility}
                      onChange={(e) => handleChange("visibility", e.target.checked)}
                    />
                  }
                  label="Visibility"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.soldOut}
                      color="error"
                      onChange={(e) => handleChange("soldOut", e.target.checked)}
                    />
                  }
                  label="Mark as Sold Out"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.trackQty}
                      onChange={(e) => handleChange("trackQty", e.target.checked)}
                    />
                  }
                  label="Track Quantity"
                />

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  type="number"
                  label="Available Quantity"
                  disabled={!form.trackQty}
                  value={form.quantity}
                  onChange={(e) => handleChange("quantity", Number(e.target.value))}
                />

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  type="number"
                  label="Minimum Order Qty"
                  disabled={!form.trackQty}
                  value={form.minQty}
                  onChange={(e) => handleChange("minQty", Number(e.target.value))}
                />

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  type="number"
                  label="Maximum Order Qty"
                  disabled={!form.trackQty}
                  value={form.maxQty}
                  onChange={(e) => handleChange("maxQty", Number(e.target.value))}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        <Button
          fullWidth
          sx={{ mt: 3 }}
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          startIcon={loading && <CircularProgress size={18} />}
        >
          {loading ? "Saving..." : "Save Product"}
        </Button>
      </MDBox>
    </DashboardLayout>
  );
}
