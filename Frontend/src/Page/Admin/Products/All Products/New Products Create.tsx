import { useState, useEffect } from "react";
import {
  Box, Typography, Stack, Paper, Button, TextField,
  InputLabel, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, CircularProgress, Snackbar, Alert,
  Slide, MenuItem, Switch, Checkbox, FormControlLabel,
  InputAdornment, Chip, Tooltip, Breadcrumbs, Link, Menu,
  AlertTitle
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
  ListAltOutlined,
  TuneOutlined,
  LocalShippingOutlined,
  AttachMoneyOutlined,
  QrCodeOutlined,
  LayersOutlined,
  CheckCircleOutline,
  WhatshotOutlined,
  TrendingUpOutlined,
  RemoveCircleOutline,
  PaletteOutlined,
  CheckroomOutlined,
  CheckOutlined,
  AutoAwesomeOutlined,
  ColorLensOutlined,
  DevicesOutlined,
  SpaOutlined,
  RestaurantOutlined,
  WeekendOutlined,
  KeyboardArrowDownOutlined,
  ElectricBoltOutlined
} from "@mui/icons-material";
import axios from "axios";

// --- CONFIGURATION & TOKENS ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "4d238d1fa158c5dafc2dea4e647d1fa3";

const primaryTeal = "#004652";
const primaryTealHover = "#002D35";
const tealGradient = "linear-gradient(135deg, #004652 0%, #007580 100%)";
const primaryFont = "'Montserrat', sans-serif";
const borderColor = "#E2E8F0";
const surfaceBg = "#F8FAFC";

// --- PRIMARY COLORS (NO HEXADECIMAL INPUT NEEDED) ---
const PRIMARY_COLORS = [
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Green", hex: "#16A34A" },
  { name: "Black", hex: "#0F172A" },
  { name: "White", hex: "#FFFFFF", border: "#CBD5E1" },
  { name: "Navy Blue", hex: "#1E3A8A" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#9333EA" },
  { name: "Orange", hex: "#F97316" },
  { name: "Gray", hex: "#64748B" },
  { name: "Brown", hex: "#78350F" },
  { name: "Beige / Khaki", hex: "#D4B996" },
  { name: "Maroon", hex: "#881337" },
  { name: "Teal", hex: "#0D9488" },
  { name: "Olive Green", hex: "#4D7C0F" },
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];
const FOOTWEAR_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"];
const UNIT_OPTIONS = ["ml", "l", "g", "kg", "oz", "lb", "pcs", "pack"];

const OPTION_TYPES = [
  "Color & Sizes (Clothing)",
  "Primary Color",
  "Size",
  "Selection",
  "Text",
  "Number",
  "Date",
  "CheckBox",
  "Media Image Upload",
  "Unit",
  "Weight"
] as const;
type OptionType = typeof OPTION_TYPES[number];

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
      rawTitle: node.title,
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
        const MAX = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          }
        } else if (height > MAX) {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            }));
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- IMGBB UPLOAD ---
const uploadToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (data.success) return data.data.url;
  throw new Error(data.error?.message || "Failed to upload image");
};

// --- TYPES ---
interface AddAccountProps {
  onBack: () => void;
}

export interface ColorSizeItem {
  id: string;
  color: string;
  sizes: string[];
}

interface VariantOption {
  id: string;
  type: OptionType;
  label: string;
  value: any;
  choices: string;
  images: string[];
  appliesTo: string;
  colorSizes?: ColorSizeItem[];
}

interface Variant {
  id: string;
  name: string;
  price: number | "";
  originalPrice: number | "";
  sku: string;
  category?: string;
  images: string[];
  quantity: number | "";
  brand: string;
  productType: string;
  description: string[];
  size: string;
  unit: string;
  weight: number | "";
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const toNum = (v: string): number | "" => (v === "" ? "" : Number(v));

const emptyVariant = (): Variant => ({
  id: uid(), name: "", price: "", originalPrice: "", sku: "", category: "",
  images: [], quantity: "", brand: "", productType: "", description: [""],
  size: "", unit: "", weight: "",
});

const defaultOptionValue = (type: OptionType) => {
  if (type === "CheckBox") return false;
  if (type === "Primary Color") return "Red";
  if (type === "Color & Sizes (Clothing)") return [];
  return "";
};

// --- CATEGORY PRESETS CATALOG DATA ---
export type CategoryPresetKey = "clothing" | "footwear" | "electronics" | "beauty" | "food" | "furniture" | "colors";

interface CategoryPresetItem {
  key: CategoryPresetKey;
  label: string;
  categoryName: string;
  icon: React.ReactNode;
  description: string;
  tags: string[];
  getOptions: () => VariantOption[];
}

const CATEGORY_PRESET_LIBRARY: CategoryPresetItem[] = [
  {
    key: "clothing",
    label: "Clothing & Apparel",
    categoryName: "Apparel / Fashion",
    icon: <CheckroomOutlined sx={{ fontSize: 15 }} />,
    description: "Color matrix (Red: S-XXL, Yellow: S,XL), Fabric, and Fit options",
    tags: ["cloth", "shirt", "pant", "dress", "fashion", "apparel", "wear", "hoodie", "tshirt", "jacket", "jeans"],
    getOptions: () => [
      {
        id: uid(),
        type: "Color & Sizes (Clothing)",
        label: "Color & Available Sizes",
        value: "",
        choices: "",
        images: [],
        appliesTo: "all",
        colorSizes: [
          { id: uid(), color: "Red", sizes: ["S", "M", "L", "XL", "XXL"] },
          { id: uid(), color: "Yellow", sizes: ["S", "XL"] }
        ]
      },
      {
        id: uid(),
        type: "Selection",
        label: "Fabric / Material",
        value: "100% Cotton",
        choices: "100% Cotton, Polyester, Linen, Rayon, Silk, Wool Blend",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Selection",
        label: "Fit Type",
        value: "Regular Fit",
        choices: "Regular Fit, Slim Fit, Relaxed Fit, Oversized",
        images: [],
        appliesTo: "all"
      }
    ]
  },
  {
    key: "footwear",
    label: "Shoes & Footwear",
    categoryName: "Footwear / Shoes",
    icon: <CategoryOutlined sx={{ fontSize: 15 }} />,
    description: "EU sizes, Primary Shoe Color, and Sole material choices",
    tags: ["shoe", "footwear", "sneaker", "boot", "sandal", "heel", "slippers", "loafer"],
    getOptions: () => [
      {
        id: uid(),
        type: "Primary Color",
        label: "Footwear Color",
        value: "Black",
        choices: "",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Selection",
        label: "Shoe Size (EU)",
        value: "42",
        choices: FOOTWEAR_SIZES.join(", "),
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Selection",
        label: "Outer Material",
        value: "Genuine Leather",
        choices: "Genuine Leather, Mesh, Canvas, Suede, Synthetic",
        images: [],
        appliesTo: "all"
      }
    ]
  },
  {
    key: "electronics",
    label: "Electronics & Tech",
    categoryName: "Electronics & Gadgets",
    icon: <DevicesOutlined sx={{ fontSize: 15 }} />,
    description: "Internal Storage capacity, Finish Color, and Warranty coverage",
    tags: ["electronic", "phone", "mobile", "laptop", "computer", "gadget", "watch", "tech", "audio", "headphone"],
    getOptions: () => [
      {
        id: uid(),
        type: "Selection",
        label: "Storage Capacity",
        value: "128GB",
        choices: "64GB, 128GB, 256GB, 512GB, 1TB",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Primary Color",
        label: "Device Color Finish",
        value: "Black",
        choices: "",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Selection",
        label: "Warranty Period",
        value: "1 Year Official",
        choices: "6 Months, 1 Year Official, 2 Years Comprehensive",
        images: [],
        appliesTo: "all"
      }
    ]
  },
  {
    key: "beauty",
    label: "Beauty & Cosmetics",
    categoryName: "Cosmetics / Fragrance",
    icon: <SpaOutlined sx={{ fontSize: 15 }} />,
    description: "Shade/Tone, Volume (ml), and Skin Type compatibility",
    tags: ["beauty", "cosmetic", "perfume", "fragrance", "skin", "makeup", "hair", "care", "lotion", "serum"],
    getOptions: () => [
      {
        id: uid(),
        type: "Selection",
        label: "Bottle Volume",
        value: "50ml",
        choices: "30ml, 50ml, 100ml, 150ml, 200ml",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Primary Color",
        label: "Shade / Tone",
        value: "Pink",
        choices: "",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Selection",
        label: "Skin Compatibility",
        value: "All Skin Types",
        choices: "All Skin Types, Sensitive Skin, Oily Skin, Dry Skin",
        images: [],
        appliesTo: "all"
      }
    ]
  },
  {
    key: "food",
    label: "Food, Grocery & Nutrition",
    categoryName: "Grocery & Foods",
    icon: <RestaurantOutlined sx={{ fontSize: 15 }} />,
    description: "Package net weight, Flavor profiles, and Expiry best before date",
    tags: ["food", "grocery", "snack", "drink", "beverage", "tea", "coffee", "fruit", "spice", "nut", "organic"],
    getOptions: () => [
      {
        id: uid(),
        type: "Selection",
        label: "Pack Size / Weight",
        value: "500g",
        choices: "250g, 500g, 1kg, 2kg, 5kg",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Selection",
        label: "Flavor / Variant",
        value: "Original",
        choices: "Original, Vanilla, Chocolate, Spicy, Roasted, Honey",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Date",
        label: "Best Before / Expiry Date",
        value: "",
        choices: "",
        images: [],
        appliesTo: "all"
      }
    ]
  },
  {
    key: "furniture",
    label: "Home & Furniture",
    categoryName: "Furniture & Decor",
    icon: <WeekendOutlined sx={{ fontSize: 15 }} />,
    description: "Finish color, Wood/Material type, and Dimensions",
    tags: ["furniture", "home", "decor", "chair", "table", "sofa", "bed", "living", "wood", "cushion"],
    getOptions: () => [
      {
        id: uid(),
        type: "Primary Color",
        label: "Finish / Upholstery Color",
        value: "Brown",
        choices: "",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Selection",
        label: "Primary Material",
        value: "Solid Teak Wood",
        choices: "Solid Teak Wood, Engineered Oak, Stainless Steel, Velvet Fabric",
        images: [],
        appliesTo: "all"
      },
      {
        id: uid(),
        type: "Text",
        label: "Dimensions (L x W x H)",
        value: "120cm x 60cm x 75cm",
        choices: "",
        images: [],
        appliesTo: "all"
      }
    ]
  },
  {
    key: "colors",
    label: "Primary Color Preset",
    categoryName: "Color Palette",
    icon: <ColorLensOutlined sx={{ fontSize: 15 }} />,
    description: "Direct primary color selector (No hex required)",
    tags: ["color", "swatch", "palette"],
    getOptions: () => [
      {
        id: uid(),
        type: "Primary Color",
        label: "Primary Color",
        value: "Red",
        choices: "",
        images: [],
        appliesTo: "all"
      }
    ]
  }
];

// --- COMPACT TYPOGRAPHY & STYLING ---
const labelSx = {
  mb: 0.5,
  ml: 0.3,
  fontWeight: 700,
  fontSize: "0.66rem",
  fontFamily: primaryFont,
  color: "#475569",
  letterSpacing: "0.4px",
  textTransform: "uppercase" as const,
};

const menuItemSx = {
  fontFamily: primaryFont,
  fontSize: "0.75rem",
  fontWeight: 500,
  py: 0.6,
  "&:hover": { bgcolor: "rgba(0, 70, 82, 0.06)" },
  "&.Mui-selected": { bgcolor: "rgba(0, 70, 82, 0.12) !important", fontWeight: 700 }
};

const inputStyle = {
  "& .MuiInputBase-input": {
    color: "#0F172A !important",
    WebkitTextFillColor: "#0F172A !important",
    fontSize: "0.78rem",
    fontWeight: 600,
    fontFamily: primaryFont,
    py: 0.95,
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px #F8FAFC inset !important",
    WebkitTextFillColor: "#0F172A !important",
    caretColor: "#0F172A",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontFamily: primaryFont,
    bgcolor: surfaceBg,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover": {
      bgcolor: "#FFFFFF",
      "& fieldset": { borderColor: "#CBD5E1" }
    },
    "&.Mui-focused": {
      bgcolor: "#FFFFFF",
      boxShadow: "0 0 0 3px rgba(0, 70, 82, 0.12)",
      "& fieldset": { borderColor: primaryTeal, borderWidth: "1.5px" }
    },
  },
  "& .Mui-disabled": {
    WebkitTextFillColor: "#94A3B8 !important",
    bgcolor: "#F1F5F9",
    "& fieldset": { borderColor: "#E2E8F0" }
  },
  "& .MuiFormHelperText-root": {
    fontFamily: primaryFont,
    fontSize: "0.64rem",
    mt: 0.3,
  }
};

