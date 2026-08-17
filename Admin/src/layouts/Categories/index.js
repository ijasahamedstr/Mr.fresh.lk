import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

// Material Dashboard
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

/* ---------------------------------------------
   Recursive Tree Node
--------------------------------------------- */
function TreeNode({ node }) {
  return (
    <Box ml={2} mt={0.5}>
      <Box display="flex" alignItems="center" gap={1}>
        <MDTypography variant="button" fontSize="0.8rem">
          {node.title}
        </MDTypography>

        {node.icon && (
          <Box
            component="img"
            src={node.icon}
            alt="icon"
            sx={{ width: 14, height: 14, borderRadius: "50%" }}
          />
        )}
      </Box>

      {Array.isArray(node.children) &&
        node.children.map((child) => <TreeNode key={child.id} node={child} />)}
    </Box>
  );
}

TreeNode.propTypes = {
  node: PropTypes.object.isRequired,
};

/* ---------------------------------------------
   MAIN VIEW
--------------------------------------------- */
export default function CategoriesTreeView() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.REACT_APP_API_HOST || "";

  /* -------- Fetch ALL Category Sections -------- */
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await axios.get(`${apiBase}/Categorysection`);
        setSections(Array.isArray(res.data) ? res.data : []);
      } catch {
        Swal.fire("Error", "Failed to load categories", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [apiBase]);

  /* -------- Delete ONE Category Tree -------- */
  const deleteSection = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this category tree?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${apiBase}/Categorysection/${id}`);
      setSections((prev) => prev.filter((item) => item._id !== id));
      Swal.fire("Deleted", "Category tree deleted successfully", "success");
    } catch {
      Swal.fire("Error", "Failed to delete category tree", "error");
    }
  };

  /* -------- Loading -------- */
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

  /* -------- UI -------- */
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              {/* Header */}
              <MDBox
                mx={2}
                mt={-3}
                py={2}
                px={2}
                bgColor="info"
                borderRadius="lg"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography color="white">Category Trees</MDTypography>

                <Button
                  component="a"
                  href="/AddCategory"
                  startIcon={<AddIcon />}
                  variant="contained"
                  color="success"
                >
                  Add
                </Button>
              </MDBox>

              {/* Content */}
              <MDBox p={3}>
                <Grid container spacing={2}>
                  {sections.length === 0 ? (
                    <Grid item xs={12}>
                      <MDTypography variant="caption">No categories available</MDTypography>
                    </Grid>
                  ) : (
                    sections.map((section, index) => (
                      <Grid
                        key={section._id}
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={2.4} // ✅ 5 cards per row
                      >
                        <Card
                          sx={{
                            height: "100%",
                            borderRadius: 3,
                            border: "1px solid #eee",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                          }}
                        >
                          {/* Card Header */}
                          <MDBox
                            px={1.5}
                            py={1}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <MDTypography variant="button">Tree #{index + 1}</MDTypography>

                            <Box display="flex">
                              <IconButton
                                size="small"
                                color="primary"
                                component="a"
                                href={`/EditCategory/${section._id}`}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>

                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteSection(section._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </MDBox>

                          <Divider />

                          {/* Tree */}
                          <MDBox p={1}>
                            {Array.isArray(section.categories) &&
                              section.categories.map((node) => (
                                <TreeNode key={node.id} node={node} />
                              ))}
                          </MDBox>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
