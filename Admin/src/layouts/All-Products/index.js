import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";

/* ---------------- MUI ---------------- */
import { Card, Box, Chip, IconButton, Divider, CircularProgress, Button } from "@mui/material";

/* ---------------- ICONS ---------------- */
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

/* ---------------- DASHBOARD ---------------- */
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

/* =========================================================
   LKR FORMAT
========================================================= */
const formatLKR = (value) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(value || 0);

/* =========================================================
   PRODUCT ITEM
========================================================= */
function ProductItem({ product, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <Card sx={{ mb: 2, p: 2, borderRadius: 2 }}>
      {/* BASIC INFO */}
      <Box display="flex" justifyContent="space-between">
        <Box>
          <MDTypography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>{product.name}</MDTypography>

          <MDTypography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
            Category: {product.category}
          </MDTypography>

          <MDTypography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#1b5e20" }}>
            {formatLKR(product.price)}
          </MDTypography>

          <Box display="flex" gap={0.5} mt={0.5}>
            <Chip label={`Qty: ${product.quantity}`} size="small" />
            {product.soldOut && <Chip label="Sold Out" size="small" color="error" />}
            {!product.visibility && <Chip label="Hidden" size="small" />}
          </Box>
        </Box>

        {/* ACTIONS */}
        <Box>
          <IconButton
            size="small"
            color="primary"
            component="a"
            href={`/EditProduct/${product._id}`}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" color="error" onClick={() => onDelete(product._id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* DETAILS */}
      {open && (
        <>
          <Divider sx={{ my: 1.5 }} />

          <Box display="grid" gridTemplateColumns="repeat(2,1fr)" gap={1}>
            <Detail label="SKU" value={product.sku} />
            <Detail label="Weight" value={product.weight} />
            <Detail label="Original Price" value={formatLKR(product.originalPrice)} />
            <Detail label="Track Qty" value={product.trackQty ? "Yes" : "No"} />
            <Detail label="Min / Max Qty" value={`${product.minQty} / ${product.maxQty}`} />
            <Detail label="Tags" value={product.tags} />
          </Box>

          <Box mt={1}>
            <Detail label="Description" value={product.description} />
          </Box>

          {product.images?.length > 0 && (
            <Box mt={2}>
              <MDTypography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Product Images
              </MDTypography>
              <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                {product.images.map((img, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={img}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 1,
                      border: "1px solid #ddd",
                      objectFit: "cover",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {product.variants?.length > 0 && (
            <Box mt={2}>
              <MDTypography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Variants</MDTypography>

              {product.variants.map((v, i) => (
                <Box key={i} mt={1} p={1.5} border="1px solid #eee" borderRadius={1.5}>
                  <MDTypography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>{v.name}</MDTypography>

                  <MDTypography sx={{ fontSize: "0.8rem", color: "#1b5e20" }}>
                    {formatLKR(v.price)}
                  </MDTypography>

                  <Box display="grid" gridTemplateColumns="repeat(2,1fr)" gap={0.5} mt={0.5}>
                    <Detail label="SKU" value={v.sku} />
                    <Detail label="Qty" value={v.quantity} />
                    <Detail label="Weight" value={v.weight} />
                    <Detail label="Sold Out" value={v.soldOut ? "Yes" : "No"} />
                  </Box>

                  {v.images?.length > 0 && (
                    <Box mt={1}>
                      <MDTypography sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
                        Variant Images
                      </MDTypography>
                      <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                        {v.images.map((img, idx) => (
                          <Box
                            key={idx}
                            component="img"
                            src={img}
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: 1,
                              border: "1px solid #ccc",
                              objectFit: "cover",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Card>
  );
}

ProductItem.propTypes = {
  product: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function Detail({ label, value }) {
  return (
    <Box>
      <MDTypography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{label}</MDTypography>
      <MDTypography sx={{ fontSize: "0.75rem", fontWeight: 500 }}>{value || "-"}</MDTypography>
    </Box>
  );
}

Detail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
};

/* MAIN PAGE */
export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.REACT_APP_API_HOST || "";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${apiBase}/Products`);
        setProducts(res.data || []);
      } catch {
        Swal.fire("Error", "Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiBase]);

  const deleteProduct = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    await axios.delete(`${apiBase}/Products/${id}`);
    setProducts((p) => p.filter((x) => x._id !== id));
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
        {/* TITLE + ADD BUTTON */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <MDTypography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>Products</MDTypography>

          <Button
            variant="contained"
            size="small"
            component="a"
            href="/AddProduct"
            sx={{
              color: "#000", // ✅ BLACK TEXT
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                color: "#000",
              },
            }}
          >
            Add Product
          </Button>
        </Box>

        {products.map((product) => (
          <ProductItem key={product._id} product={product} onDelete={deleteProduct} />
        ))}
      </MDBox>
    </DashboardLayout>
  );
}
