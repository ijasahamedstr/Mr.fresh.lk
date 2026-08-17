import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useParams } from "react-router-dom";
import axios from "axios";
import React, { useState, useEffect } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// SweetAlert2
import Swal from "sweetalert2";

const EditSlider = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    slidername: "",
    sliderimagelink: "",
  });
  const [loading, setLoading] = useState(false);

  // preview states
  const [previewUrl, setPreviewUrl] = useState("");
  const [imgError, setImgError] = useState(false);

  // permissive image URL validator (checks scheme + common image extensions)
  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      // allow query strings and fragments
      const imageExtRegex = /\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i;
      return (
        imageExtRegex.test(parsed.pathname) ||
        /^https?:\/\/.+\.(?:jpg|jpeg|png|gif|webp|svg)$/i.test(url)
      );
    } catch {
      return false;
    }
  };

  // Handle input field changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // if editing the image link, reset preview error and update preview
    if (name === "sliderimagelink") {
      setImgError(false);
      if (isValidUrl(value.trim())) setPreviewUrl(value.trim());
      else setPreviewUrl("");
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.slidername || formData.slidername.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please provide a slider name.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        `${process.env.REACT_APP_API_HOST}/slidersection/${id}`,
        formData
      );

      setLoading(false);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: response?.data?.message || "Slider updated successfully!",
      });
    } catch (err) {
      setLoading(false);
      console.error("Update slider error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Error updating slider data. Please try again.",
      });
    }
  };

  useEffect(() => {
    const fetchSlider = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_HOST}/slidersection/${id}`);

        // Adapt to whatever shape your API returns
        const slidername = response.data.slidername || "";
        const sliderimagelink = response.data.sliderimagelink || "";

        setFormData({
          slidername,
          sliderimagelink,
        });

        // set preview if valid
        if (isValidUrl(sliderimagelink)) {
          setPreviewUrl(sliderimagelink);
          setImgError(false);
        } else {
          setPreviewUrl("");
          setImgError(false);
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("Fetch slider error:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.response?.data?.message || "Error fetching slider data. Please try again.",
        });
      }
    };

    if (id) fetchSlider();
  }, [id]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
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
                  Edit Slider
                </MDTypography>
              </MDBox>

              <MDBox pt={3} px={2} sx={{ paddingBottom: "24px" }}>
                <form onSubmit={handleSubmit}>
                  {/* Slider Name */}
                  <TextField
                    label="Slider Name"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    name="slidername"
                    value={formData.slidername}
                    onChange={handleInputChange}
                  />

                  {/* Image Link */}
                  <TextField
                    label="Slider Image Link"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    name="sliderimagelink"
                    value={formData.sliderimagelink}
                    onChange={handleInputChange}
                    helperText="Paste a direct image URL (jpg, png, gif, webp, svg)."
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ color: "#FFFFFF" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={18} sx={{ mr: 1 }} /> Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </form>
              </MDBox>
            </Card>
          </Grid>

          {/* Preview column */}
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox
                mx={2}
                mt={2}
                py={2}
                px={2}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight={220}
              >
                <MDTypography variant="subtitle1" sx={{ mb: 1 }}>
                  Image Preview
                </MDTypography>

                {loading && !previewUrl ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ width: "100%", height: 160 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : previewUrl && !imgError ? (
                  // clickable preview opens in new tab
                  <Box
                    component="a"
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "block",
                      width: "100%",
                      maxWidth: 320,
                      textDecoration: "none",
                    }}
                  >
                    <Box
                      component="img"
                      src={previewUrl}
                      alt={formData.slidername || "Slider image preview"}
                      onError={() => setImgError(true)}
                      sx={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 160,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(0,0,0,0.03)",
                      borderRadius: 1,
                      border: "1px dashed rgba(0,0,0,0.08)",
                      p: 1,
                      textAlign: "center",
                    }}
                  >
                    <MDTypography variant="caption" color="text">
                      {imgError
                        ? "Failed to load image. Check the URL."
                        : "No valid image URL — preview will appear here."}
                    </MDTypography>
                  </Box>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default EditSlider;
