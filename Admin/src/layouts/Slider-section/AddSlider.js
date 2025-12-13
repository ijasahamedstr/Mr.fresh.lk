import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const AddSlider = () => {
  const [loading, setLoading] = useState(false);

  const [SliderDetails, setSliderDetails] = useState({
    slidername: "",
    sliderimagelink: "",
  });

  const [errors, setErrors] = useState({
    slidername: "",
    sliderimagelink: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    // If sliderimagelink is a valid URL, show preview
    if (SliderDetails.sliderimagelink && isValidUrl(SliderDetails.sliderimagelink)) {
      setPreviewUrl(SliderDetails.sliderimagelink);
    } else {
      setPreviewUrl("");
    }
  }, [SliderDetails.sliderimagelink]);

  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      const imageExtRegex = /\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i;
      return (
        imageExtRegex.test(parsed.pathname) ||
        /^https?:\/\/.+\.(?:jpg|jpeg|png|gif|webp|svg)$/i.test(url)
      );
    } catch {
      return false;
    }
  };

  const handleChange = ({ target: { name, value } }) => {
    setSliderDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = { slidername: "", sliderimagelink: "" };
    let valid = true;

    if (!SliderDetails.slidername.trim()) {
      newErrors.slidername = "Slider name is required.";
      valid = false;
    }

    const link = SliderDetails.sliderimagelink.trim();

    if (link && !isValidUrl(link)) {
      newErrors.sliderimagelink = "Please enter a valid image URL (jpg, png, gif, webp, svg).";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    Swal.fire({
      title: "Submitting...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // send JSON only (no file upload)
      const response = await axios.post(
        `${process.env.REACT_APP_API_HOST}/slidersection`,
        SliderDetails
      );

      const apiError = response?.data?.status === 401 || response?.data?.error;

      if (!response || response.status >= 300 || apiError) {
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: "Oops...",
          text:
            response?.data?.message ||
            response?.data?.error ||
            "Slider addition failed. Please try again!",
        });
      } else {
        Swal.close();
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: response?.data?.message || "Slider added successfully!",
        });

        setSliderDetails({ slidername: "", sliderimagelink: "" });
        setPreviewUrl("");
      }
    } catch (err) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Request failed",
        text:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Slider addition failed. Please try again!",
      });
    } finally {
      setLoading(false);
    }
  };

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
                  Add New Slider
                </MDTypography>
              </MDBox>

              <MDBox pt={3} px={2} sx={{ paddingBottom: "24px" }}>
                <form onSubmit={handleSubmit} noValidate>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Slider Name"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        name="slidername"
                        value={SliderDetails.slidername}
                        onChange={handleChange}
                        error={Boolean(errors.slidername)}
                        helperText={errors.slidername}
                      />

                      <TextField
                        label="Slider Image Link (optional)"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        name="sliderimagelink"
                        value={SliderDetails.sliderimagelink}
                        onChange={handleChange}
                        error={Boolean(errors.sliderimagelink)}
                        helperText={
                          errors.sliderimagelink ||
                          "Use a direct image URL (jpg, png, gif, webp, svg)."
                        }
                      />

                      <Box sx={{ mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ color: "#FFFFFF", height: 48 }}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                          {loading ? "Submitting..." : "Submit"}
                        </Button>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Image preview
                      </Typography>

                      <Box
                        sx={{
                          width: "100%",
                          minHeight: 180,
                          borderRadius: 2,
                          border: "1px dashed rgba(0,0,0,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          p: 1,
                        }}
                      >
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Slider image preview"
                            style={{
                              maxWidth: "100%",
                              maxHeight: 320,
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            align="center"
                            sx={{ px: 2 }}
                          >
                            No image selected. Enter an image URL on the left to preview it here.
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Tip: provide a direct image URL (no upload). The component will send the URL
                        to your API on submit.
                      </Typography>
                    </Grid>
                  </Grid>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default AddSlider;
