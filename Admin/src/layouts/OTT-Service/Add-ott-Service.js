import React, { useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Swal from "sweetalert2";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

export default function AddOTTService() {
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.REACT_APP_API_HOST || "";

  const [service, setService] = useState({
    ottServiceName: "",
    description: "",
    category: "",
    // array of objects { duration, price, stockStatus }
    planDurations: [],
    images: [], // array of image URLs
    accessLicenseTypes: [], // optional array of strings
    videoQuality: "", // e.g. 'HD', 'SD', '4K'
    price: "",
    discountedPrice: "", // optional
  });

  const [tempInput, setTempInput] = useState({
    planDuration: "",
    planPrice: "",
    planStock: "InStock",
    imageUrl: "",
    licenseType: "",
  });

  const [errors, setErrors] = useState({});

  const CATEGORIES = [
    "AI",
    "Digital Key",
    "Games",
    "OTT",
    "Premium Account",
    "Streaming Combos",
    "Utilities",
    "VPN",
  ];

  const STOCK_OPTIONS = [
    { value: "InStock", label: "In Stock" },
    { value: "OutOfStock", label: "Out of Stock" },
  ];

  const isImageUrl = (url) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      return /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(u.pathname);
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // Plan durations handlers (duration + sub price + stock status)
  const addPlanDuration = () => {
    const duration = tempInput.planDuration.trim();
    const priceStr = tempInput.planPrice.trim();
    const stockStatus = tempInput.planStock || "InStock";

    let e = {};
    if (!duration) e.planDuration = "Duration cannot be empty.";
    if (!priceStr) e.planPrice = "Sub price is required.";
    else if (Number.isNaN(Number(priceStr))) e.planPrice = "Sub price must be a number.";

    if (Object.keys(e).length) {
      setErrors((prev) => ({ ...prev, ...e }));
      return;
    }

    const existing = service.planDurations.find(
      (pd) =>
        pd.duration === duration && pd.price === Number(priceStr) && pd.stockStatus === stockStatus
    );
    if (existing) {
      setErrors((p) => ({ ...p, planDuration: "This plan is already added." }));
      return;
    }

    setService((p) => ({
      ...p,
      planDurations: [...p.planDurations, { duration, price: Number(priceStr), stockStatus }],
    }));

    setTempInput((p) => ({
      ...p,
      planDuration: "",
      planPrice: "",
      planStock: "InStock",
    }));

    setErrors((p) => ({
      ...p,
      planDuration: "",
      planPrice: "",
    }));
  };

  const removePlanDuration = (i) =>
    setService((p) => ({
      ...p,
      planDurations: p.planDurations.filter((_, idx) => idx !== i),
    }));

  // Images handlers
  const addImage = () => {
    const url = tempInput.imageUrl.trim();
    if (!url) return setErrors((p) => ({ ...p, imageUrl: "Image URL cannot be empty." }));
    if (!isImageUrl(url)) return setErrors((p) => ({ ...p, imageUrl: "Not a direct image URL." }));
    if (service.images.includes(url))
      return setErrors((p) => ({ ...p, imageUrl: "Already added." }));
    setService((p) => ({ ...p, images: [...p.images, url] }));
    setTempInput((p) => ({ ...p, imageUrl: "" }));
    setErrors((p) => ({ ...p, imageUrl: "" }));
  };

  const removeImage = (i) =>
    setService((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));

  // License handlers
  const addLicenseType = () => {
    const val = tempInput.licenseType.trim();
    if (!val) return setErrors((p) => ({ ...p, licenseType: "Cannot be empty." }));
    if (service.accessLicenseTypes.includes(val))
      return setErrors((p) => ({ ...p, licenseType: "Already added." }));
    setService((p) => ({ ...p, accessLicenseTypes: [...p.accessLicenseTypes, val] }));
    setTempInput((p) => ({ ...p, licenseType: "" }));
    setErrors((p) => ({ ...p, licenseType: "" }));
  };

  const removeLicenseType = (i) =>
    setService((p) => ({
      ...p,
      accessLicenseTypes: p.accessLicenseTypes.filter((_, idx) => idx !== i),
    }));

  const validate = () => {
    const e = {};
    if (!service.ottServiceName.trim()) e.ottServiceName = "Service name is required.";
    if (!service.description.trim()) e.description = "Description is required.";
    if (!service.category) e.category = "Please select a category.";
    if (service.price === "" || service.price === null) e.price = "Price is required.";
    else if (Number.isNaN(Number(service.price))) e.price = "Price must be a number.";
    if (service.discountedPrice && Number.isNaN(Number(service.discountedPrice)))
      e.discountedPrice = "Discounted price must be a number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    Swal.fire({
      title: "Submitting...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // ✅ compute overall stock for root-level `stock` field
      const overallStock = service.planDurations.some((pd) => pd.stockStatus === "InStock")
        ? "InStock"
        : "OutOfStock";

      // ✅ build mainHeadings in the shape of your schema { planDurations, Price: [string] }
      const mainHeadings = service.planDurations.map((pd) => ({
        planDurations: pd.duration,
        Price: [String(pd.price)],
      }));

      const payload = {
        ottServiceName: service.ottServiceName,
        description: service.description,
        category: service.category,

        // still send full detail
        planDurations: service.planDurations, // { duration, price, stockStatus }

        // for your current schema
        mainHeadings,

        images: service.images, // array of strings
        accessLicenseTypes: service.accessLicenseTypes, // array of strings
        videoQuality: service.videoQuality,

        price: String(service.price),
        discountedPrice: service.discountedPrice ? String(service.discountedPrice) : undefined,

        stock: overallStock,
      };

      const res = await axios.post(`${apiBase}/Ottservice`, payload);
      Swal.close();
      if (!res || res.status >= 300 || res.data?.error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.message || "Failed to create.",
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "Created",
          text: res?.data?.message || "OTT Service created.",
        });
        // reset
        setService({
          ottServiceName: "",
          description: "",
          category: "",
          planDurations: [],
          images: [],
          accessLicenseTypes: [],
          videoQuality: "",
          price: "",
          discountedPrice: "",
        });
        setTempInput({
          planDuration: "",
          planPrice: "",
          planStock: "InStock",
          imageUrl: "",
          licenseType: "",
        });
        setErrors({});
      }
    } catch (err) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Request failed",
        text: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // memoized preview source validity (avoid recalculating)
  const tempImageIsValid = useMemo(() => isImageUrl(tempInput.imageUrl), [tempInput.imageUrl]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Add OTT Service
                </MDTypography>
              </MDBox>

              <MDBox pt={3} px={2} sx={{ paddingBottom: "24px" }}>
                <form noValidate onSubmit={handleSubmit}>
                  <TextField
                    label="Service Name"
                    name="ottServiceName"
                    value={service.ottServiceName}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    error={Boolean(errors.ottServiceName)}
                    helperText={errors.ottServiceName}
                  />

                  <TextField
                    label="Description"
                    name="description"
                    value={service.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={3}
                    sx={{ mb: 2 }}
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                  />

                  <FormControl fullWidth sx={{ mb: 2, height: 55 }}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      label="Category"
                      name="category"
                      value={service.category}
                      onChange={handleChange}
                      sx={{ mb: 2, height: 55 }}
                    >
                      {CATEGORIES.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <MDTypography variant="caption" color="error">
                        {errors.category}
                      </MDTypography>
                    )}
                  </FormControl>

                  {/* Plan Durations Section */}
                  <MDTypography variant="h6" sx={{ fontWeight: "bold", mt: 3 }}>
                    Plan Durations
                  </MDTypography>

                  <MDTypography variant="subtitle2" sx={{ mb: 1, color: "gray" }}>
                    Add Duration & Price
                  </MDTypography>

                  <Box sx={{ display: "flex", gap: 1, mb: 1, mt: 1, flexWrap: "wrap" }}>
                    <TextField
                      size="small"
                      label="Duration (e.g. 1 month)"
                      value={tempInput.planDuration}
                      onChange={(e) =>
                        setTempInput((p) => ({ ...p, planDuration: e.target.value }))
                      }
                      helperText={errors.planDuration}
                      error={Boolean(errors.planDuration)}
                      sx={{ flex: 1, minWidth: 160 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPlanDuration();
                        }
                      }}
                    />
                    <TextField
                      size="small"
                      label="Sub Price"
                      value={tempInput.planPrice}
                      onChange={(e) => setTempInput((p) => ({ ...p, planPrice: e.target.value }))}
                      helperText={errors.planPrice}
                      error={Boolean(errors.planPrice)}
                      sx={{ width: 140 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPlanDuration();
                        }
                      }}
                    />
                    <FormControl size="small" sx={{ width: 150 }}>
                      <InputLabel id="plan-stock-label">Stock</InputLabel>
                      <Select
                        labelId="plan-stock-label"
                        label="Stock"
                        value={tempInput.planStock}
                        onChange={(e) => setTempInput((p) => ({ ...p, planStock: e.target.value }))}
                      >
                        {STOCK_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addPlanDuration}
                      style={{ color: "black", height: 40 }}
                    >
                      Add
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    {service.planDurations.map((pd, i) => (
                      <Box
                        key={pd.duration + i}
                        sx={{
                          px: 1,
                          py: 0.7,
                          borderRadius: 1,
                          border: "1px solid rgba(0,0,0,0.06)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.8,
                        }}
                      >
                        <MDTypography variant="caption" sx={{ fontWeight: 500 }}>
                          {pd.duration}
                        </MDTypography>
                        <MDTypography variant="caption">| Price: {pd.price}</MDTypography>
                        <MDTypography
                          variant="caption"
                          sx={{
                            color: pd.stockStatus === "InStock" ? "green" : "red",
                          }}
                        >
                          | {pd.stockStatus === "InStock" ? "In Stock" : "Out of Stock"}
                        </MDTypography>
                        <IconButton size="small" onClick={() => removePlanDuration(i)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  {/* images array */}
                  <MDTypography variant="subtitle2">Images (optional)</MDTypography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1, mt: 1 }}>
                    <TextField
                      size="small"
                      label="Image URL"
                      value={tempInput.imageUrl}
                      onChange={(e) => setTempInput((p) => ({ ...p, imageUrl: e.target.value }))}
                      helperText={errors.imageUrl}
                      error={Boolean(errors.imageUrl)}
                      sx={{ flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addImage}
                      style={{ color: "black" }}
                    >
                      Add
                    </Button>
                  </Box>

                  {/* live preview for url being typed */}
                  {tempInput.imageUrl && tempImageIsValid && (
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <img
                        src={tempInput.imageUrl}
                        alt="temp-preview"
                        style={{
                          width: 140,
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                        onError={(e) => {
                          // hide broken images by swapping src to empty
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </Box>
                  )}

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    {service.images.map((img, i) => (
                      <Box
                        key={img + i}
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          border: "1px solid rgba(0,0,0,0.15)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          width: 120,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={img}
                          alt={`preview-${i}`}
                          style={{
                            width: "100%",
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 4,
                            background: "#f6f6f6",
                          }}
                          onError={(e) => {
                            // show fallback text if image fails
                            e.currentTarget.style.display = "none";
                          }}
                        />

                        <MDTypography
                          variant="caption"
                          sx={{
                            mt: 1,
                            wordBreak: "break-all",
                            textAlign: "center",
                            fontSize: "10px",
                          }}
                        >
                          {img}
                        </MDTypography>

                        <IconButton
                          size="small"
                          onClick={() => removeImage(i)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            backgroundColor: "rgba(255,255,255,0.8)",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  {/* access license types */}
                  <MDTypography variant="subtitle2">Access License Types (optional)</MDTypography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1, mt: 1 }}>
                    <TextField
                      size="small"
                      label="e.g. Single-user, Family"
                      value={tempInput.licenseType}
                      onChange={(e) => setTempInput((p) => ({ ...p, licenseType: e.target.value }))}
                      helperText={errors.licenseType}
                      error={Boolean(errors.licenseType)}
                      sx={{ flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLicenseType();
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addLicenseType}
                      style={{ color: "black" }}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    {service.accessLicenseTypes.map((lt, i) => (
                      <Box
                        key={lt + i}
                        sx={{
                          px: 1,
                          py: 0.4,
                          borderRadius: 1,
                          border: "1px solid rgba(0,0,0,0.06)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <MDTypography variant="caption">{lt}</MDTypography>
                        <IconButton size="small" onClick={() => removeLicenseType(i)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Video-only Quality (optional)"
                        name="videoQuality"
                        value={service.videoQuality}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Price"
                        name="price"
                        value={service.price}
                        onChange={handleChange}
                        fullWidth
                        error={Boolean(errors.price)}
                        helperText={errors.price}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Discounted Price (optional)"
                        name="discountedPrice"
                        value={service.discountedPrice}
                        onChange={handleChange}
                        fullWidth
                        error={Boolean(errors.discountedPrice)}
                        helperText={errors.discountedPrice}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ color: "#FFFFFF", height: 48 }}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? "Submitting..." : "Create OTT Service"}
                  </Button>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
