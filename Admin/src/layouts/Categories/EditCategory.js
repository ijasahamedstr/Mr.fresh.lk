import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

/* ---------------------------------------------
   Utility
--------------------------------------------- */
const uid = () => Math.random().toString(36).substring(2, 9);

/* ---------------------------------------------
   Recursive Category Node
--------------------------------------------- */
function CategoryNode({ node, onUpdate, onAddChild, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <Box ml={3} mt={1}>
      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
        <TextField
          size="small"
          label="Title"
          value={node.title}
          onChange={(e) => onUpdate(node.id, "title", e.target.value)}
        />

        <TextField
          size="small"
          label="Icon URL"
          value={node.icon || ""}
          onChange={(e) => onUpdate(node.id, "icon", e.target.value)}
        />

        <IconButton size="small" sx={{ color: "#1A73E8" }} onClick={() => setOpen(!open)}>
          <AddIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" sx={{ color: "#d32f2f" }} onClick={() => onDelete(node.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {open && (
        <Box mt={1}>
          <Button
            size="small"
            variant="outlined"
            sx={{
              color: "#1A73E8",
              borderColor: "#1A73E8",
              "&:hover": {
                borderColor: "#1558b0",
                backgroundColor: "rgba(26,115,232,0.04)",
              },
            }}
            onClick={() => {
              onAddChild(node.id, "New Sub Category", "");
              setOpen(false);
            }}
          >
            Add Child
          </Button>
        </Box>
      )}

      {Array.isArray(node.children) &&
        node.children.map((child) => (
          <CategoryNode
            key={child.id}
            node={child}
            onUpdate={onUpdate}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        ))}
    </Box>
  );
}

CategoryNode.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
    children: PropTypes.array.isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onAddChild: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/* ---------------------------------------------
   Main Edit Component
--------------------------------------------- */
export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.REACT_APP_API_HOST || "";

  /* -------- Load Category Tree -------- */
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await axios.get(`${apiBase}/Categorysection/${id}`);
        setTree(res.data?.categories || []);
      } catch {
        Swal.fire("Error", "Failed to load category tree", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [apiBase, id]);

  /* -------- Tree Helpers -------- */
  const updateNode = (nodeId, field, value) => {
    const recursiveUpdate = (nodes) =>
      nodes.map((n) =>
        n.id === nodeId ? { ...n, [field]: value } : { ...n, children: recursiveUpdate(n.children) }
      );

    setTree((prev) => recursiveUpdate(prev));
  };

  const addChild = (parentId, title, icon) => {
    const recursiveAdd = (nodes) =>
      nodes.map((n) =>
        n.id === parentId
          ? {
              ...n,
              children: [...n.children, { id: uid(), title, icon, children: [] }],
            }
          : { ...n, children: recursiveAdd(n.children) }
      );

    setTree((prev) => recursiveAdd(prev));
  };

  const deleteNode = (nodeId) => {
    const recursiveDelete = (nodes) =>
      nodes
        .filter((n) => n.id !== nodeId)
        .map((n) => ({ ...n, children: recursiveDelete(n.children) }));

    setTree((prev) => recursiveDelete(prev));
  };

  /* -------- Save -------- */
  const handleSave = async () => {
    Swal.fire({ title: "Updating...", didOpen: () => Swal.showLoading() });

    try {
      await axios.put(`${apiBase}/Categorysection/${id}`, {
        categories: tree,
      });

      Swal.fire("Success", "Categories updated successfully", "success");
      navigate("/CategoriesTreeView");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
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
                borderRadius="lg"
                sx={{ backgroundColor: "#1A73E8" }}
              >
                <MDTypography color="white">Edit Category Tree</MDTypography>
              </MDBox>

              {/* Content */}
              <MDBox p={3}>
                {tree.length === 0 ? (
                  <MDTypography variant="caption">No categories found</MDTypography>
                ) : (
                  tree.map((node) => (
                    <CategoryNode
                      key={node.id}
                      node={node}
                      onUpdate={updateNode}
                      onAddChild={addChild}
                      onDelete={deleteNode}
                    />
                  ))
                )}

                <Button
                  fullWidth
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    mt: 3,
                    backgroundColor: "#1A73E8",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#1558b0",
                    },
                  }}
                >
                  Save Changes
                </Button>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
