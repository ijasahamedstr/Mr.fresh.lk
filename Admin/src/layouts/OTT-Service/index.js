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
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const DEFAULT_IMAGE =
  "https://img.freepik.com/premium-vector/no-photo-available-vector-icon-default-image-symbol-picture-coming-soon-web-site-mobile-app_87543-18055.jpg";

const CATEGORIES = [
  "All",
  "AI",
  "Digital Key",
  "Games",
  "OTT",
  "Premium Account",
  "Streaming Combos",
  "Utilities",
  "VPN",
];

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

/**
 * Safely convert durations into a human-readable label.
 * Supports:
 *  - planDurations: ["1 month", "3 months"]
 *  - planDurations: [{ duration, price, stockStatus }]
 *  - mainHeadings: [{ planDurations, Price: [...] }]
 */
const getPlanDurationsLabel = (item) => {
  const pd = item?.planDurations;
  const mh = item?.mainHeadings;

  // 1) Prefer planDurations if present
  if (Array.isArray(pd) && pd.length > 0) {
    // if strings
    if (typeof pd[0] === "string") {
      return pd.join(", ");
    }

    // if objects
    const durations = pd
      .map((p) => (p && p.duration ? String(p.duration).trim() : ""))
      .filter(Boolean);

    if (durations.length) return durations.join(", ");
  }

  // 2) Fallback: mainHeadings
  if (Array.isArray(mh) && mh.length > 0) {
    const durations = mh
      .map((h) => (h && h.planDurations ? String(h.planDurations).trim() : ""))
      .filter(Boolean);

    if (durations.length) return durations.join(", ");
  }

  return "—";
};

function ServiceCard({ item, onDelete, deletingId }) {
  const isDeleting = deletingId === item._id;

  // choose first image if available
  const cover =
    (item.images && item.images.length && item.images[0]) || item.image || DEFAULT_IMAGE;

  // readable plan durations (uses planDurations or mainHeadings)
  const plans = getPlanDurationsLabel(item);

  const priceLabel =
    item.price != null
      ? item.discountedPrice != null
        ? `LKR ${item.discountedPrice} (was ${item.price})`
        : `LKR ${item.price}`
      : "Free";

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
          height={160}
          image={cover}
          alt={item.ottServiceName || "Service image"}
          sx={{
            width: "100%",
            height: 160,
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
          {item.ottServiceName || "Untitled"}
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
          {item.description || "No description provided."}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <MetaChip label="Price" value={priceLabel} />
          <MetaChip label="Plans" value={plans} />
          <MetaChip label="Category" value={item.category || "—"} />
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between", alignItems: "center" }}>
        <Box />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Link to={`/EditOTT/${item._id}`} style={{ textDecoration: "none" }}>
            <IconButton size="small" color="primary" aria-label="Edit service">
              <EditIcon fontSize="small" />
            </IconButton>
          </Link>

          <IconButton
            size="small"
            onClick={() => onDelete && onDelete(item._id)}
            sx={{ color: "error.main" }}
            disabled={isDeleting}
            aria-label={isDeleting ? "Deleting" : "Delete"}
          >
            {isDeleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
}

ServiceCard.propTypes = {
  item: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  deletingId: PropTypes.string,
};

export default function OttServiceGridView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = process.env.REACT_APP_API_HOST || "";

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Deleting indicator
  const [deletingId, setDeletingId] = useState(null);

  const OTT_ENDPOINT = `${apiBase}/Ottservice`;

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await axios.get(OTT_ENDPOINT);
        const data = res?.data;
        if (mounted) {
          if (Array.isArray(data)) setItems(data.slice().reverse());
          else {
            setItems([]);
            console.warn("/Ottservice returned non-array", data);
          }
        }
      } catch (err) {
        console.error("Error fetching ott services", err);
        if (mounted) setError("Failed to fetch services.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [OTT_ENDPOINT]);

  // Get plain text of durations for search, from planDurations or mainHeadings
  const getPlanDurationsText = (it) => {
    const pd = it?.planDurations;
    const mh = it?.mainHeadings;

    // from planDurations
    if (Array.isArray(pd) && pd.length > 0) {
      if (typeof pd[0] === "string") return pd.join(" ");
      return pd
        .map((p) => (p && p.duration ? String(p.duration).trim() : ""))
        .filter(Boolean)
        .join(" ");
    }

    // from mainHeadings
    if (Array.isArray(mh) && mh.length > 0) {
      return mh
        .map((h) => (h && h.planDurations ? String(h.planDurations).trim() : ""))
        .filter(Boolean)
        .join(" ");
    }

    return "";
  };

  // Filtered list based on category and search
  const normalized = (s = "") => String(s).toLowerCase();
  const filteredItems = items.filter((it) => {
    const category = it.category || "";
    const matchesCategory =
      selectedCategory === "All" || normalized(category) === normalized(selectedCategory);

    const planDurationsText = getPlanDurationsText(it);

    const text = `${it.ottServiceName || ""} ${
      it.description || ""
    } ${category} ${planDurationsText}`;
    const matchesSearch = normalized(text).includes(normalized(searchTerm));

    return matchesCategory && matchesSearch;
  });

  // keep pagination in sync with filtered results
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
    if (page > totalPages) setPage(totalPages);
  }, [filteredItems.length, rowsPerPage, page]);

  const handleDelete = async (id) => {
    if (!id) {
      console.warn("handleDelete called without id");
      Swal.fire("Error!", "Invalid id.", "error");
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
      await axios.delete(`${OTT_ENDPOINT}/${id}`);
      setItems((prev) => prev.filter((c) => c._id !== id));
      Swal.fire("Deleted!", "The service has been deleted.", "success");
    } catch (err) {
      console.error("Error deleting service", err);
      Swal.fire("Error!", "There was an issue deleting.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const visibleItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
        >
          <MDTypography variant="h6">OTT Services</MDTypography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: { xs: 2, md: 0 } }}>
            <Link to="/AddOTT" style={{ textDecoration: "none" }}>
              <Button variant="contained" startIcon={<AddIcon />}>
                Add Service
              </Button>
            </Link>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <TextField
                size="small"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormControl>
          </Box>
        </MDBox>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              color={cat === selectedCategory ? "primary" : "default"}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
            />
          ))}
        </Stack>

        <Grid container spacing={3}>
          {visibleItems.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6">No services found.</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedCategory === "All"
                    ? 'Click "Add Service" to create your first service.'
                    : `No services found for "${selectedCategory}".`}
                </Typography>
              </Card>
            </Grid>
          ) : (
            visibleItems.map((item) => (
              <Grid item key={item._id} xs={12} sm={6} md={4} lg={3}>
                <ServiceCard item={item} onDelete={handleDelete} deletingId={deletingId} />
              </Grid>
            ))
          )}
        </Grid>

        {filteredItems.length > 0 && (
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
