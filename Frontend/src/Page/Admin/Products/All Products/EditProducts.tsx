import { useState, useEffect } from "react";
import { 
  Box, Typography, Stack, Paper, Button, TextField, 
  InputLabel, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, Divider, CircularProgress,
  Snackbar, Alert, Slide, MenuItem, Switch
} from "@mui/material";
import type { SlideProps } from "@mui/material";
import { 
  ArrowBackIosNewOutlined, 
  Inventory2Outlined,
  CloudUploadOutlined,
  DeleteOutline,
  AddBoxOutlined,
  ImageOutlined,
  CategoryOutlined,
  SettingsOutlined,
  SellOutlined,
  PublicOutlined,
  ListAltOutlined
} from "@mui/icons-material";
import axios from "axios";

// --- CONFIGURATION ---
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "37cd6333d9f4bd044c4a4dcc867276ae";
const primaryTeal = "#004652";
const primaryFont = "'Montserrat', sans-serif";
const borderColor = "#E2E8F0";

// --- COUNTRY LIST ---
const COUNTRIES = [
  { code: "AE", name: "United Arab Emirates" }, { code: "LK", name: "Sri Lanka" },
  { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" }, { code: "AU", name: "Australia" },
  { code: "IN", name: "India" }, { code: "CN", name: "China" },
  { code: "JP", name: "Japan" }, { code: "DE", name: "Germany" },
  { code: "FR", name: "France" }, { code: "IT", name: "Italy" },
  { code: "KR", name: "South Korea" }, { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" }, { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" }, { code: "VN", name: "Vietnam" },
  { code: "PH", name: "Philippines" }, { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" }, { code: "MV", name: "Maldives" },
  { code: "NP", name: "Nepal" }, { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" }, { code: "KW", name: "Kuwait" },
  { code: "OM", name: "Oman" }, { code: "BH", name: "Bahrain" },
  { code: "TR", name: "Turkey" }, { code: "EG", name: "Egypt" },
  { code: "ZA", name: "South Africa" }, { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" }, { code: "RU", name: "Russia" },
  { code: "ES", name: "Spain" }, { code: "NL", name: "Netherlands" },
  { code: "CH", name: "Switzerland" }, { code: "SE", name: "Sweden" },
  { code: "NZ", name: "New Zealand" }
].sort((a, b) => a.name.localeCompare(b.name));

// Custom Slide Animation for the Toast Notification
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

// --- CATEGORY HELPERS ---
const flattenCategories = (nodes: any[] = [], level = 0, parentId = null, rootId = null): any[] => {
  let result: any[] = [];
  nodes.forEach((node) => {
    const mainId = rootId || node.id;
    result.push({
      id: node.id,
      title: `${"— ".repeat(level)}${node.title}`,
      parentId,
      rootId: mainId,
      level,
    });
    if (node.children?.length) {
      result = result.concat(flattenCategories(node.children, level + 1, node.id, mainId));
    }
  });
  return result;
};

// --- CLIENT-SIDE IMAGE COMPRESSION ---
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000; 
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height *= MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width *= MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file); 
              }
            },
            "image/jpeg",
            0.80 
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- TYPES ---
interface Variant {
  name: string;
  price: number | "";
  originalPrice: number | "";
  sku: string;
  weight: number | "";
  images: string[];
  imageInput?: string;
}

interface ProductRecord {
  _id?: string;
  name?: string;
  category?: string;
  mainCategory?: string;
  price?: number | string;
  originalPrice?: number | string;
  sku?: string;
  weight?: number | string;
  description?: string;
  images?: string[];
  
  // New Fields
  originType?: string;
  country?: string;
  countryFlag?: string;
  brand?: string;
  productType?: string;
  keyFeatures?: string;
  unit?: string;
  fragrance?: string;
  itemForm?: string;
  packagingType?: string;
  materialTypeFree?: string;
  availability?: string;
  deliveryTime?: string;

  soldOut?: boolean;
  quantity?: number | string;
  minQty?: number | string;
  maxQty?: number | string;
  tags?: string;
  todaySpecial?: boolean;
  popularProduct?: boolean;
  variants?: Array<Partial<Variant>>;
}

interface ProductUpdateProps {
  productId: string;
  initialProduct?: ProductRecord;
  onBack: () => void;
}

const numberOrEmpty = (value: unknown): number | "" => {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "";
};

const numberOrZero = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const unwrapProductPayload = (payload: any): ProductRecord | null => {
  const candidate = payload?.product ?? payload?.data?.product ?? payload?.data ?? payload;
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? candidate
    : null;
};

const extractCategoryNodes = (payload: any): any[] => {
  const source = payload?.data ?? payload;

  if (Array.isArray(source)) {
    const wrappedNodes = source.flatMap((item: any) =>
      Array.isArray(item?.categories) ? item.categories : []
    );
    return wrappedNodes.length > 0 ? wrappedNodes : source;
  }

  if (Array.isArray(source?.categories)) return source.categories;
  if (Array.isArray(source?.categorySections)) {
    return source.categorySections.flatMap((item: any) => item?.categories ?? []);
  }

  return [];
};

const createProductForm = (product: ProductRecord | null | undefined) => ({
  name: product?.name ?? "",
  category: product?.category != null ? String(product.category) : "",
  mainCategory: product?.mainCategory != null ? String(product.mainCategory) : "",
  price: numberOrEmpty(product?.price),
  originalPrice: numberOrEmpty(product?.originalPrice),
  sku: product?.sku ?? "",
  weight: numberOrEmpty(product?.weight),
  description: product?.description ?? "",
  images: Array.isArray(product?.images) ? product.images : [],
  
  // New Fields initialized from DB
  originType: product?.originType ?? "Local",
  country: product?.country ?? "",
  countryFlag: product?.countryFlag ?? "",
  brand: product?.brand ?? "",
  productType: product?.productType ?? "",
  keyFeatures: product?.keyFeatures ?? "",
  unit: product?.unit ?? "",
  fragrance: product?.fragrance ?? "",
  itemForm: product?.itemForm ?? "",
  packagingType: product?.packagingType ?? "",
  materialTypeFree: product?.materialTypeFree ?? "",
  availability: product?.availability ?? "On Hand",
  deliveryTime: product?.deliveryTime ?? "1-3 Days Delivery",

  soldOut: product?.soldOut ?? false,
  quantity: numberOrZero(product?.quantity),
  minQty: numberOrZero(product?.minQty),
  maxQty: numberOrZero(product?.maxQty),
  tags: product?.tags ?? "",
  todaySpecial: product?.todaySpecial ?? false,
  popularProduct: product?.popularProduct ?? false,
  variants: Array.isArray(product?.variants)
    ? product.variants.map((variant) => ({
        name: variant.name ?? "",
        price: numberOrEmpty(variant.price),
        originalPrice: numberOrEmpty(variant.originalPrice),
        sku: variant.sku ?? "",
        weight: numberOrEmpty(variant.weight),
        images: Array.isArray(variant.images) ? variant.images : [],
        imageInput: variant.imageInput ?? "",
      }))
    : [],
});

type ProductForm = ReturnType<typeof createProductForm>;

const ProductUpdate = ({ productId, initialProduct, onBack }: ProductUpdateProps) => {
  // 1. STATE MANAGEMENT
  const [form, setForm] = useState<ProductForm>(() => createProductForm(initialProduct));

  const [categoriesFlat, setCategoriesFlat] = useState<any[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Tracks initial data fetch
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info"
  });

  const showToast = (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

  // --- FETCH INITIAL DATA (Categories & Existing Product) ---
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (initialProduct) setForm(createProductForm(initialProduct));
      setIsLoadingData(!initialProduct);

      const categoryRequest = axios.get(`${API_BASE_URL}/Categorysection`);
      const productRequest = productId
        ? axios.get(`${API_BASE_URL}/Products/${encodeURIComponent(productId)}`)
        : Promise.reject(new Error("Missing product ID"));

      const [categoryResult, productResult] = await Promise.allSettled([
        categoryRequest,
        productRequest,
      ]);

      if (cancelled) return;

      if (categoryResult.status === "fulfilled") {
        const categoryNodes = extractCategoryNodes(categoryResult.value.data);
        setCategoriesFlat(flattenCategories(categoryNodes));
      } else {
        console.error("Category loading failed:", categoryResult.reason);
      }

      if (productResult.status === "fulfilled") {
        const productData = unwrapProductPayload(productResult.value.data);
        if (productData) {
          setForm(createProductForm(productData));
        } else if (!initialProduct) {
          showToast("The server returned an invalid product response.", "error");
        }
      } else {
        console.error("Product loading failed:", productResult.reason);
        showToast(
          initialProduct
            ? "Live product refresh failed. Loaded the selected product data instead."
            : "Failed to load product data. Check the product API route and server logs.",
          initialProduct ? "warning" : "error"
        );
      }

      setIsLoadingData(false);
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [productId, initialProduct]);

  // --- IMGBB UPLOAD HANDLER ---
  const uploadToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || "Failed to upload image");
    }
  };

  // --- FORM HANDLERS ---
  const handleChange = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  // Availability Auto-Delivery Handler
  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedAvailability = e.target.value;
    setForm(prev => ({
      ...prev,
      availability: selectedAvailability,
      deliveryTime: selectedAvailability === "On Hand" ? "1-3 Days Delivery" : "7-14 Days Delivery"
    }));
  };

  // Country Auto-Flag Handler
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedName = e.target.value;
    const countryData = COUNTRIES.find((c) => c.name === selectedName);
    
    setForm(prev => ({ 
      ...prev, 
      country: selectedName,
      countryFlag: countryData ? `https://flagcdn.com/w80/${countryData.code.toLowerCase()}.png` : "" 
    }));
  };

  // Main Images (URL & Multiple File Upload)
  const handleAddImageUrl = () => {
    if (!imageInput.trim()) return;
    setForm(prev => ({ ...prev, images: [...prev.images, imageInput.trim()] }));
    setImageInput("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const filesArray = Array.from(e.target.files);
        const uploadPromises = filesArray.map(async (file) => {
          const compressed = await compressImage(file);
          return await uploadToImgBB(compressed);
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        setForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        showToast(`${uploadedUrls.length} image(s) uploaded successfully!`, "success");
      } catch (err) { 
        showToast("Upload failed. Please try again.", "error"); 
      } finally { 
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // Variants
  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { name: "", price: "", originalPrice: "", sku: "", weight: "", images: [], imageInput: "" }],
    }));
  };

  const updateVariant = (index: number, key: keyof Variant, val: any) => {
    const updated = [...form.variants];
    updated[index] = { ...updated[index], [key]: val };
    setForm(prev => ({ ...prev, variants: updated }));
  };

  const removeVariant = (index: number) => {
    const updated = [...form.variants];
    updated.splice(index, 1);
    setForm(prev => ({ ...prev, variants: updated }));
  };

  // Variant Images (URL & Multiple File Upload)
  const addVariantImageUrl = (index: number) => {
    const updated = [...form.variants];
    const url = updated[index].imageInput;
    if (!url?.trim()) return;
    updated[index].images.push(url.trim());
    updated[index].imageInput = "";
    setForm(prev => ({ ...prev, variants: updated }));
  };

  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingVariantIndex(index);
      try {
        const filesArray = Array.from(e.target.files);
        const uploadPromises = filesArray.map(async (file) => {
          const compressed = await compressImage(file);
          return await uploadToImgBB(compressed);
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        const updated = [...form.variants];
        updated[index].images.push(...uploadedUrls);
        setForm(prev => ({ ...prev, variants: updated }));
        showToast(`Variant image(s) uploaded successfully!`, "success");
      } catch (err) { 
        showToast("Upload failed. Please try again.", "error"); 
      } finally { 
        setUploadingVariantIndex(null); 
        e.target.value = '';
      }
    }
  };

  const removeVariantImage = (vIndex: number, imgIndex: number) => {
    const updated = [...form.variants];
    updated[vIndex].images.splice(imgIndex, 1);
    setForm(prev => ({ ...prev, variants: updated }));
  };

  // --- SAVE LOGIC (UPDATE) ---
  const handleSaveClick = () => {
    if (!form.name || !form.price || !form.category) {
      showToast("Name, Category, and Price are required.", "warning");
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmSave = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);

    try {
      if (!productId) throw new Error("Missing product ID");

      const response = await fetch(`${API_BASE_URL}/Products/${encodeURIComponent(productId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const responsePayload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          responsePayload?.message ||
          responsePayload?.error ||
          `Update failed with status ${response.status}`
        );
      }

      const updatedProduct = unwrapProductPayload(responsePayload);
      if (updatedProduct) setForm(createProductForm(updatedProduct));

      showToast("Product Updated Successfully!", "success");
      window.setTimeout(onBack, 900);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown update error";
      console.error("Product update failed:", err);
      showToast(`Update failed: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- SHARED UI STYLES ---
  const inputStyle = {
    "& .MuiInputBase-input": {
      color: "#000000 !important", 
      WebkitTextFillColor: "#000000 !important", 
    },
    "& input:-webkit-autofill": { 
      WebkitBoxShadow: "0 0 0 100px #F8FAFC inset !important",
      WebkitTextFillColor: "#000000 !important",
      caretColor: "#000000",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      fontFamily: primaryFont,
      fontSize: "0.85rem",
      fontWeight: 600,
      bgcolor: "#F8FAFC",
      transition: "all 0.2s ease-in-out",
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: borderColor },
      "&.Mui-focused fieldset": { borderColor: primaryTeal, borderWidth: "2px" },
    },
    "& .Mui-disabled": {
      WebkitTextFillColor: "#64748B !important",
      bgcolor: "#F1F5F9",
    }
  };

  const variantInputStyle = {
    "& .MuiInputBase-input": {
      color: "#000000 !important", 
      WebkitTextFillColor: "#000000 !important", 
    },
    "& input:-webkit-autofill": { 
      WebkitBoxShadow: "0 0 0 100px #FFFFFF inset !important",
      WebkitTextFillColor: "#000000 !important",
      caretColor: "#000000",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      fontFamily: primaryFont,
      fontSize: "0.85rem",
      fontWeight: 600,
      bgcolor: "#FFFFFF",
      transition: "all 0.2s ease-in-out",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#CBD5E1" },
      "&.Mui-focused fieldset": { borderColor: primaryTeal, borderWidth: "2px" },
    },
  };

  const sectionHeaderStyle = {
    fontFamily: primaryFont, 
    fontSize: "0.75rem", 
    fontWeight: 900, 
    color: primaryTeal, 
    letterSpacing: 1.2, 
    mb: 2.5,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    textTransform: 'uppercase'
  };

  if (isLoadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: primaryTeal }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1500px", mx: "auto", pb: 5 }}>
      {/* HEADERBAR */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Button 
          onClick={onBack} 
          startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: "14px" }} />}
          sx={{ 
            fontFamily: primaryFont, fontSize: "0.8rem", fontWeight: 700, 
            textTransform: 'none', color: "#64748B",
            "&:hover": { bgcolor: "rgba(0,70,82,0.05)", color: primaryTeal }
          }}
        >
          Back to Inventory
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
        {/* LEFT COLUMN: MAIN PRODUCT DATA */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 66%' }, minWidth: 0 }}>
          <Stack spacing={4}>
            
            {/* BASIC INFO */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "24px", border: `1px solid ${borderColor}`, bgcolor: "#FFF", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)" }}>
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: "rgba(0,70,82,0.08)", p: 1.5, borderRadius: "12px", border: '1px solid rgba(0,70,82,0.1)' }}>
                      <Inventory2Outlined sx={{ color: primaryTeal, fontSize: 28 }} />
                  </Box>
                  <Box>
                      <Typography variant="h6" sx={{ fontFamily: primaryFont, fontWeight: 800, color: primaryTeal, letterSpacing: -0.5 }}>
                          Edit Product Details
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, fontFamily: primaryFont }}>
                          Update the core attributes and pricing for this product.
                      </Typography>
                  </Box>
              </Box>

              <Stack spacing={3}>
                <Box>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>PRODUCT NAME *</InputLabel>
                    <TextField fullWidth value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. Premium Cotton T-Shirt" sx={inputStyle} />
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>CATEGORY *</InputLabel>
                    <TextField 
                      select fullWidth value={form.category} 
                      onChange={(e) => {
                        const selected = categoriesFlat.find(
                          (c) => String(c.id) === String(e.target.value)
                        );
                        setForm(prev => ({
                          ...prev,
                          category: String(e.target.value),
                          mainCategory: String(selected?.rootId ?? e.target.value),
                        }));
                      }}
                      sx={inputStyle}
                    >
                      {form.category && !categoriesFlat.some((cat) => String(cat.id) === String(form.category)) && (
                        <MenuItem value={form.category} sx={{ fontFamily: primaryFont, fontSize: '0.85rem', fontWeight: 500 }}>
                          Current category: {form.category}
                        </MenuItem>
                      )}
                      {categoriesFlat.map((cat) => (
                        <MenuItem key={String(cat.id)} value={String(cat.id)} sx={{ fontFamily: primaryFont, fontSize: '0.85rem', fontWeight: 500 }}>
                          {cat.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>MAIN CATEGORY (AUTO)</InputLabel>
                    <TextField fullWidth disabled value={categoriesFlat.find((c) => String(c.id) === String(form.mainCategory))?.title || form.mainCategory || ""} sx={{ ...inputStyle, bgcolor: "#F1F5F9" }} />
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>SELLING PRICE ($) *</InputLabel>
                    <TextField fullWidth type="number" value={form.price} onChange={(e) => handleChange("price", Number(e.target.value))} placeholder="0.00" sx={inputStyle} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>COMPARE AT PRICE ($)</InputLabel>
                    <TextField fullWidth type="number" value={form.originalPrice} onChange={(e) => handleChange("originalPrice", Number(e.target.value))} placeholder="0.00" sx={inputStyle} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>SKU</InputLabel>
                    <TextField fullWidth value={form.sku} onChange={(e) => handleChange("sku", e.target.value)} placeholder="e.g. SHIRT-001" sx={inputStyle} />
                  </Box>
                </Stack>

                <Box>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>DESCRIPTION</InputLabel>
                    <TextField fullWidth multiline rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Describe the product details..." sx={inputStyle} />
                </Box>
              </Stack>
            </Paper>

            {/* PRODUCT SPECIFICATIONS */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "24px", border: `1px solid ${borderColor}`, bgcolor: "#FFF" }}>
              <Typography sx={sectionHeaderStyle}><ListAltOutlined sx={{ fontSize: 18 }} /> Product Specifications</Typography>
              
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>BRAND</InputLabel>
                    <TextField fullWidth value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} placeholder="e.g. Dove, L'Oreal" sx={inputStyle} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>PRODUCT TYPE</InputLabel>
                    <TextField fullWidth value={form.productType} onChange={(e) => handleChange("productType", e.target.value)} placeholder="e.g. Shampoo, Lotion" sx={inputStyle} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>ITEM FORM</InputLabel>
                    <TextField fullWidth value={form.itemForm} onChange={(e) => handleChange("itemForm", e.target.value)} placeholder="e.g. Liquid, Gel, Powder" sx={inputStyle} />
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>UNIT</InputLabel>
                    <TextField fullWidth value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} placeholder="e.g. ml, g, oz" sx={inputStyle} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>WEIGHT / VOLUME</InputLabel>
                    <TextField fullWidth type="number" value={form.weight} onChange={(e) => handleChange("weight", Number(e.target.value))} placeholder="0" sx={inputStyle} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>FRAGRANCE</InputLabel>
                    <TextField fullWidth value={form.fragrance} onChange={(e) => handleChange("fragrance", e.target.value)} placeholder="e.g. Lavender, Unscented" sx={inputStyle} />
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>PACKAGING TYPE</InputLabel>
                    <TextField fullWidth value={form.packagingType} onChange={(e) => handleChange("packagingType", e.target.value)} placeholder="e.g. Bottle, Tube, Jar" sx={inputStyle} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>MATERIAL TYPE FREE</InputLabel>
                    <TextField fullWidth value={form.materialTypeFree} onChange={(e) => handleChange("materialTypeFree", e.target.value)} placeholder="e.g. Paraben Free, Sulfate Free" sx={inputStyle} />
                  </Box>
                </Stack>

                <Box>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>KEY FEATURES</InputLabel>
                    <TextField fullWidth multiline rows={3} value={form.keyFeatures} onChange={(e) => handleChange("keyFeatures", e.target.value)} placeholder="List key features (e.g. Moisturizing, Anti-aging)..." sx={inputStyle} />
                </Box>
              </Stack>
            </Paper>

            {/* PRODUCT ORIGIN / LOCALIZATION */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "24px", border: `1px solid ${borderColor}`, bgcolor: "#FFF" }}>
              <Typography sx={sectionHeaderStyle}><PublicOutlined sx={{ fontSize: 18 }} /> Product Origin</Typography>
              
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>ORIGIN TYPE</InputLabel>
                    <TextField
                      select
                      fullWidth
                      value={form.originType}
                      onChange={(e) => handleChange("originType", e.target.value)}
                      sx={inputStyle}
                    >
                      <MenuItem value="Local" sx={{ fontFamily: primaryFont, fontSize: '0.85rem', fontWeight: 500 }}>Local Product</MenuItem>
                      <MenuItem value="International" sx={{ fontFamily: primaryFont, fontSize: '0.85rem', fontWeight: 500 }}>International Product</MenuItem>
                    </TextField>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>COUNTRY OF ORIGIN</InputLabel>
                    <TextField
                      select
                      fullWidth
                      value={form.country}
                      onChange={handleCountryChange}
                      sx={inputStyle}
                    >
                      {form.country && !COUNTRIES.some((c) => c.name === form.country) && (
                        <MenuItem value={form.country} sx={{ fontFamily: primaryFont, fontSize: '0.85rem', fontWeight: 500 }}>
                          Current: {form.country}
                        </MenuItem>
                      )}
                      {COUNTRIES.map((c) => (
                        <MenuItem key={c.code} value={c.name} sx={{ fontFamily: primaryFont, fontSize: '0.85rem', fontWeight: 500 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <img src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} alt={c.code} style={{ width: 20, borderRadius: 2 }} />
                            {c.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Stack>

                <Box>
                  <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>COUNTRY FLAG (AUTO)</InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '42px' }}>
                    {form.countryFlag ? (
                      <Box sx={{ position: "relative", width: 60, height: 40, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${borderColor}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <img src={form.countryFlag} alt="Country Flag" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    ) : (
                      <Typography sx={{ fontFamily: primaryFont, fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                        Select a country above to generate flag
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Stack>
            </Paper>

            {/* IMAGES */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "24px", border: `1px solid ${borderColor}`, bgcolor: "#FFF" }}>
              <Typography sx={sectionHeaderStyle}><ImageOutlined sx={{ fontSize: 18 }} /> Product Media</Typography>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
                <TextField 
                  fullWidth value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                  placeholder="Paste Image URL here..." sx={inputStyle}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddImageUrl(); } }}
                />
                
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, fontFamily: primaryFont, fontWeight: 600 }}>OR</Divider>
                
                <Button 
                  component="label" 
                  variant="contained" 
                  disabled={isUploading} 
                  sx={{ 
                    bgcolor: primaryTeal, 
                    minWidth: '54px', 
                    width: '54px',
                    p: 0,
                    borderRadius: '10px', 
                    "&:hover": { bgcolor: "#002d35" } 
                  }}
                >
                  {isUploading ? <CircularProgress size={24} color="inherit"/> : <CloudUploadOutlined />}
                  <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
                </Button>
              </Stack>

              {form.images.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {form.images.map((img, i) => (
                    <Box key={i} sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)', md: 'calc(25% - 12px)' }, position: "relative", borderRadius: '12px', overflow: 'hidden', border: `1px solid ${borderColor}`, aspectRatio: '1/1' }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <IconButton size="small" onClick={() => removeImage(i)} sx={{ position: "absolute", top: 6, right: 6, bgcolor: "rgba(255,255,255,0.9)", color: "#EF4444", "&:hover": { bgcolor: "#FFF" } }}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            {/* VARIANTS */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "24px", border: `1px solid ${borderColor}`, bgcolor: "#FFF" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography sx={{...sectionHeaderStyle, mb: 0}}><CategoryOutlined sx={{ fontSize: 18 }} /> Product Variants</Typography>
                <Button size="small" variant="outlined" onClick={addVariant} startIcon={<AddBoxOutlined />} sx={{ borderRadius: '8px', fontFamily: primaryFont, fontWeight: 700, color: primaryTeal, borderColor: primaryTeal }}>
                  Add Variant
                </Button>
              </Stack>

              {form.variants.length === 0 ? (
                <Typography sx={{ textAlign: 'center', color: '#94A3B8', fontFamily: primaryFont, fontWeight: 600, py: 3, bgcolor: '#F8FAFC', borderRadius: '12px' }}>No variants added yet. Click above to add sizes, colors, etc.</Typography>
              ) : (
                <Stack spacing={3}>
                  {form.variants.map((v, i) => (
                    <Box key={i} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${borderColor}`, bgcolor: '#F8FAFC', position: 'relative' }}>
                      <IconButton color="error" onClick={() => removeVariant(i)} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <DeleteOutline />
                      </IconButton>

                      <Stack spacing={2} mt={1}>
                        <Box>
                          <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>VARIANT NAME</InputLabel>
                          <TextField fullWidth value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} placeholder="e.g. Size Large - Red" sx={variantInputStyle} />
                        </Box>
                        
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <Box sx={{ flex: 1 }}>
                            <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>PRICE</InputLabel>
                            <TextField fullWidth type="number" value={v.price} onChange={(e) => updateVariant(i, "price", Number(e.target.value))} placeholder="0.00" sx={variantInputStyle} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>COMPARE AT</InputLabel>
                            <TextField fullWidth type="number" value={v.originalPrice} onChange={(e) => updateVariant(i, "originalPrice", Number(e.target.value))} placeholder="0.00" sx={variantInputStyle} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>SKU</InputLabel>
                            <TextField fullWidth value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} sx={variantInputStyle} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>WEIGHT (g)</InputLabel>
                            <TextField fullWidth type="number" value={v.weight} onChange={(e) => updateVariant(i, "weight", Number(e.target.value))} sx={variantInputStyle} />
                          </Box>
                        </Stack>
                      </Stack>

                      {/* Variant Images */}
                      <Box mt={3}>
                        <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>VARIANT IMAGES</InputLabel>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2}>
                          <TextField fullWidth size="small" value={v.imageInput || ""} onChange={(e) => updateVariant(i, "imageInput", e.target.value)} placeholder="Image URL..." sx={variantInputStyle} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVariantImageUrl(i); } }} />
                          <Button 
                            component="label" 
                            variant="contained" 
                            disabled={uploadingVariantIndex === i} 
                            sx={{ 
                              bgcolor: primaryTeal, 
                              minWidth: '40px',
                              width: '40px',
                              p: 0,
                              borderRadius: '8px', 
                              "&:hover": { bgcolor: "#002d35" } 
                            }}
                          >
                            {uploadingVariantIndex === i ? <CircularProgress size={20} color="inherit" /> : <CloudUploadOutlined />}
                            <input type="file" accept="image/*" multiple hidden onChange={(e) => handleVariantImageUpload(i, e)} />
                          </Button>
                        </Stack>
                        
                        {v.images.length > 0 && (
                          <Stack direction="row" spacing={1} overflow="auto" pb={1}>
                            {v.images.map((img, imgIndex) => (
                              <Box key={imgIndex} sx={{ position: "relative", minWidth: 70, height: 70, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <IconButton size="small" onClick={() => removeVariantImage(i, imgIndex)} sx={{ position: "absolute", top: 2, right: 2, p: 0.2, bgcolor: "rgba(255,255,255,0.9)", color: "#EF4444" }}>
                                  <DeleteOutline sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Box>

        {/* RIGHT COLUMN: STATUS & INVENTORY */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 34%' }, minWidth: 0 }}>
          <Stack spacing={4}>
            
            {/* INVENTORY TRACKING */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: `1px solid ${borderColor}`, bgcolor: "#FFF" }}>
                <Typography sx={sectionHeaderStyle}><SettingsOutlined sx={{ fontSize: 18 }} /> Status & Inventory</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>
                      AVAILABILITY TYPE
                    </InputLabel>
                    <TextField
                      select
                      fullWidth
                      value={form.availability}
                      onChange={handleAvailabilityChange}
                      sx={inputStyle}
                    >
                      <MenuItem value="On Hand" sx={{ fontFamily: primaryFont, fontSize: '0.85rem', fontWeight: 500 }}>On Hand</MenuItem>
                      <MenuItem value="Order Online" sx={{ fontFamily: primaryFont, fontSize: '0.85rem', fontWeight: 500 }}>Order Online</MenuItem>
                    </TextField>
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>
                      EST. DELIVERY TIME
                    </InputLabel>
                    <TextField
                      fullWidth
                      disabled
                      value={form.deliveryTime}
                      sx={inputStyle}
                    />
                  </Box>
                </Stack>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#FFF1F2', borderRadius: '12px', border: '1px solid #FECDD3' }}>
                    <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: '0.85rem', color: '#BE123C' }}>Mark as Sold Out</Typography>
                    <Switch checked={form.soldOut} onChange={(e) => handleChange("soldOut", e.target.checked)} color="error" />
                  </Box>
                </Stack>

                <Stack spacing={3}>
                  <Box>
                    <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>AVAILABLE STOCK</InputLabel>
                    <TextField fullWidth type="number" value={form.quantity} onChange={(e) => handleChange("quantity", Number(e.target.value))} sx={inputStyle} />
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>MIN ORDER</InputLabel>
                      <TextField fullWidth type="number" value={form.minQty} onChange={(e) => handleChange("minQty", Number(e.target.value))} sx={inputStyle} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>MAX ORDER</InputLabel>
                      <TextField fullWidth type="number" value={form.maxQty} onChange={(e) => handleChange("maxQty", Number(e.target.value))} sx={inputStyle} />
                    </Box>
                  </Stack>
                </Stack>
            </Paper>

            {/* MARKETING & TAGS */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: `1px solid ${borderColor}`, bgcolor: "#FFF" }}>
              <Typography sx={sectionHeaderStyle}><SellOutlined sx={{ fontSize: 18 }} /> Marketing Flags</Typography>
              
              <Stack spacing={2} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                  <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: '0.85rem', color: '#047857' }}>Today's Special</Typography>
                  <Switch checked={form.todaySpecial} onChange={(e) => handleChange("todaySpecial", e.target.checked)} color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#FEF3C7', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                  <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: '0.85rem', color: '#B45309' }}>Popular Product</Typography>
                  <Switch checked={form.popularProduct} onChange={(e) => handleChange("popularProduct", e.target.checked)} color="warning" />
                </Box>
              </Stack>

              <Box>
                <InputLabel sx={{ mb: 1, ml: 1, fontWeight: 700, fontSize: "0.7rem", fontFamily: primaryFont }}>TAGS (Comma separated)</InputLabel>
                <TextField fullWidth value={form.tags} onChange={(e) => handleChange("tags", e.target.value)} placeholder="e.g. summer, sale, new" sx={inputStyle} />
              </Box>
            </Paper>

            {/* SUBMIT BUTTON */}
            <Button 
              fullWidth variant="contained" onClick={handleSaveClick} disabled={loading}
              sx={{ 
                bgcolor: primaryTeal, py: 2, borderRadius: "16px", fontWeight: 800, fontSize: '1rem',
                fontFamily: primaryFont,
                boxShadow: "0 10px 20px rgba(0,70,82,0.2)",
                "&:hover": { bgcolor: "#002d35" }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
            </Button>

          </Stack>
        </Box>
      </Stack>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} PaperProps={{ sx: { borderRadius: "24px", p: 1 } }}>
        <DialogTitle sx={{ fontFamily: primaryFont, fontWeight: 900, color: primaryTeal }}>Confirm Product Update</DialogTitle>
        <DialogContent>
            <Typography sx={{ fontFamily: primaryFont, color: "#475569" }}>
                You are about to save the changes made to <b>{form.name}</b>. This will update the item across the catalog immediately.
            </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConfirmDialogOpen(false)} disabled={loading} sx={{ color: "#64748B", fontWeight: 700, fontFamily: primaryFont }}>Cancel</Button>
            <Button onClick={confirmSave} variant="contained" disabled={loading} sx={{ bgcolor: primaryTeal, borderRadius: "10px", fontWeight: 700, fontFamily: primaryFont }}>
              {loading ? "Saving..." : "Confirm & Save"}
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- ATTRACTIVE NOTIFICATION TOAST --- */}
      <Snackbar 
        open={toast.open} autoHideDuration={4000} onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} TransitionComponent={SlideTransition}
      >
        <Alert 
          onClose={handleCloseToast} severity={toast.severity} variant="filled" elevation={6}
          sx={{ width: '100%', fontFamily: primaryFont, fontWeight: 600, borderRadius: "12px", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)", alignItems: "center" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductUpdate;