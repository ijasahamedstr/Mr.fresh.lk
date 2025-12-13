import React, { useState } from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import axios from "axios";
import Swal from "sweetalert2";

// Material Dashboard components
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
function CategoryNode({ node, onAddChild, onDelete }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");

  return (
    <Box ml={3} mt={1}>
      <Box display="flex" alignItems="center" gap={1}>
        <MDTypography variant="button">{node.title}</MDTypography>

        {node.icon && (
          <Box
            component="img"
            src={node.icon}
            alt="icon"
            sx={{ width: 18, height: 18, borderRadius: "50%" }}
          />
        )}

        <IconButton size="small" onClick={() => setOpen(!open)}>
          <AddIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" onClick={() => onDelete(node.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {open && (
        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
          <TextField
            size="small"
            label="Subcategory Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            size="small"
            label="Icon URL"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              if (!title.trim()) return;
              onAddChild(node.id, title.trim(), icon.trim());
              setTitle("");
              setIcon("");
              setOpen(false);
            }}
          >
            Add
          </Button>
        </Box>
      )}

      {node.children.map((child) => (
        <CategoryNode key={child.id} node={child} onAddChild={onAddChild} onDelete={onDelete} />
      ))}
    </Box>
  );
}

/* ---------------------------------------------
   PropTypes
--------------------------------------------- */
CategoryNode.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
    children: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  onAddChild: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/* ---------------------------------------------
   Main Component
--------------------------------------------- */
export default function AddCategory() {
  const [tree, setTree] = useState([]);
  const [mainTitle, setMainTitle] = useState("");
  const [mainIcon, setMainIcon] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBase = process.env.REACT_APP_API_HOST || "";

  /* -------- Tree Operations -------- */
  const addMainCategory = () => {
    if (!mainTitle.trim()) return;

    setTree((prev) => [
      ...prev,
      {
        id: uid(),
        title: mainTitle.trim(),
        icon: mainIcon.trim(),
        children: [],
      },
    ]);

    setMainTitle("");
    setMainIcon("");
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

  const deleteNode = (id) => {
    const recursiveDelete = (nodes) =>
      nodes
        .filter((n) => n.id !== id)
        .map((n) => ({ ...n, children: recursiveDelete(n.children) }));

    setTree((prev) => recursiveDelete(prev));
  };

  /* -------- Submit -------- */
  const handleSubmit = async () => {
    if (tree.length === 0) {
      Swal.fire("Error", "Add at least one category", "error");
      return;
    }

    setLoading(true);
    Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

    try {
      await axios.post(`${apiBase}/Categorysection`, {
        categories: tree,
      });

      Swal.fire("Success", "Categories saved successfully", "success");
      setTree([]);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to save categories", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={2} px={2} bgColor="info" borderRadius="lg">
                <MDTypography color="white">Add Categories (Tree)</MDTypography>
              </MDBox>

              <MDBox p={3}>
                {/* Main Category */}
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <TextField
                    fullWidth
                    size="small"
                    label="Main Category Name"
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Icon URL"
                    value={mainIcon}
                    onChange={(e) => setMainIcon(e.target.value)}
                  />
                  <Button variant="contained" startIcon={<AddIcon />} onClick={addMainCategory}>
                    Add
                  </Button>
                </Box>

                {/* Category Tree */}
                {tree.length === 0 ? (
                  <MDTypography variant="caption">No categories added yet</MDTypography>
                ) : (
                  tree.map((node) => (
                    <CategoryNode
                      key={node.id}
                      node={node}
                      onAddChild={addChild}
                      onDelete={deleteNode}
                    />
                  ))
                )}

                <Button
                  fullWidth
                  sx={{ mt: 3 }}
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} /> : null}
                >
                  {loading ? "Saving..." : "Save Categories"}
                </Button>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