const variantInputStyle = {
  ...inputStyle,
  "& .MuiOutlinedInput-root": {
    borderRadius: "7px",
    bgcolor: "#FFFFFF",
    transition: "all 0.2s ease-in-out",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(0, 70, 82, 0.1)",
      "& fieldset": { borderColor: primaryTeal, borderWidth: "1.5px" },
    },
  },
};

const paperSx = {
  p: { xs: 1.8, md: 2.5 },
  borderRadius: "14px",
  border: `1px solid ${borderColor}`,
  bgcolor: "#FFFFFF",
  boxShadow: "0 6px 20px -8px rgba(15, 23, 42, 0.04)",
  transition: "box-shadow 0.25s ease",
  "&:hover": {
    boxShadow: "0 10px 25px -8px rgba(15, 23, 42, 0.06)",
  }
};

// --- REUSABLE COMPONENTS ---
const SectionHeader = ({
  icon,
  title,
  subtitle,
  stepNumber,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  stepNumber?: string;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "8px",
          background: tealGradient,
          color: "#FFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,70,82,0.2)"
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.88rem", color: "#0F172A", letterSpacing: -0.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: "0.67rem", color: "#64748B", fontWeight: 500, fontFamily: primaryFont, mt: 0.1 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {stepNumber && (
      <Chip
        label={stepNumber}
        size="small"
        sx={{
          height: 20,
          bgcolor: "rgba(0, 70, 82, 0.07)",
          color: primaryTeal,
          fontWeight: 800,
          fontFamily: primaryFont,
          fontSize: "0.62rem",
          letterSpacing: 0.2
        }}
      />
    )}
  </Box>
);

const Field = ({ label, children, flex = 1, required = false }: { label: string; children: React.ReactNode; flex?: number; required?: boolean }) => (
  <Box sx={{ flex, minWidth: 0 }}>
    <InputLabel sx={labelSx}>
      {label} {required && <Box component="span" sx={{ color: "#EF4444" }}>*</Box>}
    </InputLabel>
    {children}
  </Box>
);

/** URL paste + multi-file upload + thumbnail grid */
const ImageUploader = ({
  images, onChange, onToast, sx = inputStyle, compact = false,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  onToast: (msg: string, severity?: "success" | "error" | "warning" | "info") => void;
  sx?: any;
  compact?: boolean;
}) => {
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const addUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput("");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map(async (f) => uploadToImgBB(await compressImage(f)))
      );
      onChange([...images, ...urls]);
      onToast(`${urls.length} image(s) uploaded successfully!`, "success");
    } catch {
      onToast("Upload failed. Please check network/key.", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          p: compact ? 1.2 : 2,
          border: `1.5px dashed ${borderColor}`,
          borderRadius: "12px",
          bgcolor: "#FAFBFD",
          textAlign: "center",
          transition: "all 0.2s ease",
          "&:hover": { borderColor: primaryTeal, bgcolor: "rgba(0, 70, 82, 0.01)" },
          mb: 1.8
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
          <TextField
            fullWidth
            size="small"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste direct image URL and press Enter..."
            sx={sx}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <Button
            component="label"
            variant="contained"
            size="small"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={12} color="inherit" /> : <CloudUploadOutlined sx={{ fontSize: 15 }} />}
            sx={{
              bgcolor: primaryTeal,
              whiteSpace: "nowrap",
              height: 32,
              px: 1.6,
              borderRadius: "7px",
              fontFamily: primaryFont,
              fontWeight: 700,
              fontSize: "0.72rem",
              textTransform: "none",
              boxShadow: "0 2px 6px rgba(0,70,82,0.18)",
              "&:hover": { bgcolor: primaryTealHover },
            }}
          >
            {uploading ? "Uploading..." : "Upload Files"}
            <input type="file" accept="image/*" multiple hidden onChange={handleUpload} />
          </Button>
        </Stack>
      </Box>

      {images.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: compact ? "repeat(auto-fill, minmax(65px, 1fr))" : "repeat(auto-fill, minmax(85px, 1fr))", gap: 1 }}>
          {images.map((img, i) => (
            <Box
              key={`${img}-${i}`}
              sx={{
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                border: `1.5px solid ${i === 0 ? primaryTeal : borderColor}`,
                aspectRatio: "1/1",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                "&:hover .overlay-action": { opacity: 1 }
              }}
            >
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />

              {i === 0 && (
                <Chip
                  label="Cover"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 3,
                    left: 3,
                    height: 15,
                    fontSize: "0.56rem",
                    fontWeight: 800,
                    bgcolor: primaryTeal,
                    color: "#FFF",
                    fontFamily: primaryFont
                  }}
                />
              )}

              <Box
                className="overlay-action"
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(15, 23, 42, 0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s ease"
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                  sx={{ bgcolor: "#FFF", color: "#EF4444", p: 0.4, "&:hover": { bgcolor: "#FEE2E2" } }}
                >
                  <DeleteOutline sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// =====================================================================
// PRIMARY COLOR PALETTE SELECTOR (NO HEX CODE NEEDED)
// =====================================================================
const PrimaryColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (colorName: string) => void;
}) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, alignItems: "center" }}>
        {PRIMARY_COLORS.map((c) => {
          const isSelected = value === c.name;
          return (
            <Tooltip key={c.name} title={c.name} arrow>
              <Box
                onClick={() => onChange(c.name)}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 0.9,
                  py: 0.35,
                  borderRadius: "16px",
                  cursor: "pointer",
                  bgcolor: isSelected ? "rgba(0, 70, 82, 0.12)" : "#FFFFFF",
                  border: isSelected ? `1.5px solid ${primaryTeal}` : `1px solid ${borderColor}`,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: primaryTeal,
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                  }
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: c.hex,
                    border: c.border ? `1px solid ${c.border}` : "1px solid rgba(0,0,0,0.15)",
                    flexShrink: 0
                  }}
                />
                <Typography sx={{ fontFamily: primaryFont, fontSize: "0.68rem", fontWeight: isSelected ? 800 : 600, color: isSelected ? primaryTeal : "#334155" }}>
                  {c.name}
                </Typography>
                {isSelected && <CheckOutlined sx={{ fontSize: 12, color: primaryTeal }} />}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

// =====================================================================
// CLOTHING COLOR & SIZE MATRIX (E.G. RED: S,M,L,XL,XXL | YELLOW: S,XL)
// =====================================================================
const ClothingColorSizeMatrix = ({
  colorSizes = [],
  onChange,
  onGenerateVariants,
}: {
  colorSizes: ColorSizeItem[];
  onChange: (list: ColorSizeItem[]) => void;
  onGenerateVariants?: () => void;
}) => {
  const addColorRow = () => {
    const usedColors = colorSizes.map((c) => c.color);
    const available = PRIMARY_COLORS.find((pc) => !usedColors.includes(pc.name))?.name || "Red";
    onChange([
      ...colorSizes,
      { id: uid(), color: available, sizes: ["S", "M", "L"] }
    ]);
  };

  const updateColorRow = (id: string, patch: Partial<ColorSizeItem>) => {
    onChange(colorSizes.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeColorRow = (id: string) => {
    onChange(colorSizes.filter((item) => item.id !== id));
  };

  const toggleSize = (item: ColorSizeItem, size: string) => {
    const nextSizes = item.sizes.includes(size)
      ? item.sizes.filter((s) => s !== size)
      : [...item.sizes, size];
    updateColorRow(item.id, { sizes: nextSizes });
  };

  const selectAllSizes = (id: string) => {
    updateColorRow(id, { sizes: [...CLOTHING_SIZES] });
  };

  const clearSizes = (id: string) => {
    updateColorRow(id, { sizes: [] });
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Top action helper */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 1.6 }}>
        <Box>
          <Typography sx={{ fontFamily: primaryFont, fontSize: "0.73rem", fontWeight: 800, color: "#1E293B" }}>
            Configure Colors & Sizes
          </Typography>
          <Typography sx={{ fontFamily: primaryFont, fontSize: "0.65rem", color: "#64748B" }}>
            e.g. Red has S, M, L, XL, XXL; Yellow has S & XL
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.8}>
          <Button
            size="small"
            variant="outlined"
            onClick={addColorRow}
            startIcon={<AddBoxOutlined sx={{ fontSize: 13 }} />}
            sx={{
              borderRadius: "6px",
              fontFamily: primaryFont,
              fontWeight: 700,
              fontSize: "0.68rem",
              color: primaryTeal,
              borderColor: primaryTeal,
              textTransform: "none",
              py: 0.35,
              px: 1.0,
              height: 28
            }}
          >
            Add Color
          </Button>

          {onGenerateVariants && colorSizes.length > 0 && (
            <Button
              size="small"
              variant="contained"
              onClick={onGenerateVariants}
              startIcon={<AutoAwesomeOutlined sx={{ fontSize: 13 }} />}
              sx={{
                borderRadius: "6px",
                fontFamily: primaryFont,
                fontWeight: 800,
                fontSize: "0.68rem",
                bgcolor: primaryTeal,
                textTransform: "none",
                py: 0.35,
                px: 1.1,
                height: 28,
                boxShadow: "0 2px 6px rgba(0,70,82,0.18)",
                "&:hover": { bgcolor: primaryTealHover }
              }}
            >
              Generate Variants
            </Button>
          )}
        </Stack>
      </Stack>

      {colorSizes.length === 0 ? (
        <Box sx={{ p: 2, textAlign: "center", bgcolor: "#FFFFFF", borderRadius: "8px", border: `1.5px dashed ${borderColor}` }}>
          <CheckroomOutlined sx={{ fontSize: 24, color: "#94A3B8", mb: 0.4 }} />
          <Typography sx={{ fontFamily: primaryFont, fontSize: "0.72rem", fontWeight: 700, color: "#64748B" }}>
            No clothing colors configured yet
          </Typography>
          <Button
            size="small"
            onClick={() =>
              onChange([
                { id: uid(), color: "Red", sizes: ["S", "M", "L", "XL", "XXL"] },
                { id: uid(), color: "Yellow", sizes: ["S", "XL"] }
              ])
            }
            sx={{ mt: 0.8, fontFamily: primaryFont, fontSize: "0.67rem", fontWeight: 700, color: primaryTeal, textTransform: "none", py: 0.2 }}
          >
            Load Recommended: Red (S, M, L, XL, XXL) & Yellow (S, XL)
          </Button>
        </Box>
      ) : (
        <Stack spacing={1.3}>
          {colorSizes.map((item, idx) => {
            const activeColorObj = PRIMARY_COLORS.find((c) => c.name === item.color) || {
              name: item.color,
              hex: "#94A3B8"
            };

            return (
              <Box
                key={item.id}
                sx={{
                  p: 1.4,
                  borderRadius: "10px",
                  bgcolor: "#FFFFFF",
                  border: `1.5px solid ${borderColor}`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                }}
              >
                {/* Header: Color Select + Delete */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={`Color #${idx + 1}`}
                      size="small"
                      sx={{ height: 18, bgcolor: "rgba(0, 70, 82, 0.08)", color: primaryTeal, fontWeight: 800, fontSize: "0.62rem", fontFamily: primaryFont }}
                    />
                    <Box
                      sx={{
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        bgcolor: activeColorObj.hex,
                        border: "1px solid rgba(0,0,0,0.2)"
                      }}
                    />
                    <TextField
                      select
                      size="small"
                      value={item.color}
                      onChange={(e) => updateColorRow(item.id, { color: e.target.value })}
                      sx={{
                        minWidth: 135,
                        "& .MuiInputBase-input": { py: 0.45, fontSize: "0.74rem", fontWeight: 700, fontFamily: primaryFont }
                      }}
                    >
                      {PRIMARY_COLORS.map((pc) => (
                        <MenuItem key={pc.name} value={pc.name} sx={menuItemSx}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: pc.hex, border: "1px solid rgba(0,0,0,0.15)" }} />
                            {pc.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <Button size="small" onClick={() => selectAllSizes(item.id)} sx={{ fontSize: "0.62rem", textTransform: "none", p: 0.2, color: "#64748B", fontFamily: primaryFont }}>
                      Select All
                    </Button>
                    <Typography sx={{ color: "#CBD5E1", fontSize: "0.65rem" }}>|</Typography>
                    <Button size="small" onClick={() => clearSizes(item.id)} sx={{ fontSize: "0.62rem", textTransform: "none", p: 0.2, color: "#64748B", fontFamily: primaryFont }}>
                      Clear
                    </Button>
                    <Tooltip title="Remove color">
                      <IconButton size="small" onClick={() => removeColorRow(item.id)} sx={{ color: "#EF4444", p: 0.3 }}>
                        <DeleteOutline sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                {/* Size toggle chips */}
                <Box>
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "0.65rem", fontWeight: 700, color: "#64748B", mb: 0.5, textTransform: "uppercase" }}>
                    Available Sizes for {item.color}:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                    {CLOTHING_SIZES.map((sz) => {
                      const isChecked = item.sizes.includes(sz);
                      return (
                        <Box
                          key={sz}
                          onClick={() => toggleSize(item, sz)}
                          sx={{
                            px: 1,
                            py: 0.35,
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            fontFamily: primaryFont,
                            userSelect: "none",
                            transition: "all 0.15s ease",
                            bgcolor: isChecked ? primaryTeal : "#F8FAFC",
                            color: isChecked ? "#FFFFFF" : "#475569",
                            border: `1.2px solid ${isChecked ? primaryTeal : borderColor}`,
                            "&:hover": {
                              borderColor: primaryTeal,
                              transform: "translateY(-1px)"
                            }
                          }}
                        >
                          {isChecked && <CheckOutlined sx={{ fontSize: 10, mr: 0.3, verticalAlign: "middle" }} />}
                          {sz}
                        </Box>
                      );
                    })}
                  </Box>
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "0.65rem", color: item.sizes.length ? primaryTeal : "#EF4444", mt: 0.6, fontWeight: 700 }}>
                    {item.sizes.length > 0 ? `Selected ${item.sizes.length} size(s): ${item.sizes.join(", ")}` : "⚠️ Please select at least one size"}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

/** Dynamic Input by Option Type */
const OptionValueInput = ({
  opt,
  onPatch,
  onToast,
  onGenerateVariants,
}: {
  opt: VariantOption;
  onPatch: (patch: Partial<VariantOption>) => void;
  onToast: (msg: string, severity?: "success" | "error" | "warning" | "info") => void;
  onGenerateVariants?: (colorSizes: ColorSizeItem[]) => void;
}) => {
  switch (opt.type) {
    case "Color & Sizes (Clothing)":
      return (
        <ClothingColorSizeMatrix
          colorSizes={opt.colorSizes || []}
          onChange={(colorSizes) => onPatch({ colorSizes })}
          onGenerateVariants={onGenerateVariants ? () => onGenerateVariants(opt.colorSizes || []) : undefined}
        />
      );

    case "Primary Color":
      return (
        <Stack spacing={0.8}>
          <PrimaryColorPicker
            value={opt.value || "Red"}
            onChange={(selectedColor) => onPatch({ value: selectedColor })}
          />
          <Typography sx={{ fontFamily: primaryFont, fontSize: "0.68rem", color: "#64748B", fontWeight: 600 }}>
            Selected Primary Color: <b style={{ color: primaryTeal }}>{opt.value || "Red"}</b>
          </Typography>
        </Stack>
      );

    case "Text":
      return <TextField fullWidth value={opt.value} onChange={(e) => onPatch({ value: e.target.value })} placeholder="Enter value..." sx={variantInputStyle} />;

    case "Number":
      return <TextField fullWidth type="number" value={opt.value} onChange={(e) => onPatch({ value: toNum(e.target.value) })} placeholder="0" sx={variantInputStyle} />;

    case "Date":
      return <TextField fullWidth type="date" value={opt.value} onChange={(e) => onPatch({ value: e.target.value })} InputLabelProps={{ shrink: true }} sx={variantInputStyle} />;

    case "CheckBox":
      return (
        <FormControlLabel
          control={<Checkbox checked={!!opt.value} onChange={(e) => onPatch({ value: e.target.checked })} sx={{ color: primaryTeal, "&.Mui-checked": { color: primaryTeal }, p: 0.6 }} />}
          label={<Typography sx={{ fontFamily: primaryFont, fontSize: "0.75rem", fontWeight: 600 }}>{opt.label || "Enabled by default"}</Typography>}
        />
      );

    case "Selection": {
      const list = opt.choices.split(",").map((s) => s.trim()).filter(Boolean);
      return (
        <Stack spacing={1}>
          <TextField
            fullWidth value={opt.choices}
            onChange={(e) => onPatch({ choices: e.target.value })}
            placeholder="Choices, comma separated (e.g. Cotton, Linen, Polyester)"
            sx={variantInputStyle}
          />
          <TextField
            select fullWidth value={list.includes(opt.value) ? opt.value : ""}
            onChange={(e) => onPatch({ value: e.target.value })}
            disabled={list.length === 0}
            helperText={list.length === 0 ? "Enter comma-separated choices above" : "Choose default selected item"}
            sx={variantInputStyle}
          >
            {list.map((c) => <MenuItem key={c} value={c} sx={menuItemSx}>{c}</MenuItem>)}
          </TextField>
        </Stack>
      );
    }

    case "Media Image Upload":
      return <ImageUploader compact images={opt.images} onChange={(imgs) => onPatch({ images: imgs })} onToast={onToast} sx={variantInputStyle} />;

    case "Size":
      return (
        <TextField select fullWidth value={opt.value} onChange={(e) => onPatch({ value: e.target.value })} sx={variantInputStyle}>
          {CLOTHING_SIZES.map((s) => <MenuItem key={s} value={s} sx={menuItemSx}>{s}</MenuItem>)}
        </TextField>
      );

    case "Unit":
      return (
        <TextField select fullWidth value={opt.value} onChange={(e) => onPatch({ value: e.target.value })} sx={variantInputStyle}>
          {UNIT_OPTIONS.map((u) => <MenuItem key={u} value={u} sx={menuItemSx}>{u}</MenuItem>)}
        </TextField>
      );

    case "Weight":
      return (
        <TextField
          fullWidth type="number" value={opt.value} onChange={(e) => onPatch({ value: toNum(e.target.value) })} placeholder="0"
          InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.70rem", color: "#64748B" }}>g</Typography></InputAdornment> }}
          sx={variantInputStyle}
        />
      );

    default:
      return null;
  }
};

// =====================================================================
// MAIN COMPONENT
// =====================================================================
const NewProductsCreate = ({ onBack }: AddAccountProps) => {
  // STATE
  const [form, setForm] = useState({
    name: "",
    price: "" as number | "",
    originalPrice: "" as number | "",
    sku: "",
    category: "",
    mainCategory: "",
    images: [] as string[],
    quantity: "" as number | "",
    brand: "",
    productType: "",
    description: "",
    size: "",
    unit: "",
    weight: "" as number | "",
    itemForm: "",
    fragrance: "",
    packagingType: "",
    materialTypeFree: "",
    keyFeatures: "",
    variants: [] as Variant[],
    options: [] as VariantOption[],
    originType: "Local",
    country: "",
    countryFlag: "",
    availability: "On Hand",
    deliveryTime: "1-3 Days Delivery",
    soldOut: false,
    minQty: "" as number | "",
    maxQty: "" as number | "",
    todaySpecial: false,
    popularProduct: false,
    tags: "",
  });

  const [categoriesFlat, setCategoriesFlat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Add Option Menu Anchor State
  const [addOptionAnchorEl, setAddOptionAnchorEl] = useState<null | HTMLElement>(null);

  const [toast, setToast] = useState({
    open: false, message: "", severity: "info" as "success" | "error" | "warning" | "info",
  });

  const showToast = (message: string, severity: "success" | "error" | "warning" | "info" = "info") =>
    setToast({ open: true, message, severity });

  const handleCloseToast = (_e?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  // --- FETCH CATEGORIES ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/Categorysection`);
        let all: any[] = [];
        res.data.forEach((doc: any) => {
          if (doc.categories?.length) all = all.concat(doc.categories);
        });
        setCategoriesFlat(flattenCategories(all));
      } catch {
        showToast("Failed to load categories", "error");
      }
    };
    fetchCategories();
  }, []);

  // --- DETECT RELEVANT CATEGORY PRESET AUTOMATICALLY ---
  const getDetectedCategoryPreset = (): CategoryPresetItem | null => {
    if (!form.category) return null;
    const catObj = categoriesFlat.find((c) => c.id === form.category);
    const searchString = `${catObj?.rawTitle || catObj?.title || ""} ${form.name}`.toLowerCase();

    for (const preset of CATEGORY_PRESET_LIBRARY) {
      if (preset.tags.some((tag) => searchString.includes(tag))) {
        return preset;
      }
    }
    return null;
  };

  const detectedPreset = getDetectedCategoryPreset();

  // --- FORM HANDLERS ---
  const handleChange = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((prev) => ({
      ...prev,
      availability: v,
      deliveryTime: v === "On Hand" ? "1-3 Days Delivery" : "7-14 Days Delivery",
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedName = e.target.value;
    const c = COUNTRIES.find((x) => x.name === selectedName);
    setForm((prev) => ({
      ...prev,
      country: selectedName,
      countryFlag: c ? `https://flagcdn.com/w80/${c.code.toLowerCase()}.png` : "",
    }));
  };

  // --- APPLY SPECIFIC CATEGORY PRESET ---
  const applyPresetByKey = (presetKey: CategoryPresetKey) => {
    const preset = CATEGORY_PRESET_LIBRARY.find((p) => p.key === presetKey);
    if (!preset) return;
    const newOpts = preset.getOptions();
    setForm((p) => ({ ...p, options: newOpts }));
    showToast(`Applied ${preset.label} Options template!`, "success");
  };

  // --- AUTO-GENERATE VARIANTS FROM COLOR & SIZES ---
  const handleGenerateVariantsFromColorSizes = (colorSizes: ColorSizeItem[]) => {
    if (!colorSizes || colorSizes.length === 0) {
      showToast("No colors configured to generate variants.", "warning");
      return;
    }

    const generated: Variant[] = [];
    colorSizes.forEach((cs) => {
      cs.sizes.forEach((sz) => {
        generated.push({
          id: uid(),
          name: `${cs.color} / ${sz}`,
          price: form.price || form.originalPrice || "",
          originalPrice: form.originalPrice || "",
          sku: `${form.sku ? `${form.sku}-` : "SKU-"}${cs.color.toUpperCase().slice(0, 3)}-${sz}`,
          category: form.category || "",
          images: [],
          quantity: form.quantity || 10,
          brand: form.brand || "",
          productType: form.productType || "",
          description: [""],
          size: sz,
          unit: "pcs",
          weight: form.weight || ""
        });
      });
    });

    if (generated.length === 0) {
      showToast("Please select at least one size for your colors.", "warning");
      return;
    }

    setForm((prev) => ({ ...prev, variants: generated }));
    showToast(`Generated ${generated.length} variant(s) successfully!`, "success");
  };

  // --- VARIANT HELPERS ---
  const addVariant = () => setForm((p) => ({ ...p, variants: [...p.variants, emptyVariant()] }));

  const removeVariant = (id: string) =>
    setForm((p) => ({
      ...p,
      variants: p.variants.filter((v) => v.id !== id),
      options: p.options.map((o) => (o.appliesTo === id ? { ...o, appliesTo: "all" } : o)),
    }));

  const patchVariant = (id: string, patch: Partial<Variant>) =>
    setForm((p) => ({ ...p, variants: p.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));

  const updateDescLine = (v: Variant, idx: number, text: string) =>
    patchVariant(v.id, { description: v.description.map((d, i) => (i === idx ? text : d)) });
  const addDescLine = (v: Variant) => patchVariant(v.id, { description: [...v.description, ""] });
  const removeDescLine = (v: Variant, idx: number) => {
    const next = v.description.filter((_, i) => i !== idx);
    patchVariant(v.id, { description: next.length ? next : [""] });
  };

  // --- OPTIONS HELPERS ---
  const addSpecificOptionType = (type: OptionType) => {
    setAddOptionAnchorEl(null);
    const newOpt: VariantOption = {
      id: uid(),
      type,
      label: type === "Color & Sizes (Clothing)" ? "Color & Sizes" : type,
      value: defaultOptionValue(type),
      choices: type === "Selection" ? "Option A, Option B, Option C" : "",
      images: [],
      appliesTo: "all",
      colorSizes: type === "Color & Sizes (Clothing)"
        ? [
            { id: uid(), color: "Red", sizes: ["S", "M", "L", "XL", "XXL"] },
            { id: uid(), color: "Yellow", sizes: ["S", "XL"] }
          ]
        : undefined
    };
    setForm((p) => ({ ...p, options: [...p.options, newOpt] }));
    showToast(`Added option: ${type}`, "info");
  };

  const patchOption = (optId: string, patch: Partial<VariantOption>) =>
    setForm((p) => ({ ...p, options: p.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)) }));

  const changeOptionType = (optId: string, type: OptionType) => {
    const defaultColorSizes =
      type === "Color & Sizes (Clothing)"
        ? [
            { id: uid(), color: "Red", sizes: ["S", "M", "L", "XL", "XXL"] },
            { id: uid(), color: "Yellow", sizes: ["S", "XL"] }
          ]
        : undefined;

    patchOption(optId, {
      type,
      value: defaultOptionValue(type),
      choices: "",
      images: [],
      colorSizes: defaultColorSizes
    });
  };

  const removeOption = (optId: string) =>
    setForm((p) => ({ ...p, options: p.options.filter((o) => o.id !== optId) }));

  // --- SAVE LOGIC ---
  const handleSaveClick = () => {
    if (!form.name || !form.price || !form.category) {
      showToast("Please fill in Product Name, Category, and Offer Price.", "warning");
      return;
    }
    if (form.originalPrice !== "" && Number(form.price) > Number(form.originalPrice)) {
      showToast("Offer price cannot be higher than original price.", "warning");
      return;
    }
    const badVariant = form.variants.findIndex((v) => !v.name.trim());
    if (badVariant !== -1) {
      showToast(`Variant ${badVariant + 1} is missing a name.`, "warning");
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmSave = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);

    const payload = {
      ...form,
      variants: form.variants.map(({ id, description, ...rest }) => ({
        ...rest,
        description: description.map((d) => d.trim()).filter(Boolean),
      })),
      options: form.options.map(({ id: _oid, appliesTo, ...o }) => ({
        ...o,
        appliesTo:
          appliesTo === "all" || appliesTo === "product"
            ? appliesTo
            : form.variants.find((v) => v.id === appliesTo)?.name || "all",
      })),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/Products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast("Product published successfully!", "success");
        setTimeout(() => onBack(), 1200);
      } else {
        const error = await response.json();
        showToast(`Server Error: ${error.message || "Failed to save product"}`, "error");
      }
    } catch {
      showToast("Database connection failed. Check your API server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const categorySelect = (value: string, onChange: (id: string) => void, sx: any) => (
    <TextField select fullWidth value={value} onChange={(e) => onChange(e.target.value)} sx={sx}>
      {categoriesFlat.map((cat) => (
        <MenuItem key={cat.id} value={cat.id} sx={menuItemSx}>{cat.title}</MenuItem>
      ))}
    </TextField>
  );

  return (
    <Box sx={{ maxWidth: "1550px", mx: "auto", px: { xs: 1.8, md: 2.5 }, py: 2 }}>
      {/* HEADER / NAVIGATION BAR */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Breadcrumbs separator="›" sx={{ mb: 0.3, fontFamily: primaryFont, fontSize: "0.72rem" }}>
            <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: "pointer" }}>
              Catalog
            </Link>
            <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: "pointer" }}>
              Products
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 700, fontSize: "0.72rem", fontFamily: primaryFont }}>
              Create New
            </Typography>
          </Breadcrumbs>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontFamily: primaryFont, fontWeight: 900, color: "#0F172A", fontSize: "1.08rem", letterSpacing: -0.3 }}>
              Add New Product
            </Typography>
            <Chip label="Draft" size="small" sx={{ height: 18, bgcolor: "#E2E8F0", color: "#475569", fontWeight: 700, fontSize: "0.62rem", fontFamily: primaryFont }} />
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            onClick={onBack}
            startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: "11px !important" }} />}
            sx={{
              fontFamily: primaryFont,
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "none",
              color: "#64748B",
              px: 1.4,
              py: 0.5,
              height: 32,
              borderRadius: "7px",
              "&:hover": { bgcolor: "#F1F5F9", color: "#0F172A" }
            }}
          >
            Discard
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSaveClick}
            disabled={loading}
            sx={{
              background: tealGradient,
              borderRadius: "8px",
              fontFamily: primaryFont,
              fontWeight: 800,
              fontSize: "0.74rem",
              textTransform: "none",
              px: 1.8,
              py: 0.6,
              height: 32,
              boxShadow: "0 2px 8px rgba(0,70,82,0.22)",
              "&:hover": { background: primaryTealHover }
            }}
          >
            {loading ? <CircularProgress size={14} color="inherit" /> : "Save & Publish"}
          </Button>
        </Stack>
      </Stack>

      {/* 2-COLUMN LAYOUT */}
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>
        {/* ================= LEFT MAIN CONTENT ================= */}
        <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 67%" }, minWidth: 0 }}>
          <Stack spacing={2.5}>

            {/* STEP 1: PRODUCT DETAILS */}
            <Paper elevation={0} sx={paperSx}>
              <SectionHeader
                icon={<Inventory2Outlined sx={{ fontSize: 17 }} />}
                title="Product Details"
                subtitle="Specify title, classification, pricing, and main attributes"
                stepNumber="Step 1"
              />

              <Stack spacing={1.8}>
                <Field label="Product Name" required>
                  <TextField
                    fullWidth
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Premium Cotton Casual Crewneck T-Shirt"
                    sx={inputStyle}
                  />
                </Field>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Field label="Category" required>
                    {categorySelect(form.category, (id) => {
                      const selected = categoriesFlat.find((c) => c.id === id);
                      setForm((prev) => ({ ...prev, category: id, mainCategory: selected?.rootId || id }));
                    }, inputStyle)}
                  </Field>
                  <Field label="Parent / Root Category">
                    <TextField
                      fullWidth
                      disabled
                      value={categoriesFlat.find((c) => c.id === form.mainCategory)?.title || "Auto Assigned"}
                      sx={inputStyle}
                    />
                  </Field>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Field label="Regular Price">
                    <TextField
                      fullWidth
                      type="number"
                      value={form.originalPrice}
                      onChange={(e) => handleChange("originalPrice", toNum(e.target.value))}
                      placeholder="0.00"
                      InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyOutlined sx={{ color: "#94A3B8", fontSize: 16 }} /></InputAdornment> }}
                      sx={inputStyle}
                    />
                  </Field>
                  <Field label="Offer Price" required>
                    <TextField
                      fullWidth
                      type="number"
                      value={form.price}
                      onChange={(e) => handleChange("price", toNum(e.target.value))}
                      placeholder="0.00"
                      InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyOutlined sx={{ color: primaryTeal, fontSize: 16 }} /></InputAdornment> }}
                      sx={inputStyle}
                    />
                  </Field>
                  <Field label="SKU / Barcode">
                    <TextField
                      fullWidth
                      value={form.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                      placeholder="SKU-89214"
                      InputProps={{ startAdornment: <InputAdornment position="start"><QrCodeOutlined sx={{ color: "#94A3B8", fontSize: 16 }} /></InputAdornment> }}
                      sx={inputStyle}
                    />
                  </Field>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Field label="Current Stock Units">
                    <TextField
                      fullWidth
                      type="number"
                      value={form.quantity}
                      onChange={(e) => handleChange("quantity", toNum(e.target.value))}
                      placeholder="0"
                      sx={inputStyle}
                    />
                  </Field>
                  <Field label="Brand / Manufacturer">
                    <TextField
                      fullWidth
                      value={form.brand}
                      onChange={(e) => handleChange("brand", e.target.value)}
                      placeholder="e.g. Zara, Nike, Uniqlo"
                      sx={inputStyle}
                    />
                  </Field>
                  <Field label="Product Subtype">
                    <TextField
                      fullWidth
                      value={form.productType}
                      onChange={(e) => handleChange("productType", e.target.value)}
                      placeholder="e.g. Casual Wear, Outerwear"
                      sx={inputStyle}
                    />
                  </Field>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Field label="Package Size">
                    <TextField fullWidth value={form.size} onChange={(e) => handleChange("size", e.target.value)} placeholder="e.g. Standard" sx={inputStyle} />
                  </Field>
                  <Field label="Unit of Measure">
                    <TextField fullWidth value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} placeholder="e.g. pcs, pack" sx={inputStyle} />
                  </Field>
                  <Field label="Weight (grams)">
                    <TextField
                      fullWidth
                      type="number"
                      value={form.weight}
                      onChange={(e) => handleChange("weight", toNum(e.target.value))}
                      placeholder="0"
                      InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.68rem", color: "#94A3B8" }}>g</Typography></InputAdornment> }}
                      sx={inputStyle}
                    />
                  </Field>
                </Stack>

                <Field label="Overview Description">
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Provide a comprehensive product pitch, fabric composition, wash care instructions..."
                    sx={inputStyle}
                  />
                </Field>
              </Stack>
            </Paper>

            {/* STEP 2: MEDIA */}
            <Paper elevation={0} sx={paperSx}>
              <SectionHeader
                icon={<ImageOutlined sx={{ fontSize: 17 }} />}
                title="Product Media & Gallery"
                subtitle="Upload high-res photos, swatches, or paste image URLs"
                stepNumber="Step 2"
              />
              <ImageUploader images={form.images} onChange={(imgs) => handleChange("images", imgs)} onToast={showToast} />
            </Paper>

            {/* STEP 3: INTERACTIVE PRODUCT OPTIONS (CATEGORY-RELATED MENU & PRESETS) */}
            <Paper elevation={0} sx={paperSx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.8}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: tealGradient, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,70,82,0.2)" }}>
                    <TuneOutlined sx={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.88rem", color: "#0F172A", letterSpacing: -0.2 }}>
                      Interactive Product Options
                    </Typography>
                    <Typography sx={{ fontSize: "0.67rem", color: "#64748B", fontWeight: 500, fontFamily: primaryFont }}>
                      Category-related option lists, color matrices, sizes, and attributes
                    </Typography>
                  </Box>
                </Box>

                {/* ADD OPTION GROUPED MENU TRIGGER */}
                <Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => setAddOptionAnchorEl(e.currentTarget)}
                    endIcon={<KeyboardArrowDownOutlined sx={{ fontSize: 14 }} />}
                    startIcon={<AddBoxOutlined sx={{ fontSize: 14 }} />}
                    sx={{
                      borderRadius: "7px",
                      fontFamily: primaryFont,
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      color: primaryTeal,
                      borderColor: primaryTeal,
                      textTransform: "none",
                      px: 1.4,
                      py: 0.45,
                      height: 30,
                      "&:hover": { borderColor: primaryTealHover, bgcolor: "rgba(0, 70, 82, 0.05)" }
                    }}
                  >
                    Add Custom Option
                  </Button>

                  <Menu
                    anchorEl={addOptionAnchorEl}
                    open={Boolean(addOptionAnchorEl)}
                    onClose={() => setAddOptionAnchorEl(null)}
                    PaperProps={{
                      sx: {
                        borderRadius: "10px",
                        boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                        border: `1px solid ${borderColor}`,
                        minWidth: 240,
                        py: 0.8
                      }
                    }}
                  >
                    <Typography sx={{ px: 1.8, py: 0.4, fontFamily: primaryFont, fontSize: "0.63rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>
                      Visual & Matrix
                    </Typography>
                    <MenuItem onClick={() => addSpecificOptionType("Color & Sizes (Clothing)")} sx={menuItemSx}>
                      👕 Color & Sizes Matrix (Apparel)
                    </MenuItem>
                    <MenuItem onClick={() => addSpecificOptionType("Primary Color")} sx={menuItemSx}>
                      🎨 Primary Color Palette (Swatches)
                    </MenuItem>
                    <MenuItem onClick={() => addSpecificOptionType("Media Image Upload")} sx={menuItemSx}>
                      🖼️ Media Upload Field
                    </MenuItem>

                    <Divider sx={{ my: 0.6 }} />

                    <Typography sx={{ px: 1.8, py: 0.4, fontFamily: primaryFont, fontSize: "0.63rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>
                      Selections & Inputs
                    </Typography>
                    <MenuItem onClick={() => addSpecificOptionType("Selection")} sx={menuItemSx}>
                      📋 Dropdown Selection (Choices)
                    </MenuItem>
                    <MenuItem onClick={() => addSpecificOptionType("Size")} sx={menuItemSx}>
                      📏 Standard Size (XS - 3XL)
                    </MenuItem>
                    <MenuItem onClick={() => addSpecificOptionType("Text")} sx={menuItemSx}>
                      🔤 Free Text Field
                    </MenuItem>
                    <MenuItem onClick={() => addSpecificOptionType("Number")} sx={menuItemSx}>
                      🔢 Numeric Value
                    </MenuItem>
                    <MenuItem onClick={() => addSpecificOptionType("Date")} sx={menuItemSx}>
                      📅 Date Picker (Expiry / Release)
                    </MenuItem>
                    <MenuItem onClick={() => addSpecificOptionType("CheckBox")} sx={menuItemSx}>
                      ☑️ Checkbox Toggle
                    </MenuItem>

                    <Divider sx={{ my: 0.6 }} />

                    <Typography sx={{ px: 1.8, py: 0.4, fontFamily: primaryFont, fontSize: "0.63rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>
                      Metrics & Units
                    </Typography>
                    <MenuItem onClick={() => addSpecificOptionType("Unit")} sx={menuItemSx}>
                      ⚖️ Unit Selector (ml, kg, pcs)
                    </MenuItem>
                    <MenuItem onClick={() => addSpecificOptionType("Weight")} sx={menuItemSx}>
                      📦 Weight in Grams
                    </MenuItem>
                  </Menu>
                </Box>
              </Stack>

              {/* 💡 AUTO-DETECTED CATEGORY BANNER */}
              {detectedPreset && (
                <Alert
                  severity="info"
                  icon={<ElectricBoltOutlined sx={{ color: primaryTeal, fontSize: 18 }} />}
                  action={
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => applyPresetByKey(detectedPreset.key)}
                      sx={{
                        bgcolor: primaryTeal,
                        fontFamily: primaryFont,
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        textTransform: "none",
                        borderRadius: "5px",
                        px: 1.2,
                        py: 0.35,
                        height: 26,
                        "&:hover": { bgcolor: primaryTealHover }
                      }}
                    >
                      Apply Recommended
                    </Button>
                  }
                  sx={{
                    mb: 2,
                    py: 0.6,
                    borderRadius: "10px",
                    bgcolor: "rgba(0, 70, 82, 0.05)",
                    border: "1px solid rgba(0, 70, 82, 0.15)",
                    "& .MuiAlert-message": { width: "100%", py: 0.2 }
                  }}
                >
                  <AlertTitle sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.78rem", color: primaryTeal, mb: 0.1 }}>
                    Category Match: {detectedPreset.label}
                  </AlertTitle>
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "0.69rem", color: "#334155" }}>
                    Detected category match. Click to apply pre-configured <b>{detectedPreset.label}</b> options.
                  </Typography>
                </Alert>
              )}

              {/* CATEGORY-RELATED MENU LIST / PRESETS BAR */}
              <Box
                sx={{
                  p: 1.6,
                  mb: 2,
                  borderRadius: "12px",
                  bgcolor: "#FAFBFD",
                  border: `1.5px solid ${borderColor}`,
                }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 1.2 }}>
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "0.72rem", fontWeight: 800, color: "#1E293B", display: "flex", alignItems: "center", gap: 0.6 }}>
                    <CategoryOutlined sx={{ fontSize: 15, color: primaryTeal }} />
                    Category Options Menu & Presets Library:
                  </Typography>
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "0.65rem", color: "#64748B" }}>
                    Click any category to populate its matching option structure
                  </Typography>
                </Stack>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                  {CATEGORY_PRESET_LIBRARY.map((preset) => {
                    const isDetected = detectedPreset?.key === preset.key;
                    return (
                      <Tooltip key={preset.key} title={preset.description} arrow>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => applyPresetByKey(preset.key)}
                          startIcon={preset.icon}
                          sx={{
                            borderRadius: "7px",
                            fontFamily: primaryFont,
                            fontWeight: isDetected ? 800 : 700,
                            fontSize: "0.68rem",
                            textTransform: "none",
                            py: 0.4,
                            px: 1.1,
                            height: 28,
                            bgcolor: isDetected ? "rgba(0, 70, 82, 0.08)" : "#FFFFFF",
                            color: isDetected ? primaryTeal : "#334155",
                            borderColor: isDetected ? primaryTeal : borderColor,
                            borderWidth: isDetected ? "1.5px" : "1px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                            "&:hover": {
                              borderColor: primaryTeal,
                              bgcolor: "rgba(0, 70, 82, 0.05)"
                            }
                          }}
                        >
                          {preset.label}
                          {isDetected && (
                            <Chip
                              label="Best"
                              size="small"
                              sx={{
                                ml: 0.6,
                                height: 14,
                                fontSize: "0.55rem",
                                fontWeight: 800,
                                bgcolor: primaryTeal,
                                color: "#FFF"
                              }}
                            />
                          )}
                        </Button>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>

              {/* LIST OF ACTIVE OPTIONS */}
              {form.options.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 3, bgcolor: surfaceBg, borderRadius: "12px", border: `1.5px dashed ${borderColor}` }}>
                  <PaletteOutlined sx={{ fontSize: 28, color: "#94A3B8", mb: 0.4 }} />
                  <Typography sx={{ color: "#475569", fontFamily: primaryFont, fontWeight: 700, fontSize: "0.78rem" }}>
                    No options applied yet
                  </Typography>
                  <Typography sx={{ color: "#94A3B8", fontFamily: primaryFont, fontSize: "0.68rem", mt: 0.2 }}>
                    Pick a Category preset above or click "Add Custom Option" to configure colors, sizes, or attributes.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.8}>
                  {form.options.map((opt, optIndex) => (
                    <Box
                      key={opt.id}
                      sx={{
                        p: 1.8,
                        borderRadius: "12px",
                        border: `1.5px solid ${borderColor}`,
                        bgcolor: surfaceBg,
                        transition: "border-color 0.2s ease",
                        "&:hover": { borderColor: "#CBD5E1" }
                      }}
                    >
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ md: "flex-end" }} mb={1.4}>
                        <Field label={`Option #${optIndex + 1} Type`}>
                          <TextField select fullWidth value={opt.type} onChange={(e) => changeOptionType(opt.id, e.target.value as OptionType)} sx={variantInputStyle}>
                            {OPTION_TYPES.map((t) => <MenuItem key={t} value={t} sx={menuItemSx}>{t}</MenuItem>)}
                          </TextField>
                        </Field>
                        <Field label="Display Label" flex={2}>
                          <TextField fullWidth value={opt.label} onChange={(e) => patchOption(opt.id, { label: e.target.value })} placeholder="e.g. Color & Sizes, Fabric, Storage" sx={variantInputStyle} />
                        </Field>
                        <Field label="Scope Target">
                          <TextField select fullWidth value={opt.appliesTo} onChange={(e) => patchOption(opt.id, { appliesTo: e.target.value })} sx={variantInputStyle}>
                            <MenuItem value="all" sx={menuItemSx}>All Variants</MenuItem>
                            <MenuItem value="product" sx={menuItemSx}>Base Product Only</MenuItem>
                            {form.variants.map((v, vi) => (
                              <MenuItem key={v.id} value={v.id} sx={menuItemSx}>{v.name || `Variant #${vi + 1}`}</MenuItem>
                            ))}
                          </TextField>
                        </Field>
                        <IconButton size="small" onClick={() => removeOption(opt.id)} sx={{ color: "#EF4444", alignSelf: { xs: "flex-end", md: "center" }, p: 0.5 }}>
                          <DeleteOutline sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>

                      <Field label="Option Value & Interactive Configuration">
                        <OptionValueInput
                          opt={opt}
                          onPatch={(patch) => patchOption(opt.id, patch)}
                          onToast={showToast}
                          onGenerateVariants={handleGenerateVariantsFromColorSizes}
                        />
                      </Field>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* STEP 4: PRODUCT VARIANTS TABLE */}
            <Paper elevation={0} sx={paperSx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: tealGradient, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,70,82,0.2)" }}>
                    <CategoryOutlined sx={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.88rem", color: "#0F172A", letterSpacing: -0.2 }}>
                      Variants & SKUs
                    </Typography>
                    <Typography sx={{ fontSize: "0.67rem", color: "#64748B", fontWeight: 500, fontFamily: primaryFont }}>
                      {form.variants.length} variant(s) configured in inventory
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={addVariant}
                  startIcon={<AddBoxOutlined sx={{ fontSize: 14 }} />}
                  sx={{
                    borderRadius: "7px",
                    fontFamily: primaryFont,
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    color: primaryTeal,
                    borderColor: primaryTeal,
                    textTransform: "none",
                    px: 1.4,
                    py: 0.45,
                    height: 30,
                    "&:hover": { borderColor: primaryTealHover, bgcolor: "rgba(0, 70, 82, 0.05)" }
                  }}
                >
                  Add Variant
                </Button>
              </Stack>

              {form.variants.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 3, bgcolor: surfaceBg, borderRadius: "12px", border: `1.5px dashed ${borderColor}` }}>
                  <LayersOutlined sx={{ fontSize: 28, color: "#94A3B8", mb: 0.4 }} />
                  <Typography sx={{ color: "#475569", fontFamily: primaryFont, fontWeight: 700, fontSize: "0.78rem" }}>
                    No product variants configured
                  </Typography>
                  <Typography sx={{ color: "#94A3B8", fontFamily: primaryFont, fontSize: "0.68rem", mt: 0.2 }}>
                    Click "Generate Variants Table" under Color & Sizes above, or click "Add Variant" to add items manually.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {form.variants.map((v, i) => (
                    <Box
                      key={v.id}
                      sx={{
                        p: { xs: 1.6, sm: 2 },
                        borderRadius: "12px",
                        border: `1.5px solid ${borderColor}`,
                        bgcolor: "#FFFFFF",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        position: "relative"
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`#${i + 1}`}
                            size="small"
                            sx={{ height: 18, bgcolor: primaryTeal, color: "#FFF", fontWeight: 800, fontSize: "0.64rem", fontFamily: primaryFont, borderRadius: "4px" }}
                          />
                          <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.82rem", color: "#0F172A" }}>
                            {v.name || `Unnamed Variant ${i + 1}`}
                          </Typography>
                        </Stack>
                        <Tooltip title="Delete variant">
                          <IconButton size="small" onClick={() => removeVariant(v.id)} sx={{ color: "#EF4444", bgcolor: "#FEF2F2", p: 0.4, "&:hover": { bgcolor: "#FEE2E2" } }}>
                            <DeleteOutline sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      <Stack spacing={1.5}>
                        <Field label="Variant Title" required>
                          <TextField fullWidth value={v.name} onChange={(e) => patchVariant(v.id, { name: e.target.value })} placeholder="e.g. Red / M" sx={variantInputStyle} />
                        </Field>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Field label="Regular Price">
                            <TextField fullWidth type="number" value={v.originalPrice} onChange={(e) => patchVariant(v.id, { originalPrice: toNum(e.target.value) })} placeholder="0.00" sx={variantInputStyle} />
                          </Field>
                          <Field label="Offer Price">
                            <TextField fullWidth type="number" value={v.price} onChange={(e) => patchVariant(v.id, { price: toNum(e.target.value) })} placeholder="0.00" sx={variantInputStyle} />
                          </Field>
                          <Field label="SKU Code">
                            <TextField fullWidth value={v.sku} onChange={(e) => patchVariant(v.id, { sku: e.target.value })} placeholder="SKU-RED-M" sx={variantInputStyle} />
                          </Field>
                          <Field label="Stock Units">
                            <TextField fullWidth type="number" value={v.quantity} onChange={(e) => patchVariant(v.id, { quantity: toNum(e.target.value) })} placeholder="0" sx={variantInputStyle} />
                          </Field>
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Field label="Size">
                            <TextField fullWidth value={v.size} onChange={(e) => patchVariant(v.id, { size: e.target.value })} placeholder="e.g. M" sx={variantInputStyle} />
                          </Field>
                          <Field label="Unit">
                            <TextField fullWidth value={v.unit} onChange={(e) => patchVariant(v.id, { unit: e.target.value })} placeholder="e.g. pcs" sx={variantInputStyle} />
                          </Field>
                          <Field label="Weight (g)">
                            <TextField fullWidth type="number" value={v.weight} onChange={(e) => patchVariant(v.id, { weight: toNum(e.target.value) })} placeholder="0" sx={variantInputStyle} />
                          </Field>
                        </Stack>

                        {/* Variant description lines */}
                        <Box sx={{ p: 1.4, bgcolor: surfaceBg, borderRadius: "8px", border: `1px solid ${borderColor}` }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                            <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.65rem", color: "#475569", textTransform: "uppercase" }}>
                              Variant Highlights & Specs
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => addDescLine(v)}
                              startIcon={<AddBoxOutlined sx={{ fontSize: 13 }} />}
                              sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.66rem", color: primaryTeal, textTransform: "none", p: 0 }}
                            >
                              Add Bullet
                            </Button>
                          </Stack>
                          <Stack spacing={0.6}>
                            {v.description.map((line, li) => (
                              <Stack key={li} direction="row" spacing={0.6} alignItems="center">
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={line}
                                  onChange={(e) => updateDescLine(v, li, e.target.value)}
                                  placeholder={`Highlight point #${li + 1}`}
                                  sx={variantInputStyle}
                                />
                                <IconButton size="small" onClick={() => removeDescLine(v, li)} sx={{ color: "#94A3B8", p: 0.4, "&:hover": { color: "#EF4444" } }}>
                                  <RemoveCircleOutline sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>

                        <Box>
                          <InputLabel sx={labelSx}>Variant Specific Media</InputLabel>
                          <ImageUploader compact images={v.images} onChange={(imgs) => patchVariant(v.id, { images: imgs })} onToast={showToast} sx={variantInputStyle} />
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* STEP 5: PRODUCT ORIGIN */}
            <Paper elevation={0} sx={paperSx}>
              <SectionHeader
                icon={<PublicOutlined sx={{ fontSize: 17 }} />}
                title="Geographic Origin"
                subtitle="Country of manufacture, export verification, and origin badges"
                stepNumber="Step 5"
              />

              <Stack spacing={1.6}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Field label="Sourcing Type">
                    <TextField select fullWidth value={form.originType} onChange={(e) => handleChange("originType", e.target.value)} sx={inputStyle}>
                      <MenuItem value="Local" sx={menuItemSx}>Local Product</MenuItem>
                      <MenuItem value="International" sx={menuItemSx}>International Import</MenuItem>
                    </TextField>
                  </Field>
                  <Field label="Country of Origin">
                    <TextField select fullWidth value={form.country} onChange={handleCountryChange as any} sx={inputStyle}>
                      {COUNTRIES.map((c) => (
                        <MenuItem key={c.code} value={c.name} sx={menuItemSx}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <img src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} alt={c.code} style={{ width: 16, height: 12, borderRadius: 2, objectFit: "cover" }} />
                            {c.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Field>
                </Stack>

                <Field label="Flag Visual Display">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, height: "36px" }}>
                    {form.countryFlag ? (
                      <Box sx={{ width: 48, height: 30, borderRadius: "5px", overflow: "hidden", border: `1px solid ${borderColor}`, boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                        <img src={form.countryFlag} alt="Country Flag" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    ) : (
                      <Typography sx={{ fontFamily: primaryFont, fontSize: "0.72rem", color: "#94A3B8", fontStyle: "italic" }}>
                        Select a country above to render flag verification
                      </Typography>
                    )}
                  </Box>
                </Field>
              </Stack>
            </Paper>

          </Stack>
        </Box>

        {/* ================= RIGHT SIDEBAR ================= */}
        <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 33%" }, minWidth: 0 }}>
          <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: 20 }}>

            {/* STATUS & INVENTORY */}
            <Paper elevation={0} sx={paperSx}>
              <SectionHeader
                icon={<SettingsOutlined sx={{ fontSize: 17 }} />}
                title="Inventory & Fulfillment"
              />

              <Stack spacing={1.6}>
                <Field label="Availability Mode">
                  <TextField select fullWidth value={form.availability} onChange={handleAvailabilityChange as any} sx={inputStyle}>
                    <MenuItem value="On Hand" sx={menuItemSx}>On Hand (Immediate)</MenuItem>
                    <MenuItem value="Order Online" sx={menuItemSx}>Pre-order / Online</MenuItem>
                  </TextField>
                </Field>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.2,
                    borderRadius: "8px",
                    bgcolor: "rgba(0, 70, 82, 0.05)",
                    border: "1px solid rgba(0, 70, 82, 0.12)"
                  }}
                >
                  <LocalShippingOutlined sx={{ color: primaryTeal, fontSize: 17 }} />
                  <Box>
                    <Typography sx={{ fontFamily: primaryFont, fontSize: "0.62rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                      Estimated Delivery Window
                    </Typography>
                    <Typography sx={{ fontFamily: primaryFont, fontSize: "0.76rem", fontWeight: 800, color: primaryTeal }}>
                      {form.deliveryTime}
                    </Typography>
                  </Box>
                </Box>

                {/* Sold out toggle card */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.3,
                    bgcolor: form.soldOut ? "#FFF1F2" : surfaceBg,
                    borderRadius: "10px",
                    border: `1.2px solid ${form.soldOut ? "#FECDD3" : borderColor}`,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Box>
                    <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.76rem", color: form.soldOut ? "#BE123C" : "#1E293B" }}>
                      Mark as Sold Out
                    </Typography>
                    <Typography sx={{ fontFamily: primaryFont, fontSize: "0.65rem", color: "#64748B", mt: 0.1 }}>
                      Temporarily freezes checkout
                    </Typography>
                  </Box>
                  <Switch checked={form.soldOut} onChange={(e) => handleChange("soldOut", e.target.checked)} color="error" size="small" />
                </Box>

                <Stack direction="row" spacing={1.2}>
                  <Field label="Min Order Qty">
                    <TextField fullWidth type="number" value={form.minQty} onChange={(e) => handleChange("minQty", toNum(e.target.value))} placeholder="1" sx={inputStyle} />
                  </Field>
                  <Field label="Max Order Limit">
                    <TextField fullWidth type="number" value={form.maxQty} onChange={(e) => handleChange("maxQty", toNum(e.target.value))} placeholder="No limit" sx={inputStyle} />
                  </Field>
                </Stack>
              </Stack>
            </Paper>

            {/* MARKETING FLAGS */}
            <Paper elevation={0} sx={paperSx}>
              <SectionHeader
                icon={<SellOutlined sx={{ fontSize: 17 }} />}
                title="Badging & Marketing"
              />

              <Stack spacing={1.2} sx={{ mb: 2 }}>
                {/* Today's Special */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.3,
                    background: form.todaySpecial ? "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" : surfaceBg,
                    borderRadius: "10px",
                    border: `1.2px solid ${form.todaySpecial ? "#A7F3D0" : borderColor}`,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WhatshotOutlined sx={{ color: form.todaySpecial ? "#059669" : "#94A3B8", fontSize: 17 }} />
                    <Box>
                      <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.76rem", color: form.todaySpecial ? "#047857" : "#334155" }}>
                        Today's Special
                      </Typography>
                      <Typography sx={{ fontFamily: primaryFont, fontSize: "0.65rem", color: "#64748B" }}>
                        Feature on promotional carousel
                      </Typography>
                    </Box>
                  </Box>
                  <Switch checked={form.todaySpecial} onChange={(e) => handleChange("todaySpecial", e.target.checked)} color="success" size="small" />
                </Box>

                {/* Popular Product */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.3,
                    background: form.popularProduct ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" : surfaceBg,
                    borderRadius: "10px",
                    border: `1.2px solid ${form.popularProduct ? "#FDE68A" : borderColor}`,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpOutlined sx={{ color: form.popularProduct ? "#D97706" : "#94A3B8", fontSize: 17 }} />
                    <Box>
                      <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.76rem", color: form.popularProduct ? "#B45309" : "#334155" }}>
                        Trending & Popular
                      </Typography>
                      <Typography sx={{ fontFamily: primaryFont, fontSize: "0.65rem", color: "#64748B" }}>
                        Attach "Hot Seller" badge
                      </Typography>
                    </Box>
                  </Box>
                  <Switch checked={form.popularProduct} onChange={(e) => handleChange("popularProduct", e.target.checked)} color="warning" size="small" />
                </Box>
              </Stack>

              <Field label="Search Meta Tags">
                <TextField
                  fullWidth
                  value={form.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="e.g. casual shirt, cotton wear, summer fashion"
                  helperText="Comma separated values for indexed search"
                  sx={inputStyle}
                />
              </Field>
            </Paper>

            {/* ACTION PUBLISH BUTTON */}
            <Button
              fullWidth
              size="small"
              variant="contained"
              onClick={handleSaveClick}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutline sx={{ fontSize: 16 }} />}
              sx={{
                background: tealGradient,
                py: 1.0,
                borderRadius: "9px",
                fontWeight: 800,
                fontSize: "0.78rem",
                fontFamily: primaryFont,
                textTransform: "none",
                letterSpacing: "0.2px",
                height: 38,
                boxShadow: "0 4px 14px rgba(0,70,82,0.25)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: primaryTealHover,
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 18px rgba(0,70,82,0.3)"
                },
                "&:active": {
                  transform: "translateY(0)"
                }
              }}
            >
              {loading ? "Publishing..." : "Save Product to Catalog"}
            </Button>

          </Stack>
        </Box>
      </Stack>

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 0.8,
            maxWidth: "420px",
            boxShadow: "0 16px 40px rgba(15,23,42,0.15)"
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: primaryFont, fontWeight: 900, color: "#0F172A", fontSize: "0.98rem", pb: 0.6 }}>
          Confirm Catalog Publication
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: primaryFont, color: "#475569", fontSize: "0.78rem", lineHeight: 1.5 }}>
            You are publishing <b>"{form.name}"</b>
            {form.variants.length > 0 ? ` alongside ${form.variants.length} variant configuration(s)` : ""}. It will be immediately discoverable in your live catalog.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.6, gap: 0.8 }}>
          <Button
            size="small"
            onClick={() => setConfirmDialogOpen(false)}
            disabled={loading}
            sx={{ color: "#64748B", fontWeight: 700, fontFamily: primaryFont, fontSize: "0.72rem", textTransform: "none", py: 0.4, px: 1.2, height: 28 }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={confirmSave}
            variant="contained"
            disabled={loading}
            sx={{
              background: tealGradient,
              borderRadius: "6px",
              fontWeight: 800,
              fontFamily: primaryFont,
              fontSize: "0.72rem",
              textTransform: "none",
              px: 1.6,
              py: 0.4,
              height: 28,
              "&:hover": { background: primaryTealHover }
            }}
          >
            {loading ? "Publishing..." : "Confirm & Publish"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TOAST NOTIFICATION */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            fontFamily: primaryFont,
            fontWeight: 700,
            fontSize: "0.76rem",
            borderRadius: "10px",
            boxShadow: "0 6px 24px -8px rgba(0,0,0,0.22)",
            alignItems: "center",
            py: 0.5
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewProductsCreate;