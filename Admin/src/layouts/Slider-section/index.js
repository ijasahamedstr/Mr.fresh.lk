import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

// Ant Design Image
import { Image } from "antd";

/* ---------------- Helper components ---------------- */
const Author = ({ name, style }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1}>
    <MDBox ml={2} lineHeight={1}>
      <MDTypography variant="button" fontWeight="medium" style={style}>
        {name}
      </MDTypography>
    </MDBox>
  </MDBox>
);

Author.propTypes = {
  name: PropTypes.string.isRequired,
  style: PropTypes.object,
};

Author.defaultProps = {
  style: {},
};

const SubText = ({ text }) => (
  <MDBox lineHeight={1} textAlign="left">
    <MDTypography variant="caption" color="text" fontWeight="medium">
      {text}
    </MDTypography>
  </MDBox>
);

SubText.propTypes = {
  text: PropTypes.string.isRequired,
};

/* ---------------- Component ---------------- */
function SliderSectionView() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = process.env.REACT_APP_API_HOST || "";

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiBase}/slidersection`);
        const data = response?.data;
        if (mounted) {
          if (Array.isArray(data)) {
            // show newest first (FILO)
            setSliders(data.slice().reverse());
          } else {
            setSliders([]);
            // eslint-disable-next-line no-console
            console.warn("slidersection endpoint returned non-array:", data);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching sliders: ", err);
        if (mounted) setError("Failed to fetch sliders.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [apiBase]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${apiBase}/slidersection/${id}`);
        setSliders((prev) => prev.filter((s) => s._id !== id));
        Swal.fire("Deleted!", "The slider has been deleted.", "success");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error deleting slider: ", err);
        Swal.fire("Error!", "There was an issue deleting the slider.", "error");
      }
    }
  };

  const columns = [
    { Header: "Slider Name", accessor: "Slider_Name", width: "35%", align: "left" },
    { Header: "Image", accessor: "Slider_Image", width: "30%", align: "center" },
    { Header: "Date", accessor: "Slider_Date", width: "15%", align: "left" },
    { Header: "Action", accessor: "action", width: "20%", align: "center" },
  ];

  const rows = sliders.map((item) => ({
    Slider_Name: (
      <Author
        name={item.slidername || "—"}
        style={{ fontFamily: "Tajawal, sans-serif", fontSize: "16px" }}
      />
    ),
    Slider_Image: (
      <MDBox display="flex" alignItems="center" justifyContent="center">
        <Image.PreviewGroup>
          <Image
            src={
              item.sliderimagelink ||
              "https://img.freepik.com/premium-vector/no-photo-available-vector-icon-default-image-symbol-picture-coming-soon-web-site-mobile-app_87543-18055.jpg"
            }
            alt={item.slidername || "Slider image"}
            style={{
              maxWidth: "200px",
              maxHeight: "120px",
              objectFit: "cover",
              borderRadius: 8,
            }}
            placeholder={<div style={{ width: 200, height: 120 }} />}
          />
        </Image.PreviewGroup>
      </MDBox>
    ),
    Slider_Date: <SubText text={item.date || "—"} />,
    action: (
      <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
        <Link to={`/EditSlider/${item._id}`} style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<EditIcon />}
            sx={{
              textTransform: "none",
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#1565c0" },
            }}
          >
            Edit
          </Button>
        </Link>

        <Button
          variant="contained"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={() => handleDelete(item._id)}
          sx={{
            textTransform: "none",
            backgroundColor: "#d32f2f",
            "&:hover": { backgroundColor: "#c62828" },
          }}
        >
          Delete
        </Button>
      </MDBox>
    ),
  }));

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          pt={6}
          pb={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography color="error" variant="h6" align="center">
            {error}
          </MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

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
                flexWrap="wrap"
              >
                <MDTypography variant="h6" color="white">
                  Slider Section
                </MDTypography>

                <Link to="/AddSlider" style={{ textDecoration: "none" }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{
                      textTransform: "none",
                      backgroundColor: "#ffffff",
                      color: "black",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                  >
                    Add New
                  </Button>
                </Link>
              </MDBox>

              <MDBox pt={3}>
                {sliders.length === 0 ? (
                  <MDBox p={4} textAlign="center">
                    <MDTypography variant="h6">No sliders found.</MDTypography>
                    <MDTypography variant="caption" color="text">
                      Click &quot;Add New&quot; to create your first slider.
                    </MDTypography>
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={5}
                    showTotalEntries
                    pagination
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default SliderSectionView;
