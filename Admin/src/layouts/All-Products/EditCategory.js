import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";

/* ---------------- MUI ---------------- */
import {
  Grid,
  Card,
  TextField,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  CircularProgress,
  Box,
  Divider,
  MenuItem,
} from "@mui/material";

/* ---------------- ICONS ---------------- */
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

/* ---------------- DASHBOARD ---------------- */
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

/* ---------------- API ---------------- */
const API = process.env.REACT_APP_API_HOST || "";

/* ======================================================
   EDIT PRODUCT – FULL INFORMATION WITH IMAGE PREVIEW
====================================================== */
export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    mainCategory: "",

    price: "",
    originalPrice: "",
    sku: "",
    weight: "",
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

    todaySpecial: false,
    popularProduct: false,
  });

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await axios.get(`${API}/Products/${id}`);
        setForm(res.data.data);
      } catch {
        Swal.fire("Error", "Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const toggle = (name) => {
    setForm((p) => ({ ...p, [name]: !p[name] }));
  };

  /* ================= PRODUCT IMAGES ================= */
  const addImage = () => setForm((p) => ({ ...p, images: [...p.images, ""] }));

  const updateImage = (i, val) => {
    const images = [...form.images];
    images[i] = val;
    setForm({ ...form, images });
  };

  const removeImage = (i) => {
    const images = [...form.images];
    images.splice(i, 1);
    setForm({ ...form, images });
  };

  /* ================= VARIANTS ================= */
  const addVariant = () => {
    setForm((p) => ({
      ...p,
      variants: [
        ...p.variants,
        {
          name: "",
          price: "",
          originalPrice: "",
          sku: "",
          weight: "",
          images: [],
        },
      ],
    }));
  };

  const updateVariant = (i, field, val) => {
    const variants = [...form.variants];
    variants[i][field] = val;
    setForm({ ...form, variants });
  };

  const removeVariant = (i) => {
    const variants = [...form.variants];
    variants.splice(i, 1);
    setForm({ ...form, variants });
  };

  const addVariantImage = (i) => {
    const variants = [...form.variants];
    variants[i].images.push("");
    setForm({ ...form, variants });
  };

  const updateVariantImage = (i, imgI, val) => {
    const variants = [...form.variants];
    variants[i].images[imgI] = val;
    setForm({ ...form, variants });
  };

  const removeVariantImage = (i, imgI) => {
    const variants = [...form.variants];
    variants[i].images.splice(imgI, 1);
    setForm({ ...form, variants });
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    setSaving(true);
    Swal.fire({ title: "Updating...", didOpen: () => Swal.showLoading() });

    try {
      await axios.put(`${API}/Products/${id}`, form);
      Swal.fire("Success", "Product updated successfully", "success");
      navigate("/products");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6">Edit Product (Full Information)</MDTypography>

              {/* BASIC INFO */}
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Main Category"
                    name="mainCategory"
                    value={form.mainCategory}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Original Price"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="SKU"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Weight"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* PRODUCT MODE */}
              <MDTypography>Product Mode</MDTypography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Today Special"
                    value={form.todaySpecial ? "yes" : "no"}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, todaySpecial: e.target.value === "yes" }))
                    }
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 40,
                      },
                    }}
                  >
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Popular Product"
                    value={form.popularProduct ? "yes" : "no"}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, popularProduct: e.target.value === "yes" }))
                    }
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 40,
                      },
                    }}
                  >
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* STOCK */}
              <MDTypography>Stock & Quantity</MDTypography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Qty"
                    name="minQty"
                    value={form.minQty}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Qty"
                    name="maxQty"
                    value={form.maxQty}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <FormControlLabel
                control={<Switch checked={form.visibility} onChange={() => toggle("visibility")} />}
                label="Visible"
              />
              <FormControlLabel
                control={<Switch checked={form.soldOut} onChange={() => toggle("soldOut")} />}
                label="Sold Out"
              />
              <FormControlLabel
                control={<Switch checked={form.trackQty} onChange={() => toggle("trackQty")} />}
                label="Track Quantity"
              />

              <Divider sx={{ my: 3 }} />

              {/* PRODUCT IMAGES */}
              <MDTypography>Product Images</MDTypography>
              {form.images.map((img, i) => (
                <Box key={i} display="flex" alignItems="center" gap={2} mt={1}>
                  {img && (
                    <Box
                      component="img"
                      src={img}
                      sx={{ width: 70, height: 70, objectFit: "cover", border: "1px solid #ddd" }}
                    />
                  )}
                  <TextField
                    fullWidth
                    label={`Image ${i + 1}`}
                    value={img}
                    onChange={(e) => updateImage(i, e.target.value)}
                  />
                  <IconButton color="error" onClick={() => removeImage(i)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button startIcon={<AddIcon />} onClick={addImage} sx={{ mt: 1 }}>
                Add Product Image
              </Button>

              <Divider sx={{ my: 3 }} />

              {/* VARIANTS */}
              <MDTypography>Variants</MDTypography>
              {form.variants.map((v, i) => (
                <Card key={i} sx={{ p: 2, mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={v.name}
                        onChange={(e) => updateVariant(i, "name", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Price"
                        value={v.price}
                        onChange={(e) => updateVariant(i, "price", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Original Price"
                        value={v.originalPrice}
                        onChange={(e) => updateVariant(i, "originalPrice", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        label="SKU"
                        value={v.sku}
                        onChange={(e) => updateVariant(i, "sku", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Weight"
                        value={v.weight}
                        onChange={(e) => updateVariant(i, "weight", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton color="error" onClick={() => removeVariant(i)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>

                  {v.images.map((img, imgI) => (
                    <Box key={imgI} display="flex" alignItems="center" gap={2} mt={1}>
                      {img && (
                        <Box
                          component="img"
                          src={img}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            border: "1px solid #ddd",
                          }}
                        />
                      )}
                      <TextField
                        fullWidth
                        label={`Variant Image ${imgI + 1}`}
                        value={img}
                        onChange={(e) => updateVariantImage(i, imgI, e.target.value)}
                      />
                      <IconButton color="error" onClick={() => removeVariantImage(i, imgI)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}

                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => addVariantImage(i)}
                    sx={{ mt: 1 }}
                  >
                    Add Variant Image
                  </Button>
                </Card>
              ))}

              <Button startIcon={<AddIcon />} onClick={addVariant} sx={{ mt: 2 }}>
                Add Variant
              </Button>

              <Button
                fullWidth
                startIcon={<SaveIcon />}
                sx={{ mt: 3 }}
                onClick={handleSave}
                disabled={saving}
              >
                Save All Changes
              </Button>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
