import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

/**
 * EditCourse with Image + Video preview (smaller previews)
 */
export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBase = process.env.REACT_APP_API_HOST || "";

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [course, setCourse] = useState({
    courseName: "",
    courseDescription: "",
    coursePrice: "",
    duration: "",
    courseImage: "",
    coursedemovideolink: "",
    mainHeadings: [],
    subHeadingsMap: {},
    courseCategory: "",
  });

  const [errors, setErrors] = useState({});
  const [mainHeadingInput, setMainHeadingInput] = useState("");
  const [subHeadingInput, setSubHeadingInput] = useState("");
  const [selectedMainHeading, setSelectedMainHeading] = useState("");

  const availableCategories = ["Tamil", "English", "Sinhala"];

  // ---------- preview size constants (smaller) ----------
  const SMALL_IMAGE_MAX_HEIGHT = 200; // px
  const SMALL_VIDEO_MAX_HEIGHT = 240; // px
  const PREVIEW_MAX_WIDTH = 480; // px (keeps preview narrow)

  // ---------- Helpers for preview ----------
  const isImageUrl = (url) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      return /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(u.pathname);
    } catch {
      return false;
    }
  };

  const isVideoFileUrl = (url) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u.pathname);
    } catch {
      return false;
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    // support youtu.be and youtube.com/watch?v=
    try {
      const u = new URL(url);
      const hostname = u.hostname.toLowerCase();
      if (hostname.includes("youtu.be")) {
        const id = u.pathname.slice(1);
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (hostname.includes("youtube.com") || hostname.includes("youtube-nocookie.com")) {
        const params = u.searchParams;
        const v = params.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
        const pathParts = u.pathname.split("/");
        const idx = pathParts.indexOf("embed");
        if (idx !== -1 && pathParts[idx + 1])
          return `https://www.youtube.com/embed/${pathParts[idx + 1]}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  // memoize what type of preview to show for performance and clarity
  const preview = useMemo(() => {
    const imageValid = isImageUrl(course.courseImage);
    const videoEmbed = getYouTubeEmbedUrl(course.coursedemovideolink);
    const videoFile = isVideoFileUrl(course.coursedemovideolink);
    return { imageValid, videoEmbed, videoFile };
  }, [course.courseImage, course.coursedemovideolink]);

  // ---------- fetch course ----------
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`${apiBase}/Couressection/${id}`);
        const data = res?.data?.data ?? res?.data ?? null;
        if (!data) {
          await Swal.fire({ icon: "error", title: "Not found", text: "Course not found." });
          navigate(-1);
          return;
        }

        const incomingMain = Array.isArray(data.mainHeadings) ? data.mainHeadings : [];
        const map = {};
        const mainArr = [];

        incomingMain.forEach((m) => {
          if (typeof m === "string") {
            mainArr.push(m);
            map[m] = [];
          } else {
            const heading = m.heading ?? "Untitled";
            mainArr.push(heading);
            map[heading] = Array.isArray(m.subHeadings) ? m.subHeadings.map(String) : [];
          }
        });

        if (
          Array.isArray(data.courseSubContent) &&
          mainArr.length === data.courseSubContent.length
        ) {
          data.courseSubContent.forEach((arr, i) => {
            const mh = mainArr[i];
            if (mh) map[mh] = Array.isArray(arr) ? arr.map(String) : [];
          });
        }

        setCourse({
          courseName: data.courseName ?? "",
          courseDescription: data.courseDescription ?? "",
          coursePrice: data.coursePrice ?? "",
          duration: data.duration ?? "",
          courseImage: data.courseImage ?? "",
          coursedemovideolink: data.coursedemovideolink ?? "",
          mainHeadings: mainArr,
          subHeadingsMap: map,
          courseCategory: data.courseCategory ?? "",
        });
      } catch (err) {
        console.error(err);
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text: err?.response?.data?.message || err.message || "Failed to fetch course.",
        });
        navigate(-1);
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchCourse();
    else {
      setFetching(false);
      Swal.fire({ icon: "error", title: "No ID", text: "No course id provided." });
      navigate(-1);
    }
  }, [apiBase, id, navigate]);

  // ---------- form handlers (same as before) ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddMainHeading = () => {
    const trimmed = mainHeadingInput.trim();
    if (!trimmed) {
      setErrors((prev) => ({ ...prev, mainHeadingInput: "Main heading cannot be empty." }));
      return;
    }
    if (course.mainHeadings.includes(trimmed)) {
      setErrors((prev) => ({ ...prev, mainHeadingInput: "This main heading already exists." }));
      return;
    }
    setCourse((prev) => ({
      ...prev,
      mainHeadings: [...prev.mainHeadings, trimmed],
      subHeadingsMap: { ...prev.subHeadingsMap, [trimmed]: prev.subHeadingsMap[trimmed] || [] },
    }));
    setMainHeadingInput("");
    setSelectedMainHeading(trimmed);
  };

  const handleRemoveMainHeading = (index) => {
    const heading = course.mainHeadings[index];
    setCourse((prev) => {
      const newMain = prev.mainHeadings.filter((_, i) => i !== index);
      const newMap = { ...prev.subHeadingsMap };
      delete newMap[heading];
      return {
        ...prev,
        mainHeadings: newMain,
        subHeadingsMap: newMap,
      };
    });
    setSelectedMainHeading((prev) => (prev === heading ? "" : prev));
  };

  const handleAddSubHeading = () => {
    const main = selectedMainHeading;
    if (!main) {
      setErrors((prev) => ({ ...prev, selectedMainHeading: "Select a main heading first." }));
      return;
    }
    const trimmed = subHeadingInput.trim();
    if (!trimmed) {
      setErrors((prev) => ({ ...prev, subHeadingInput: "Sub-heading cannot be empty." }));
      return;
    }
    setCourse((prev) => {
      const current = prev.subHeadingsMap[main] || [];
      if (current.includes(trimmed)) {
        setErrors((prevErr) => ({
          ...prevErr,
          subHeadingInput: "This sub-heading already exists.",
        }));
        return prev;
      }
      return {
        ...prev,
        subHeadingsMap: { ...prev.subHeadingsMap, [main]: [...current, trimmed] },
      };
    });
    setSubHeadingInput("");
    setErrors((prev) => ({ ...prev, subHeadingInput: "", selectedMainHeading: "" }));
  };

  const handleRemoveSubHeading = (main, idx) => {
    setCourse((prev) => ({
      ...prev,
      subHeadingsMap: {
        ...prev.subHeadingsMap,
        [main]: prev.subHeadingsMap[main].filter((_, i) => i !== idx),
      },
    }));
  };

  // ---------- validation ----------
  const validate = () => {
    const newErrors = {};
    if (!course.courseName.trim()) newErrors.courseName = "Course name is required.";
    if (!course.courseCategory) newErrors.courseCategory = "Please select a category.";
    if (course.coursePrice === "" || course.coursePrice === null)
      newErrors.coursePrice = "Price is required.";
    else if (Number.isNaN(Number(course.coursePrice)))
      newErrors.coursePrice = "Price must be a number.";

    if (course.courseImage) {
      try {
        const u = new URL(course.courseImage);
        const ok = /\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i.test(u.pathname);
        if (!ok) newErrors.courseImage = "Main image should be a direct image URL.";
      } catch {
        newErrors.courseImage = "Main image must be a valid URL.";
      }
    }

    if (course.coursedemovideolink) {
      try {
        new URL(course.coursedemovideolink);
      } catch {
        newErrors.coursedemovideolink = "Demo video link must be a valid URL.";
      }
    }

    if (course.mainHeadings.length === 0) newErrors.mainHeadings = "Add at least one main heading.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- submit / update ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const structuredHeadings = course.mainHeadings.map((h) => ({
        heading: h,
        subHeadings: course.subHeadingsMap[h] || [],
      }));

      const payload = {
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        coursePrice: Number(course.coursePrice),
        duration: course.duration,
        courseImage: course.courseImage,
        coursedemovideolink: course.coursedemovideolink,
        courseCategory: course.courseCategory,
        mainHeadings: structuredHeadings,
      };

      const res = await axios.put(`${apiBase}/Couressection/${id}`, payload);

      Swal.close();
      if (!res || res.status >= 300 || res.data?.status === 401 || res.data?.error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.message || res?.data?.error || "Failed to update course.",
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: res?.data?.message || "Course updated successfully.",
        });
        navigate(-1);
      }
    } catch (err) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Request failed",
        text: err?.response?.data?.message || err.message || "Request failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------- delete ----------
  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Delete this course?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });
      await axios.delete(`${apiBase}/Coures/${id}`);
      Swal.close();
      await Swal.fire({ icon: "success", title: "Deleted", text: "Course deleted." });
      navigate(-1);
    } catch (err) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.response?.data?.message || err.message || "Delete failed.",
      });
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        </MDBox>
      </DashboardLayout>
    );
  }

  // ---------- UI: previews will appear under respective inputs (smaller sizes) ----------
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
                  Edit Course
                </MDTypography>
                <Box>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                </Box>
              </MDBox>

              <MDBox pt={3} px={2} sx={{ paddingBottom: "24px" }}>
                <form onSubmit={handleSubmit} noValidate>
                  <TextField
                    label="Course Name"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    name="courseName"
                    value={course.courseName}
                    onChange={handleChange}
                    error={Boolean(errors.courseName)}
                    helperText={errors.courseName}
                  />

                  <TextField
                    label="Course Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={3}
                    sx={{ mb: 2 }}
                    name="courseDescription"
                    value={course.courseDescription}
                    onChange={handleChange}
                  />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Course Price"
                        variant="outlined"
                        fullWidth
                        name="coursePrice"
                        value={course.coursePrice}
                        onChange={handleChange}
                        error={Boolean(errors.coursePrice)}
                        helperText={errors.coursePrice || "Enter numeric price (eg. 499)"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Duration"
                        variant="outlined"
                        fullWidth
                        name="duration"
                        value={course.duration}
                        onChange={handleChange}
                        helperText="E.g. '8 weeks' or '40 hours'"
                      />
                    </Grid>
                  </Grid>

                  {/* Image input */}
                  <TextField
                    label="Main Course Image URL (optional)"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1 }}
                    name="courseImage"
                    value={course.courseImage}
                    onChange={handleChange}
                    error={Boolean(errors.courseImage)}
                    helperText={
                      errors.courseImage || "Direct image URL (jpg, png, gif, webp, svg)."
                    }
                  />

                  {/* Image preview (smaller) */}
                  <Box sx={{ mb: 2, maxWidth: PREVIEW_MAX_WIDTH, margin: "0 auto" }}>
                    {course.courseImage ? (
                      preview.imageValid ? (
                        <Box
                          component="img"
                          src={course.courseImage}
                          alt="Course preview"
                          sx={{
                            width: "100%",
                            maxHeight: SMALL_IMAGE_MAX_HEIGHT,
                            objectFit: "contain",
                            borderRadius: 1,
                            border: "1px solid rgba(0,0,0,0.06)",
                            boxShadow: 0,
                            background: "#fff",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            p: 1,
                            borderRadius: 1,
                            border: "1px dashed rgba(0,0,0,0.06)",
                            bgcolor: "rgba(0,0,0,0.02)",
                          }}
                        >
                          <MDTypography variant="caption" color="text">
                            Not a valid direct image URL. You can still save it, or provide a direct
                            image link (jpg, png, webp, svg).
                          </MDTypography>
                        </Box>
                      )
                    ) : (
                      <MDTypography variant="caption" color="text">
                        No image provided — preview will appear here when you paste a direct image
                        URL.
                      </MDTypography>
                    )}
                  </Box>

                  {/* Demo video input */}
                  <TextField
                    label="Course Demo Video Link (optional)"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1 }}
                    name="coursedemovideolink"
                    value={course.coursedemovideolink}
                    onChange={handleChange}
                    error={Boolean(errors.coursedemovideolink)}
                    helperText={
                      errors.coursedemovideolink ||
                      "Paste YouTube or direct video link (.mp4, .webm)."
                    }
                  />

                  {/* Video preview (smaller) */}
                  <Box sx={{ mb: 2, maxWidth: PREVIEW_MAX_WIDTH, margin: "0 auto" }}>
                    {course.coursedemovideolink ? (
                      preview.videoEmbed ? (
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            pt: "56.25%", // 16:9 aspect
                            borderRadius: 1,
                            overflow: "hidden",
                            border: "1px solid rgba(0,0,0,0.06)",
                            maxHeight: SMALL_VIDEO_MAX_HEIGHT,
                          }}
                        >
                          <iframe
                            title="Course demo"
                            src={preview.videoEmbed}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </Box>
                      ) : preview.videoFile ? (
                        <Box
                          sx={{
                            border: "1px solid rgba(0,0,0,0.06)",
                            borderRadius: 1,
                            overflow: "hidden",
                            maxHeight: SMALL_VIDEO_MAX_HEIGHT,
                          }}
                        >
                          <video
                            controls
                            src={course.coursedemovideolink}
                            style={{
                              width: "100%",
                              maxHeight: SMALL_VIDEO_MAX_HEIGHT,
                              display: "block",
                            }}
                          >
                            Your browser does not support the video tag.
                            <a href={course.coursedemovideolink} target="_blank" rel="noreferrer">
                              Open video
                            </a>
                          </video>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            border: "1px dashed rgba(0,0,0,0.06)",
                            bgcolor: "rgba(0,0,0,0.02)",
                          }}
                        >
                          <MDTypography variant="caption" color="text">
                            Preview not available for this link.
                            <a href={course.coursedemovideolink} target="_blank" rel="noreferrer">
                              Open in new tab
                            </a>
                            .
                          </MDTypography>
                        </Box>
                      )
                    ) : (
                      <MDTypography variant="caption" color="text">
                        No demo video link — paste a YouTube link or direct MP4/WebM link to preview
                        it.
                      </MDTypography>
                    )}
                  </Box>

                  {/* Category select */}
                  <FormControl fullWidth sx={{ mb: 2, height: "40px" }}>
                    <InputLabel id="course-category-label">Course Category</InputLabel>
                    <Select
                      labelId="course-category-label"
                      label="Course Category"
                      name="courseCategory"
                      value={course.courseCategory}
                      onChange={handleChange}
                      sx={{ height: 55, display: "flex", alignItems: "center" }}
                    >
                      {availableCategories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* (rest of form: main headings, sub-headings, etc.) */}
                  <Box sx={{ mb: 2 }}>
                    <MDTypography variant="subtitle2" sx={{ mb: 1 }}>
                      Main Headings
                    </MDTypography>

                    <MDBox sx={{ mb: 1, display: "flex", gap: 1, alignItems: "center" }}>
                      <TextField
                        label="Add Main Heading"
                        variant="outlined"
                        size="small"
                        value={mainHeadingInput}
                        onChange={(e) => {
                          setMainHeadingInput(e.target.value);
                          setErrors((prev) => ({ ...prev, mainHeadingInput: "" }));
                        }}
                        sx={{ flexGrow: 1 }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddMainHeading();
                          }
                        }}
                        error={Boolean(errors.mainHeadingInput)}
                        helperText={errors.mainHeadingInput}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddMainHeading}
                        style={{ color: "black" }}
                      >
                        Add
                      </Button>
                    </MDBox>

                    <Box sx={{ mb: 2 }}>
                      {course.mainHeadings.length === 0 ? (
                        <MDTypography variant="caption" color="text">
                          No main headings added.
                        </MDTypography>
                      ) : (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {course.mainHeadings.map((mh, idx) => (
                            <Box
                              key={mh}
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor: "rgba(0,0,0,0.04)",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                border: "1px solid rgba(0,0,0,0.04)",
                              }}
                            >
                              <MDTypography variant="caption">{mh}</MDTypography>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveMainHeading(idx)}
                                sx={{ ml: 0.5 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                      {errors.mainHeadings && (
                        <MDTypography
                          variant="caption"
                          color="error"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {errors.mainHeadings}
                        </MDTypography>
                      )}
                    </Box>

                    <MDTypography variant="subtitle2" sx={{ mb: 1 }}>
                      Add Sub-heading to a Main Heading
                    </MDTypography>

                    <Grid container spacing={1} sx={{ mb: 1 }} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel id="select-main-heading-label">Main Heading</InputLabel>
                          <Select
                            labelId="select-main-heading-label"
                            label="Main Heading"
                            value={selectedMainHeading}
                            sx={{ height: 40, display: "flex", alignItems: "center" }}
                            onChange={(e) => {
                              setSelectedMainHeading(e.target.value);
                              setErrors((prev) => ({ ...prev, selectedMainHeading: "" }));
                            }}
                          >
                            <MenuItem value="">
                              <em>Choose</em>
                            </MenuItem>
                            {course.mainHeadings.map((mh) => (
                              <MenuItem key={mh} value={mh}>
                                {mh}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {errors.selectedMainHeading && (
                          <MDTypography variant="caption" color="error">
                            {errors.selectedMainHeading}
                          </MDTypography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Sub-heading"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={subHeadingInput}
                          onChange={(e) => {
                            setSubHeadingInput(e.target.value);
                            setErrors((prev) => ({ ...prev, subHeadingInput: "" }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSubHeading();
                            }
                          }}
                          error={Boolean(errors.subHeadingInput)}
                          helperText={errors.subHeadingInput}
                        />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleAddSubHeading}
                          fullWidth
                          style={{ color: "black" }}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 2 }}>
                      {course.mainHeadings.length === 0 ? null : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {course.mainHeadings.map((mh) => {
                            const subs = course.subHeadingsMap[mh] || [];
                            return (
                              <Box
                                key={mh}
                                sx={{ border: "1px solid rgba(0,0,0,0.04)", p: 1, borderRadius: 1 }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <MDTypography variant="caption" sx={{ fontWeight: 600 }}>
                                    {mh}
                                  </MDTypography>
                                  <MDTypography variant="caption" color="text">
                                    {subs.length} sub-heading{subs.length !== 1 ? "s" : ""}
                                  </MDTypography>
                                </Box>

                                {subs.length === 0 ? (
                                  <MDTypography variant="caption" color="text" sx={{ mt: 0.5 }}>
                                    No sub-headings for this main heading.
                                  </MDTypography>
                                ) : (
                                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                                    {subs.map((s, i) => (
                                      <Box
                                        key={s + i}
                                        sx={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          bgcolor: "rgba(0,0,0,0.04)",
                                          px: 1,
                                          py: 0.4,
                                          borderRadius: 1,
                                        }}
                                      >
                                        <MDTypography variant="caption">{s}</MDTypography>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveSubHeading(mh, i)}
                                          sx={{ ml: 0.5 }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ color: "#FFFFFF", height: 48 }}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? "Updating..." : "Update Course"}
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
