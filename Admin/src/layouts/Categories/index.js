import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import FormControl from "@mui/material/FormControl";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const DEFAULT_ICON =
  "https://img.freepik.com/premium-vector/no-photo-available-vector-icon-default-image-symbol-picture-coming-soon-web-site-mobile-app_87543-18055.jpg";

/* small meta chip */
const MetaChip = ({ label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
    <Typography variant="caption" sx={{ color: "text.secondary" }}>
      {label}:
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

MetaChip.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

function CategoryCard({ category, onDelete, deletingId }) {
  const isDeleting = deletingId === category._id;

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
        transition: "transform 200ms, box-shadow 200ms",
        "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 30px rgba(15,23,42,0.12)" },
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height={140}
          image={category.categoriesIcon || category.menuIcon || DEFAULT_ICON}
          alt={category.name || "Category icon"}
          sx={{
            width: "100%",
            height: 140,
            objectFit: "contain",
            backgroundColor: "#fafafa",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
            padding: 1,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          component="h3"
          variant="h6"
          sx={{
            fontSize: 16,
            fontWeight: 700,
            mb: 0.5,
            lineHeight: 1.2,
            minHeight: "44px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {category.name || "Untitled Category"}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: 13,
            mb: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minHeight: 38,
          }}
        >
          {category.description || "No description provided."}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <MetaChip label="Main" value={category.isMain ? "Yes" : "No"} />
          <MetaChip label="Parent" value={category.parent ? category.parent : "—"} />
          <MetaChip label="Order" value={category.order ?? "0"} />
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between", alignItems: "center" }}>
        <Box />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Link to={`/EditCategory/${category._id}`} style={{ textDecoration: "none" }}>
            <IconButton size="small" color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Link>

          <IconButton
            size="small"
            onClick={() => onDelete && onDelete(category._id)}
            sx={{ color: "error.main" }}
            disabled={isDeleting}
            aria-label={isDeleting ? "Deleting category" : "Delete category"}
          >
            {isDeleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
}

CategoryCard.propTypes = {
  category: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  deletingId: PropTypes.string,
};

export default function CategoriesGridView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = process.env.REACT_APP_API_HOST || "";

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Deleting indicator
  const [deletingId, setDeletingId] = useState(null);

  // Endpoint for categories (adjust if your server uses different route)
  const CATEGORIES_ENDPOINT = `${apiBase}/Categories`;

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await axios.get(CATEGORIES_ENDPOINT);
        const data = res?.data;
        if (mounted) {
          if (Array.isArray(data)) {
            // reverse so newest appear first (same behavior as original)
            setCategories(data.slice().reverse());
          } else {
            setCategories([]);
            // eslint-disable-next-line no-console
            console.warn("/Categories returned non-array", data);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching categories", err);
        if (mounted) setError("Failed to fetch categories.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
    // include CATEGORIES_ENDPOINT in deps so hooks linter is satisfied
  }, [CATEGORIES_ENDPOINT]);

  // Keep page within bounds when categories length or rowsPerPage change
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(categories.length / rowsPerPage));
    if (page > totalPages) setPage(totalPages);
  }, [categories.length, rowsPerPage, page]);

  const handleDelete = async (id) => {
    if (!id) {
      console.warn("handleDelete called without id");
      Swal.fire("Error!", "Invalid category id.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);
      await axios.delete(`${CATEGORIES_ENDPOINT}/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      Swal.fire("Deleted!", "The category has been deleted.", "success");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error deleting category", err);
      Swal.fire("Error!", "There was an issue deleting the category.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(categories.length / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const visibleCategories = categories.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

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
          <Typography color="error" align="center">
            {error}
          </Typography>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">Categories</MDTypography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Link to="/AddCategory" style={{ textDecoration: "none" }}>
              <Button variant="contained" startIcon={<AddIcon />}>
                Add Category
              </Button>
            </Link>

            {/* optional: rows per page control (left empty for now) */}
            <FormControl size="small" sx={{ minWidth: 120 }}></FormControl>
          </Box>
        </MDBox>

        <Grid container spacing={3}>
          {visibleCategories.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6">No categories found.</Typography>
                <Typography variant="caption" color="text.secondary">
                  Click &quot;Add Category&quot; to create your first category.
                </Typography>
              </Card>
            </Grid>
          ) : (
            visibleCategories.map((category) => (
              <Grid item key={category._id} xs={12} sm={6} md={4} lg={3}>
                <CategoryCard category={category} onDelete={handleDelete} deletingId={deletingId} />
              </Grid>
            ))
          )}
        </Grid>

        {categories.length > 0 && (
          <MDBox mt={4} display="flex" justifyContent="center" alignItems="center" gap={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </MDBox>
        )}
      </MDBox>
    </DashboardLayout>
  );
}
