import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Typography, Stack, Paper, Button, TextField,
  InputLabel, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, CircularProgress, Snackbar, Alert,
  Slide, MenuItem, Switch, Checkbox, FormControlLabel,
  InputAdornment, Chip, Tooltip, Breadcrumbs, Link, Menu,
  AlertTitle, LinearProgress, Rating
} from "@mui/material";
import type { SlideProps } from "@mui/material";
import {
  ArrowBackIosNewOutlined,
  CloudUploadOutlined,
  DeleteOutline,
  AddBoxOutlined,
  ImageOutlined,
  CategoryOutlined,
  SettingsOutlined,
  SellOutlined,
  PublicOutlined,
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
  ElectricBoltOutlined,
  LaptopOutlined,
  AirOutlined,
  HealthAndSafetyOutlined,
  KitchenOutlined,
  WatchOutlined,
  DiamondOutlined,
  FitnessCenterOutlined,
  DirectionsCarOutlined,
  ChildCareOutlined,
  MenuBookOutlined,
  PetsOutlined,
  LuggageOutlined,
  SearchOutlined,
  VisibilityOutlined,
  SmartphoneOutlined,
  DesktopWindowsOutlined,
  AutoFixHighOutlined,
  RestoreOutlined,
  ShoppingBagOutlined,
  ContentCopyOutlined,
  Inventory2Outlined
} from "@mui/icons-material";
import axios from "axios";

// --- CONFIGURATION & TOKENS ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// Keep the key in .env (VITE_IMGBB_API_KEY) - never hard-code it in source.
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "";
const LOCAL_STORAGE_KEY = "AGY_NEW_PRODUCT_DRAFT_V2";

const primaryTeal = "#004652";
const primaryTealHover = "#002D35";
const tealGradient = "linear-gradient(135deg, #004652 0%, #007580 100%)";
const primaryFont = "'Montserrat', sans-serif";
const borderColor = "#E2E8F0";
const surfaceBg = "#F8FAFC";

// --- PRIMARY COLORS PALETTE ---
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
const UNIT_OPTIONS = ["ml", "l", "g", "kg", "oz", "lb", "pcs", "pack", "set", "box"];

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

// --- COUNTRIES ---
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
const flattenCategories = (nodes: any[] = [], level = 0, parentId: any = null, rootId: any = null): any[] => {
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

// --- IMAGE COMPRESSION & UPLOAD ---
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
  weight?: number | "";
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const toNum = (v: string): number | "" => (v === "" ? "" : Number(v));

const emptyVariant = (): Variant => ({
  id: uid(), name: "", price: "", originalPrice: "", sku: "", category: "",
  images: [], quantity: "", brand: "", productType: "", description: [""],
  size: "", unit: "",
});

const defaultOptionValue = (type: OptionType) => {
  if (type === "CheckBox") return false;
  if (type === "Primary Color") return "Red";
  if (type === "Color & Sizes (Clothing)") return [];
  return "";
};

// --- OPTION BUILDERS (used by presets) ---
const selOpt = (label: string, value: string, choices: string): VariantOption => ({
  id: uid(), type: "Selection", label, value, choices, images: [], appliesTo: "all",
});
const colorOpt = (label: string, value: string): VariantOption => ({
  id: uid(), type: "Primary Color", label, value, choices: "", images: [], appliesTo: "all",
});
const dateOpt = (label: string): VariantOption => ({
  id: uid(), type: "Date", label, value: "", choices: "", images: [], appliesTo: "all",
});
const textOpt = (label: string, value: string): VariantOption => ({
  id: uid(), type: "Text", label, value, choices: "", images: [], appliesTo: "all",
});

// --- MULTI-ECOMMERCE CATEGORY PRESETS CATALOG (19 SECTORS) ---
export type CategoryPresetKey =
  | "clothing" | "footwear" | "electronics" | "computers" | "beauty"
  | "perfumes" | "food" | "health" | "furniture" | "appliances"
  | "watches" | "jewelry" | "sports" | "automotive" | "baby"
  | "books" | "pets" | "luggage" | "colors";

export type PresetDepartment = "all" | "fashion" | "tech" | "beauty_health" | "living" | "lifestyle";

/**
 * A "Type" inside a preset (e.g. Clothing -> T-Shirt, Jeans, Dress).
 * `extra` is an ARRAY of [label, defaultValue, "comma, separated, choices"] tuples.
 * When the type is applied, this array is looped and turned into extra Selection options.
 */
export interface PresetTypeItem {
  label: string;
  extra?: [string, string, string][];
}

interface CategoryPresetItem {
  key: CategoryPresetKey;
  dept: PresetDepartment;
  label: string;
  categoryName: string;
  icon: React.ReactNode;
  description: string;
  tags: string[];
  types: PresetTypeItem[];
  getOptions: () => VariantOption[];
}

const CATEGORY_PRESET_LIBRARY: CategoryPresetItem[] = [
  {
    key: "clothing",
    dept: "fashion",
    label: "Clothing",
    categoryName: "Apparel / Fashion",
    icon: <CheckroomOutlined sx={{ fontSize: 14 }} />,
    description: "Color matrix (Red: S-XXL, Yellow: S,XL), Fabric, and Fit options",
    tags: ["cloth", "shirt", "pant", "dress", "fashion", "apparel", "wear", "hoodie", "tshirt", "jacket", "jeans"],
    types: [
      { label: "T-Shirt", extra: [["Neck Style", "Crew Neck", "Crew Neck, V-Neck, Polo Collar, Henley"], ["Sleeve Length", "Short Sleeve", "Short Sleeve, Long Sleeve, Sleeveless"]] },
      { label: "Shirt", extra: [["Collar Style", "Classic Collar", "Classic Collar, Mandarin Collar, Button-Down, Cutaway"], ["Sleeve Length", "Long Sleeve", "Short Sleeve, Long Sleeve"]] },
      { label: "Jeans & Pants", extra: [["Rise", "Mid Rise", "Low Rise, Mid Rise, High Rise"], ["Leg Style", "Straight", "Skinny, Straight, Bootcut, Wide Leg, Jogger"]] },
      { label: "Dress", extra: [["Dress Length", "Knee Length", "Mini, Knee Length, Midi, Maxi"], ["Occasion", "Casual", "Casual, Party, Formal, Wedding"]] },
      { label: "Hoodie & Jacket", extra: [["Closure Type", "Zipper", "Zipper, Pullover, Button, Snap"], ["Season", "All Season", "Summer, Winter, All Season"]] },
      { label: "Kids Wear" },
    ],
    getOptions: () => [
      {
        id: uid(), type: "Color & Sizes (Clothing)", label: "Color & Available Sizes", value: "", choices: "", images: [], appliesTo: "all",
        colorSizes: [
          { id: uid(), color: "Red", sizes: ["S", "M", "L", "XL", "XXL"] },
          { id: uid(), color: "Yellow", sizes: ["S", "XL"] }
        ]
      },
      selOpt("Fabric / Material", "100% Cotton", "100% Cotton, Polyester, Linen, Rayon, Silk, Wool Blend"),
      selOpt("Fit Type", "Regular Fit", "Regular Fit, Slim Fit, Relaxed Fit, Oversized, Athletic Fit"),
    ]
  },
  {
    key: "footwear",
    dept: "fashion",
    label: "Footwear",
    categoryName: "Footwear / Shoes",
    icon: <CategoryOutlined sx={{ fontSize: 14 }} />,
    description: "EU sizes, Primary Shoe Color, and Outer Sole material",
    tags: ["shoe", "footwear", "sneaker", "boot", "sandal", "heel", "slippers", "loafer", "running", "clogs"],
    types: [
      { label: "Sneakers", extra: [["Closure", "Lace-Up", "Lace-Up, Slip-On, Velcro"]] },
      { label: "Boots", extra: [["Boot Height", "Ankle", "Ankle, Mid-Calf, Knee High"]] },
      { label: "Sandals & Slippers", extra: [["Strap Style", "Open Toe", "Open Toe, Slide, Flip-Flop, Ankle Strap"]] },
      { label: "Formal Shoes", extra: [["Style", "Oxford", "Oxford, Derby, Loafer, Monk Strap"]] },
      { label: "Heels", extra: [["Heel Height", "5 cm", "3 cm, 5 cm, 7 cm, 9 cm, 11 cm"]] },
    ],
    getOptions: () => [
      colorOpt("Footwear Color", "Black"),
      selOpt("Shoe Size (EU)", "42", FOOTWEAR_SIZES.join(", ")),
      selOpt("Outer Material", "Genuine Leather", "Genuine Leather, Mesh, Canvas, Suede, Synthetic"),
    ]
  },
  {
    key: "electronics",
    dept: "tech",
    label: "Mobiles",
    categoryName: "Electronics & Smart Devices",
    icon: <DevicesOutlined sx={{ fontSize: 14 }} />,
    description: "Internal Storage capacity, RAM, Finish Color, and Warranty coverage",
    tags: ["electronic", "phone", "mobile", "smartphone", "tablet", "ipad", "gadget", "audio", "headphone", "earbuds"],
    types: [
      { label: "Smartphone", extra: [["Network", "5G", "4G LTE, 5G"], ["SIM Type", "Dual SIM", "Single SIM, Dual SIM, eSIM + SIM"]] },
      { label: "Tablet", extra: [["Connectivity", "Wi-Fi", "Wi-Fi, Wi-Fi + Cellular"]] },
      { label: "Headphones & Earbuds", extra: [["Connectivity", "Bluetooth 5.3", "Wired, Bluetooth 5.0, Bluetooth 5.3"], ["Noise Cancellation", "Active (ANC)", "None, Passive, Active (ANC)"]] },
      { label: "Power Bank", extra: [["Battery Capacity", "10000 mAh", "5000 mAh, 10000 mAh, 20000 mAh, 30000 mAh"]] },
      { label: "Smart Speaker" },
    ],
    getOptions: () => [
      selOpt("Internal Storage", "128GB", "64GB, 128GB, 256GB, 512GB, 1TB"),
      selOpt("Device RAM", "8GB", "4GB, 6GB, 8GB, 12GB, 16GB"),
      colorOpt("Device Color Finish", "Black"),
      selOpt("Warranty Coverage", "1 Year Official", "6 Months Limited, 1 Year Official, 2 Years Extended Comprehensive"),
    ]
  },
  {
    key: "computers",
    dept: "tech",
    label: "Computers",
    categoryName: "Computers / Hardware",
    icon: <LaptopOutlined sx={{ fontSize: 14 }} />,
    description: "Processor CPU, RAM memory, SSD Storage, and Screen size",
    tags: ["laptop", "computer", "pc", "macbook", "desktop", "notebook", "ultrabook", "workstation"],
    types: [
      { label: "Laptop", extra: [["Battery Life", "8 Hours", "5 Hours, 8 Hours, 12 Hours, 18 Hours"]] },
      { label: "Desktop PC", extra: [["Form Factor", "Mid Tower", "Mini PC, Mid Tower, Full Tower"]] },
      { label: "Gaming PC", extra: [["Graphics Card", "RTX 4060", "Integrated, RTX 4060, RTX 4070, RTX 4080"]] },
      { label: "All-in-One", extra: [["Touch Screen", "No", "Yes, No"]] },
    ],
    getOptions: () => [
      selOpt("Processor (CPU)", "Intel Core i7", "Intel Core i5, Intel Core i7, Intel Core i9, AMD Ryzen 5, AMD Ryzen 7, Apple M2, Apple M3 Pro"),
      selOpt("System Memory (RAM)", "16GB DDR5", "8GB DDR5, 16GB DDR5, 32GB DDR5, 64GB DDR5"),
      selOpt("SSD Storage", "512GB NVMe SSD", "512GB NVMe SSD, 1TB NVMe SSD, 2TB NVMe SSD"),
      selOpt("Screen Display Size", "15.6-inch", "13.3-inch, 14.0-inch, 15.6-inch, 16.0-inch, 17.3-inch"),
    ]
  },
  {
    key: "beauty",
    dept: "beauty_health",
    label: "Beauty",
    categoryName: "Cosmetics / Skincare",
    icon: <SpaOutlined sx={{ fontSize: 14 }} />,
    description: "Bottle volume, Cosmetic shade, and Skin type compatibility",
    tags: ["beauty", "cosmetic", "skin", "skincare", "makeup", "hair", "care", "lotion", "serum", "cream", "lipstick"],
    types: [
      { label: "Skincare", extra: [["Product Form", "Serum", "Cleanser, Serum, Moisturizer, Sunscreen, Face Mask"], ["SPF Level", "SPF 30", "None, SPF 15, SPF 30, SPF 50+"]] },
      { label: "Makeup", extra: [["Finish", "Matte", "Matte, Glossy, Satin, Dewy"], ["Makeup Type", "Lipstick", "Lipstick, Foundation, Mascara, Eyeliner, Blush"]] },
      { label: "Hair Care", extra: [["Hair Type", "All Hair Types", "All Hair Types, Dry, Oily, Curly, Colored"]] },
      { label: "Body Care", extra: [["Product Form", "Lotion", "Lotion, Body Wash, Scrub, Body Butter"]] },
    ],
    getOptions: () => [
      selOpt("Bottle / Jar Volume", "50ml", "30ml, 50ml, 100ml, 150ml, 200ml"),
      colorOpt("Shade / Tone", "Pink"),
      selOpt("Skin Compatibility", "All Skin Types", "All Skin Types, Sensitive Skin, Oily/Acne-Prone, Dry Skin, Combination"),
    ]
  },
  {
    key: "perfumes",
    dept: "beauty_health",
    label: "Perfumes",
    categoryName: "Fragrances / Perfumes",
    icon: <AirOutlined sx={{ fontSize: 14 }} />,
    description: "Bottle capacity, Oil concentration EDP/EDT, and Scent family accords",
    tags: ["perfume", "fragrance", "cologne", "attar", "oud", "scent", "eau de parfum", "edt", "edp", "mist"],
    types: [
      { label: "For Women", extra: [["Longevity", "6-8 Hours", "3-4 Hours, 6-8 Hours, 8-12 Hours"]] },
      { label: "For Men", extra: [["Longevity", "6-8 Hours", "3-4 Hours, 6-8 Hours, 8-12 Hours"]] },
      { label: "Unisex", extra: [["Longevity", "8-12 Hours", "3-4 Hours, 6-8 Hours, 8-12 Hours"]] },
      { label: "Oud & Attar", extra: [["Base Oil", "Alcohol Free", "Alcohol Free, Sandalwood Base, Oud Base"]] },
      { label: "Body Mist" },
    ],
    getOptions: () => [
      selOpt("Bottle Size", "100ml", "30ml, 50ml, 100ml, 150ml, 200ml"),
      selOpt("Concentration", "Eau de Parfum (EDP)", "Eau de Parfum (EDP), Eau de Toilette (EDT), Pure Parfum / Extrait, Eau de Cologne (EDC)"),
      selOpt("Fragrance Accord", "Woody Oriental", "Woody Oriental, Fresh Citrus, Floral Bouquet, Warm Spicy & Amber, Aromatic Aquatic"),
    ]
  },
  {
    key: "food",
    dept: "living",
    label: "Grocery",
    categoryName: "Grocery / Pantry",
    icon: <RestaurantOutlined sx={{ fontSize: 14 }} />,
    description: "Package net weight, Flavor profiles, and Expiry best before date",
    tags: ["food", "grocery", "snack", "drink", "beverage", "tea", "coffee", "fruit", "spice", "nut", "organic"],
    types: [
      { label: "Snacks", extra: [["Packaging", "Pouch", "Pouch, Box, Tin, Jar"]] },
      { label: "Beverages", extra: [["Beverage Form", "Ready to Drink", "Ready to Drink, Powder, Concentrate, Tea Bags"]] },
      { label: "Spices", extra: [["Spice Form", "Powder", "Whole, Powder, Blend"]] },
      { label: "Dry Fruits & Nuts", extra: [["Roast Style", "Raw", "Raw, Roasted, Salted"]] },
      { label: "Organic" , extra: [["Certification", "USDA Organic", "USDA Organic, EU Organic, Fairtrade"]] },
    ],
    getOptions: () => [
      selOpt("Pack Size / Weight", "500g", "250g, 500g, 1kg, 2kg, 5kg"),
      selOpt("Flavor / Variant", "Original", "Original, Vanilla, Dark Chocolate, Roasted & Salted, Spicy Masala, Honey Glazed"),
      dateOpt("Best Before / Expiry Date"),
    ]
  },
  {
    key: "health",
    dept: "beauty_health",
    label: "Health",
    categoryName: "Health / Supplements",
    icon: <HealthAndSafetyOutlined sx={{ fontSize: 14 }} />,
    description: "Dosage form, Serving count, and Dietary certifications",
    tags: ["health", "supplement", "vitamin", "protein", "creatine", "capsule", "nutrition", "wellness", "diet", "gym"],
    types: [
      { label: "Vitamins & Minerals", extra: [["Primary Nutrient", "Vitamin C", "Vitamin C, Vitamin D3, Zinc, Magnesium, Multivitamin"]] },
      { label: "Protein & Sports Nutrition", extra: [["Protein Source", "Whey", "Whey, Casein, Plant Based, Mass Gainer"]] },
      { label: "Herbal & Ayurvedic", extra: [["Main Herb", "Ashwagandha", "Ashwagandha, Turmeric, Ginseng, Moringa"]] },
      { label: "Weight Management" },
    ],
    getOptions: () => [
      selOpt("Dosage Form", "Capsules", "Capsules, Tablets, Whey Powder, Gummies, Softgels, Liquid Drops"),
      selOpt("Serving Count", "60 Servings", "30 Servings, 60 Servings, 90 Servings, 120 Servings"),
      selOpt("Dietary Standard", "100% Vegan", "100% Vegan, Non-GMO Certified, Gluten-Free, Organic, Keto Friendly"),
    ]
  },
  {
    key: "furniture",
    dept: "living",
    label: "Furniture",
    categoryName: "Furniture / Living",
    icon: <WeekendOutlined sx={{ fontSize: 14 }} />,
    description: "Finish color, Solid wood material type, and Room dimensions",
    tags: ["furniture", "home", "decor", "chair", "table", "sofa", "bed", "living", "wood", "cushion", "desk"],
    types: [
      { label: "Sofa", extra: [["Seating Capacity", "3 Seater", "1 Seater, 2 Seater, 3 Seater, L-Shaped"]] },
      { label: "Bed", extra: [["Bed Size", "Queen", "Single, Double, Queen, King"]] },
      { label: "Table & Desk", extra: [["Table Shape", "Rectangular", "Rectangular, Round, Square, Oval"]] },
      { label: "Chair", extra: [["Chair Type", "Dining Chair", "Dining Chair, Office Chair, Armchair, Stool"]] },
      { label: "Storage & Wardrobe", extra: [["Door Count", "2 Doors", "No Doors, 2 Doors, 3 Doors, 4 Doors"]] },
    ],
    getOptions: () => [
      colorOpt("Finish / Upholstery Color", "Brown"),
      selOpt("Primary Material", "Solid Teak Wood", "Solid Teak Wood, Engineered Oak, Stainless Steel, Velvet Fabric, Italian Nappa Leather"),
      textOpt("Dimensions (L x W x H)", "120cm x 60cm x 75cm"),
    ]
  },
  {
    key: "appliances",
    dept: "living",
    label: "Appliances",
    categoryName: "Home Appliances",
    icon: <KitchenOutlined sx={{ fontSize: 14 }} />,
    description: "Wattage, Capacity volume, Energy star rating, and Color",
    tags: ["appliance", "kitchen", "blender", "microwave", "air fryer", "refrigerator", "oven", "toaster", "cooker"],
    types: [
      { label: "Kitchen Appliance", extra: [["Control Type", "Digital", "Manual Dial, Digital, Touch Panel"]] },
      { label: "Refrigerator", extra: [["Door Style", "Double Door", "Single Door, Double Door, Side by Side"]] },
      { label: "Washing Machine", extra: [["Load Type", "Front Load", "Top Load, Front Load, Semi-Automatic"]] },
      { label: "Air Conditioner", extra: [["Cooling Type", "Inverter", "Fixed Speed, Inverter"]] },
      { label: "Small Appliance" },
    ],
    getOptions: () => [
      selOpt("Power Consumption", "1000 Watts", "500 Watts, 750 Watts, 1000 Watts, 1500 Watts, 2000 Watts"),
      selOpt("Capacity Volume", "2.5 Liters", "1.5 Liters, 2.5 Liters, 4.5 Liters, 10 Liters, 25 Liters"),
      colorOpt("Appliance Color", "Black"),
      selOpt("Energy Star Rating", "5 Star Inverter", "5 Star Inverter, 4 Star Eco, 3 Star Standard"),
    ]
  },
  {
    key: "watches",
    dept: "fashion",
    label: "Watches",
    categoryName: "Watches / Horology",
    icon: <WatchOutlined sx={{ fontSize: 14 }} />,
    description: "Dial case diameter, Strap material, Movement, and Water resistance",
    tags: ["watch", "timepiece", "chronograph", "smartwatch", "rolex", "dial", "strap", "horology", "automatic"],
    types: [
      { label: "Analog Watch", extra: [["Dial Color", "Black", "Black, White, Blue, Green, Silver"]] },
      { label: "Digital Watch", extra: [["Display Type", "LCD", "LCD, LED, OLED"]] },
      { label: "Smartwatch", extra: [["Health Sensors", "Heart Rate + SpO2", "Heart Rate, Heart Rate + SpO2, ECG + SpO2"], ["Battery Life", "5 Days", "1 Day, 3 Days, 5 Days, 10 Days"]] },
      { label: "Luxury Automatic", extra: [["Glass Type", "Sapphire Crystal", "Mineral, Sapphire Crystal"]] },
    ],
    getOptions: () => [
      selOpt("Case Diameter", "42mm", "38mm, 40mm, 42mm, 44mm, 46mm"),
      selOpt("Band / Strap Material", "Genuine Leather", "Genuine Leather, 316L Stainless Steel, Silicone Rubber, Milanese Mesh, Titanium"),
      selOpt("Movement Type", "Automatic Self-Winding", "Automatic Self-Winding, Swiss Quartz, Solar Powered, Smart OS"),
      selOpt("Water Resistance Rating", "50m (Swim)", "30m (Splashproof), 50m (Swim), 100m (Snorkel), 200m (Diver)"),
    ]
  },
  {
    key: "jewelry",
    dept: "fashion",
    label: "Jewelry",
    categoryName: "Jewelry / Luxury",
    icon: <DiamondOutlined sx={{ fontSize: 14 }} />,
    description: "Gold/Silver karat purity, Primary gemstone, and Ring/Chain sizing",
    tags: ["jewelry", "jewel", "gold", "silver", "diamond", "ring", "necklace", "bracelet", "earring", "gemstone"],
    types: [
      { label: "Rings", extra: [["Ring Style", "Solitaire", "Solitaire, Band, Cluster, Eternity"]] },
      { label: "Necklaces", extra: [["Chain Style", "Cable", "Cable, Rope, Box, Snake"]] },
      { label: "Earrings", extra: [["Earring Style", "Stud", "Stud, Hoop, Drop, Jhumka"]] },
      { label: "Bracelets & Bangles", extra: [["Closure", "Lobster Clasp", "Lobster Clasp, Slip-On, Magnetic"]] },
    ],
    getOptions: () => [
      selOpt("Metal Type & Purity", "18K Yellow Gold", "18K Yellow Gold, 18K White Gold, 14K Rose Gold, 925 Sterling Silver, Solid Platinum 950"),
      selOpt("Primary Gemstone", "Natural Diamond", "Natural Diamond, Lab-Grown Diamond, Moissanite, Blue Sapphire, Emerald, Ruby, Pearl"),
      selOpt("Ring / Chain Size", "US 7 / 20\"", "US 5 / 16\", US 6 / 18\", US 7 / 20\", US 8 / 22\", US 9 / 24\", US 10 / 26\""),
    ]
  },
  {
    key: "sports",
    dept: "lifestyle",
    label: "Sports",
    categoryName: "Sports / Athletics",
    icon: <FitnessCenterOutlined sx={{ fontSize: 14 }} />,
    description: "Equipment size, Weight/Resistance, and Sports color",
    tags: ["sport", "fitness", "gym", "workout", "dumbbell", "yoga", "exercise", "outdoor", "cycling", "ball"],
    types: [
      { label: "Gym Equipment", extra: [["Adjustable", "Fixed Weight", "Fixed Weight, Adjustable"]] },
      { label: "Yoga & Pilates", extra: [["Mat Thickness", "6mm", "4mm, 6mm, 8mm, 10mm"]] },
      { label: "Cycling", extra: [["Frame Size", "M", "S, M, L, XL"]] },
      { label: "Outdoor & Camping", extra: [["Season Rating", "3 Season", "Summer, 3 Season, 4 Season"]] },
      { label: "Team Sports", extra: [["Ball Size", "Size 5", "Size 3, Size 4, Size 5, Size 7"]] },
    ],
    getOptions: () => [
      selOpt("Equipment Size", "Medium", "Small, Medium, Large, Extra Large, Universal"),
      selOpt("Resistance / Weight Level", "10 kg", "5 kg, 10 kg, 15 kg, 20 kg, 25 kg, Light Tension, Heavy Tension"),
      colorOpt("Equipment Color", "Blue"),
    ]
  },
  {
    key: "automotive",
    dept: "lifestyle",
    label: "Automotive",
    categoryName: "Automotive / Parts",
    icon: <DirectionsCarOutlined sx={{ fontSize: 14 }} />,
    description: "Vehicle fitment type, Vehicle placement, and Build material",
    tags: ["auto", "automotive", "car", "motor", "vehicle", "spare part", "brake", "oil", "tire", "accessories"],
    types: [
      { label: "Car Parts", extra: [["Part Condition", "New", "New, Refurbished, Used"]] },
      { label: "Motorcycle Parts", extra: [["Engine Capacity", "150cc", "100cc, 125cc, 150cc, 200cc, 250cc+"]] },
      { label: "Tires & Wheels", extra: [["Rim Size", "16 inch", "14 inch, 15 inch, 16 inch, 17 inch, 18 inch"]] },
      { label: "Oils & Fluids", extra: [["Viscosity Grade", "5W-30", "0W-20, 5W-30, 10W-40, 15W-50"]] },
      { label: "Car Accessories" },
    ],
    getOptions: () => [
      selOpt("Vehicle Fitment Type", "Universal Fit", "Universal Fit, Sedan Compatible, SUV Compatible, Pickup Truck, Motorcycle"),
      selOpt("Placement on Vehicle", "Front Driver Side", "Front Driver Side, Front Passenger Side, Rear Bumper, Under Hood, Interior Cabin"),
      selOpt("Material & Build Grade", "OEM Standard", "OEM Standard, Forged Aluminum, Carbon Fiber Composite, High-Tensile Steel"),
    ]
  },
  {
    key: "baby",
    dept: "lifestyle",
    label: "Baby & Toys",
    categoryName: "Baby & Children",
    icon: <ChildCareOutlined sx={{ fontSize: 14 }} />,
    description: "Target age bracket, BPA-free safety certifications, and Theme color",
    tags: ["baby", "kid", "child", "infant", "toddler", "toy", "stroller", "diaper", "play", "nursery"],
    types: [
      { label: "Toys", extra: [["Toy Category", "Educational", "Educational, Soft Toy, Building Blocks, Remote Control"]] },
      { label: "Diapers & Wipes", extra: [["Diaper Size", "Medium", "Newborn, Small, Medium, Large, XL"]] },
      { label: "Strollers & Car Seats", extra: [["Foldable", "Yes", "Yes, No"]] },
      { label: "Feeding", extra: [["Feeding Item", "Bottle", "Bottle, Sippy Cup, Formula, Baby Food"]] },
      { label: "Baby Clothing", extra: [["Clothing Size", "6-12 Months", "0-3 Months, 3-6 Months, 6-12 Months, 1-2 Years"]] },
    ],
    getOptions: () => [
      selOpt("Target Age Bracket", "1 - 3 Years (Toddler)", "0 - 6 Months, 6 - 12 Months, 1 - 3 Years (Toddler), 3 - 5 Years (Preschool), 6 - 12 Years"),
      selOpt("Safety & Non-Toxic Standard", "100% BPA-Free & Food Grade", "100% BPA-Free & Food Grade, ASTM F963 Certified, EN71 Safety Approved, Organic Cotton"),
      colorOpt("Color / Theme", "Yellow"),
    ]
  },
  {
    key: "books",
    dept: "lifestyle",
    label: "Books",
    categoryName: "Books / Publishing",
    icon: <MenuBookOutlined sx={{ fontSize: 14 }} />,
    description: "Cover binding, Publishing language, and Deluxe edition",
    tags: ["book", "novel", "stationery", "notebook", "office", "pen", "paper", "author", "reading"],
    types: [
      { label: "Novels & Fiction", extra: [["Genre", "Thriller", "Thriller, Romance, Fantasy, Sci-Fi, Mystery"]] },
      { label: "Textbooks", extra: [["Grade / Level", "Secondary", "Primary, Secondary, Undergraduate, Postgraduate"]] },
      { label: "Children Books", extra: [["Age Group", "3-6 Years", "0-3 Years, 3-6 Years, 6-9 Years"]] },
      { label: "Notebooks & Journals", extra: [["Page Style", "Ruled", "Ruled, Blank, Dotted, Grid"]] },
      { label: "Stationery" },
    ],
    getOptions: () => [
      selOpt("Binding Format", "Paperback", "Paperback, Hardcover Collector's, Spiral Bound Journal, Leather Bound"),
      selOpt("Edition & Version", "1st Edition Standard", "1st Edition Standard, Deluxe Illustrated Edition, Student Study Edition"),
      selOpt("Language", "English", "English, Arabic, Spanish, French, German, Japanese"),
    ]
  },
  {
    key: "pets",
    dept: "lifestyle",
    label: "Pets",
    categoryName: "Pet Care & Food",
    icon: <PetsOutlined sx={{ fontSize: 14 }} />,
    description: "Target pet animal, Pet life stage, and Pack weight",
    tags: ["pet", "dog", "cat", "puppy", "kitten", "bird", "fish", "food", "leash", "collar"],
    types: [
      { label: "Dog Supplies", extra: [["Breed Size", "Medium Breed", "Small Breed, Medium Breed, Large Breed, Giant Breed"]] },
      { label: "Cat Supplies", extra: [["Coat Type", "All Coats", "All Coats, Short Hair, Long Hair"]] },
      { label: "Bird Supplies" },
      { label: "Fish & Aquarium", extra: [["Water Type", "Freshwater", "Freshwater, Saltwater"]] },
    ],
    getOptions: () => [
      selOpt("Target Pet", "Dogs", "Dogs, Cats, Birds, Small Animals, Aquatic Fish"),
      selOpt("Pet Life Stage", "Adult (1-7 yrs)", "Puppy / Kitten (0-1 yr), Adult (1-7 yrs), Senior (7+ yrs), All Life Stages"),
      selOpt("Bag / Pack Size", "3 kg", "1 kg, 3 kg, 5 kg, 10 kg, 15 kg Bulk"),
    ]
  },
  {
    key: "luggage",
    dept: "lifestyle",
    label: "Luggage",
    categoryName: "Travel / Luggage",
    icon: <LuggageOutlined sx={{ fontSize: 14 }} />,
    description: "Luggage inches, Outer shell material, and Built-in TSA Lock",
    tags: ["luggage", "bag", "travel", "suitcase", "backpack", "duffel", "trolley", "briefcase", "carry on"],
    types: [
      { label: "Suitcase", extra: [["Wheel Type", "4 Spinner Wheels", "2 Wheels, 4 Spinner Wheels"]] },
      { label: "Backpack", extra: [["Laptop Compartment", "Up to 15.6-inch", "None, Up to 14-inch, Up to 15.6-inch, Up to 17-inch"]] },
      { label: "Duffel Bag" },
      { label: "Briefcase & Laptop Bag", extra: [["Closure", "Zipper", "Zipper, Flap, Buckle"]] },
    ],
    getOptions: () => [
      selOpt("Size & Capacity", "20-inch Cabin Carry-On", "20-inch Cabin Carry-On, 24-inch Medium Check-in, 28-inch Large Check-in, 35L Daypack, 55L Travel Duffel"),
      selOpt("Outer Shell Material", "Polycarbonate Hard-Shell", "Polycarbonate Hard-Shell, Ballistic Nylon, Top-Grain Leather, Waterproof Polyester"),
      selOpt("Lock & Security Feature", "Built-in TSA 3-Dial Lock", "Built-in TSA 3-Dial Lock, Anti-Theft Double Zipper, Standard Padlock Loop"),
    ]
  },
  {
    key: "colors",
    dept: "all",
    label: "Colors",
    categoryName: "Color Swatches",
    icon: <ColorLensOutlined sx={{ fontSize: 14 }} />,
    description: "Direct primary color selector (No hex required)",
    tags: ["color", "swatch", "palette"],
    types: [],
    getOptions: () => [colorOpt("Primary Color", "Red")]
  }
];

/**
 * Builds the final options array for a preset (+ optional type).
 * Loops the type's `extra` array and appends one Selection option per entry.
 */
const buildPresetOptions = (preset: CategoryPresetItem, typeLabel?: string | null): VariantOption[] => {
  const options = preset.getOptions();
  const type = preset.types.find((t) => t.label === typeLabel);
  if (type?.extra?.length) {
    type.extra.forEach(([label, value, choices]) => {
      options.push(selOpt(label, value, choices));
    });
  }
  return options;
};

// --- STYLING CONSTANTS ---
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

// --- REUSABLE UI PIECES ---
const SectionHeader = ({
  icon, title, subtitle, stepNumber, action
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  stepNumber?: string;
  action?: React.ReactNode;
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
    {(action || stepNumber) && (
      <Stack direction="row" spacing={1} alignItems="center">
        {action}
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
      </Stack>
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

/** URL paste + multi-file upload + thumbnail grid + Cover select */
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

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
    onToast("Cover image updated!", "success");
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
            startIcon={uploading ? <CircularProgress size={12} color="inherit" /> : <CloudUploadOutlined sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor: primaryTeal,
              whiteSpace: "nowrap",
              height: 32,
              px: 1.4,
              borderRadius: "7px",
              fontFamily: primaryFont,
              fontWeight: 700,
              fontSize: "0.70rem",
              textTransform: "none",
              boxShadow: "0 2px 6px rgba(0,70,82,0.18)",
              "&:hover": { bgcolor: primaryTealHover },
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
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
                  bgcolor: "rgba(15, 23, 42, 0.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  opacity: 0,
                  transition: "opacity 0.2s ease"
                }}
              >
                {i !== 0 && (
                  <Tooltip title="Set as Main Cover">
                    <IconButton size="small" onClick={() => setAsCover(i)} sx={{ bgcolor: "#FFF", color: primaryTeal, p: 0.4, "&:hover": { bgcolor: "#E2E8F0" } }}>
                      <CheckOutlined sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                    sx={{ bgcolor: "#FFF", color: "#EF4444", p: 0.4, "&:hover": { bgcolor: "#FEE2E2" } }}
                  >
                    <DeleteOutline sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// =====================================================================
// PRIMARY COLOR PALETTE SELECTOR
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
// CLOTHING COLOR & SIZE MATRIX
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
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 1.6 }}>
        <Box>
          <Typography sx={{ fontFamily: primaryFont, fontSize: "0.73rem", fontWeight: 800, color: "#1E293B" }}>
            Configure Colors & Sizes Matrix
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
              whiteSpace: "nowrap",
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
                whiteSpace: "nowrap",
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
            sx={{ mt: 0.8, fontFamily: primaryFont, fontSize: "0.67rem", fontWeight: 700, color: primaryTeal, textTransform: "none", py: 0.2, whiteSpace: "nowrap" }}
          >
            Load Red & Yellow Demo
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
// MAIN ADVANCED COMPONENT
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
    metaTitle: "",
    metaDescription: "",
    slug: "",
  });

  const [categoriesFlat, setCategoriesFlat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Bulk Variant Action Dialog State
  const [bulkDialog, setBulkDialog] = useState<{ open: boolean; type: "price" | "stock" | "sku" | null; value: string }>({
    open: false, type: null, value: ""
  });

  // Add Option Menu Anchor State
  const [addOptionAnchorEl, setAddOptionAnchorEl] = useState<null | HTMLElement>(null);

  // Category Presets Catalog Filter State
  const [presetSearch, setPresetSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<PresetDepartment>("all");

  // Presets Library: selected preset + selected TYPE + merge mode
  const [activePresetKey, setActivePresetKey] = useState<CategoryPresetKey | null>(null);
  const [activeTypeLabel, setActiveTypeLabel] = useState<string | null>(null);
  const [keepExistingOptions, setKeepExistingOptions] = useState(false);

  const [toast, setToast] = useState({
    open: false, message: "", severity: "info" as "success" | "error" | "warning" | "info",
  });

  const showToast = (message: string, severity: "success" | "error" | "warning" | "info" = "info") =>
    setToast({ open: true, message, severity });

  const handleCloseToast = (_e?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  // --- AUTO-RESTORE SAVED DRAFT FROM LOCALSTORAGE ON MOUNT ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name || parsed?.price) {
          setForm(parsed);
          setDraftSavedAt("Restored from draft");
        }
      }
    } catch {
      // Ignored
    }
  }, []);

  // --- AUTO-PERSIST DRAFT STATE ---
  const saveTimeoutRef = useRef<any>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
        const now = new Date();
        setDraftSavedAt(`Auto-saved ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      } catch {
        // Ignored
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [form]);

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
        showToast("Failed to load categories from API", "error");
      }
    };
    fetchCategories();
  }, []);

  // --- LIVE DISCOUNT PERCENTAGE & SAVINGS COMPUTATION ---
  const discountInfo = useMemo(() => {
    const orig = Number(form.originalPrice);
    const offer = Number(form.price);
    if (orig && offer && orig > offer) {
      const savings = orig - offer;
      const pct = Math.round((savings / orig) * 100);
      return { percentage: pct, savings: savings.toFixed(2) };
    }
    return null;
  }, [form.originalPrice, form.price]);

  // --- CATALOG COMPLETION PERCENTAGE CALCULATOR ---
  const completionPercentage = useMemo(() => {
    let score = 0;
    if (form.name.trim()) score += 20;
    if (form.category) score += 20;
    if (form.price !== "") score += 20;
    if (form.images.length > 0) score += 15;
    if (form.quantity !== "" || form.variants.length > 0) score += 15;
    if (form.description.trim()) score += 10;
    return Math.min(score, 100);
  }, [form]);

  // --- DETECT RELEVANT CATEGORY PRESET (AND TYPE) AUTOMATICALLY ---
  const getDetectedCategoryPreset = (): { preset: CategoryPresetItem; typeLabel: string | null } | null => {
    if (!form.category) return null;
    const catObj = categoriesFlat.find((c) => c.id === form.category);
    const searchString = `${catObj?.rawTitle || catObj?.title || ""} ${form.name}`.toLowerCase();

    for (const preset of CATEGORY_PRESET_LIBRARY) {
      if (preset.tags.some((tag) => searchString.includes(tag))) {
        // Loop the preset's TYPES array and pick the first one whose words appear in the text
        const matchedType = preset.types.find((t) =>
          t.label
            .toLowerCase()
            .split(/[\s&/,-]+/)
            .filter((w) => w.length > 2)
            .some((w) => searchString.includes(w))
        );
        return { preset, typeLabel: matchedType?.label || null };
      }
    }
    return null;
  };

  const detected = getDetectedCategoryPreset();
  const detectedPreset = detected?.preset || null;

  const activePreset = useMemo(
    () => CATEGORY_PRESET_LIBRARY.find((p) => p.key === activePresetKey) || null,
    [activePresetKey]
  );

  // --- FILTERED CATEGORY PRESETS CATALOG ---
  const filteredPresets = useMemo(() => {
    const q = presetSearch.toLowerCase().trim();
    return CATEGORY_PRESET_LIBRARY.filter((preset) => {
      const matchDept = selectedDept === "all" || preset.dept === selectedDept;
      const matchQuery =
        !q ||
        preset.label.toLowerCase().includes(q) ||
        preset.categoryName.toLowerCase().includes(q) ||
        preset.description.toLowerCase().includes(q) ||
        preset.tags.some((t) => t.toLowerCase().includes(q)) ||
        preset.types.some((t) => t.label.toLowerCase().includes(q));
      return matchDept && matchQuery;
    });
  }, [selectedDept, presetSearch]);

  // --- AUTO SKU GENERATOR (SMART WAND) ---
  const handleAutoGenerateSKU = () => {
    const brandPrefix = (form.brand.trim() || "PRD").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const generated = `SKU-${brandPrefix}-${randomHex}`;
    setForm((prev) => ({ ...prev, sku: generated }));
    showToast(`Generated SKU: ${generated}`, "info");
  };

  // --- FORM HANDLERS ---
  const handleChange = (key: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      }
      return next;
    });
  };

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

  // --- SELECT A PRESET IN THE LIBRARY (opens its TYPE list) ---
  const handleSelectPreset = (presetKey: CategoryPresetKey) => {
    setActivePresetKey(presetKey);
    setActiveTypeLabel(null);
  };

  // --- APPLY PRESET (+ optional TYPE) ---
  const applyPreset = (presetKey: CategoryPresetKey, typeLabel: string | null = null, append = false) => {
    const preset = CATEGORY_PRESET_LIBRARY.find((p) => p.key === presetKey);
    if (!preset) return;

    const newOpts = buildPresetOptions(preset, typeLabel);

    setForm((p) => {
      let options: VariantOption[];
      if (append) {
        // keep existing options, skip any whose label already exists
        const existingLabels = new Set(p.options.map((o) => o.label.toLowerCase()));
        options = [...p.options, ...newOpts.filter((o) => !existingLabels.has(o.label.toLowerCase()))];
      } else {
        options = newOpts;
      }
      return {
        ...p,
        options,
        productType: typeLabel || p.productType,
      };
    });

    const suffix = typeLabel ? ` → ${typeLabel}` : "";
    showToast(`Applied ${preset.label}${suffix} options (${newOpts.length})`, "success");
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
          unit: "pcs"
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

  // --- BULK OPERATIONS ON VARIANTS ---
  const handleExecuteBulkAction = () => {
    if (bulkDialog.type === "price") {
      const newPrice = toNum(bulkDialog.value);
      if (newPrice === "") {
        showToast("Please specify a valid price.", "warning");
        return;
      }
      setForm((p) => ({
        ...p,
        variants: p.variants.map((v) => ({ ...v, price: newPrice }))
      }));
      showToast(`Updated price on all variants`, "success");
    } else if (bulkDialog.type === "stock") {
      const newQty = toNum(bulkDialog.value);
      if (newQty === "") {
        showToast("Please specify a valid stock unit quantity.", "warning");
        return;
      }
      setForm((p) => ({
        ...p,
        variants: p.variants.map((v) => ({ ...v, quantity: newQty }))
      }));
      showToast(`Updated stock units on all variants`, "success");
    } else if (bulkDialog.type === "sku") {
      setForm((p) => ({
        ...p,
        variants: p.variants.map((v, i) => ({
          ...v,
          sku: `${form.sku || "SKU"}-${v.name.replace(/[^A-Za-z0-9]/g, "-").toUpperCase()}-${i + 1}`
        }))
      }));
      showToast(`Regenerated SKUs for all variants`, "success");
    }
    setBulkDialog({ open: false, type: null, value: "" });
  };

  // --- VARIANT HELPERS ---
  const addVariant = () => setForm((p) => ({ ...p, variants: [...p.variants, emptyVariant()] }));

  const cloneVariant = (v: Variant) => {
    const cloned: Variant = {
      ...v,
      id: uid(),
      name: `${v.name} (Copy)`,
      sku: `${v.sku}-COPY`
    };
    setForm((p) => ({ ...p, variants: [...p.variants, cloned] }));
    showToast(`Cloned variant "${v.name}"`, "info");
  };

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

  // --- RESET & CLEAR DRAFT ---
  const handleClearDraft = () => {
    if (window.confirm("Are you sure you want to discard this draft and start fresh?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  // --- SAVE / PUBLISH LOGIC ---
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
        localStorage.removeItem(LOCAL_STORAGE_KEY);
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
      {/* HEADER / NAVIGATION BAR WITH FITTED BUTTONS */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.2}
        sx={{ mb: 1.6 }}
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
            <Typography sx={{ fontFamily: primaryFont, fontWeight: 900, color: "#0F172A", fontSize: "1.1rem", letterSpacing: -0.3 }}>
              Add New Product
            </Typography>
            <Chip label="Draft" size="small" sx={{ height: 18, bgcolor: "#E2E8F0", color: "#475569", fontWeight: 700, fontSize: "0.62rem", fontFamily: primaryFont }} />
            {draftSavedAt && (
              <Chip
                label={draftSavedAt}
                size="small"
                variant="outlined"
                sx={{ height: 18, borderColor: "#CBD5E1", color: "#64748B", fontSize: "0.60rem", fontFamily: primaryFont }}
              />
            )}
          </Stack>
        </Box>

        {/* FITTED TOP ACTION BUTTONS */}
        <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="nowrap">
          <Button
            size="small"
            onClick={onBack}
            startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: "10px !important" }} />}
            sx={{
              fontFamily: primaryFont,
              fontSize: "0.70rem",
              fontWeight: 700,
              textTransform: "none",
              color: "#64748B",
              px: 1.2,
              py: 0.45,
              height: 30,
              borderRadius: "7px",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#F1F5F9", color: "#0F172A" }
            }}
          >
            Discard
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() => setPreviewOpen(true)}
            startIcon={<VisibilityOutlined sx={{ fontSize: 13 }} />}
            sx={{
              fontFamily: primaryFont,
              fontSize: "0.70rem",
              fontWeight: 700,
              textTransform: "none",
              color: primaryTeal,
              borderColor: primaryTeal,
              px: 1.2,
              py: 0.45,
              height: 30,
              borderRadius: "7px",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "rgba(0, 70, 82, 0.05)" }
            }}
          >
            Preview
          </Button>

          <Button
            size="small"
            onClick={handleClearDraft}
            startIcon={<RestoreOutlined sx={{ fontSize: 13 }} />}
            sx={{
              fontFamily: primaryFont,
              fontSize: "0.70rem",
              fontWeight: 700,
              textTransform: "none",
              color: "#64748B",
              px: 1.1,
              py: 0.45,
              height: 30,
              borderRadius: "7px",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#F1F5F9", color: "#0F172A" }
            }}
          >
            Reset
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleSaveClick}
            disabled={loading}
            sx={{
              background: tealGradient,
              borderRadius: "7px",
              fontFamily: primaryFont,
              fontWeight: 800,
              fontSize: "0.72rem",
              textTransform: "none",
              whiteSpace: "nowrap",
              px: 1.6,
              py: 0.45,
              height: 30,
              boxShadow: "0 2px 8px rgba(0,70,82,0.22)",
              "&:hover": { background: primaryTealHover }
            }}
          >
            {loading ? <CircularProgress size={14} color="inherit" /> : "Publish"}
          </Button>
        </Stack>
      </Stack>

      {/* COMPLETION PROGRESS METER */}
      <Box sx={{ mb: 2.2, p: 1.2, bgcolor: "#FFFFFF", borderRadius: "8px", border: `1px solid ${borderColor}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
          <Typography sx={{ fontFamily: primaryFont, fontSize: "0.68rem", fontWeight: 700, color: "#475569" }}>
            Catalog Readiness Score
          </Typography>
          <Typography sx={{ fontFamily: primaryFont, fontSize: "0.68rem", fontWeight: 800, color: primaryTeal }}>
            {completionPercentage}% Complete
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={completionPercentage}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "#F1F5F9",
            "& .MuiLinearProgress-bar": { background: tealGradient, borderRadius: 3 }
          }}
        />
      </Box>

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
                subtitle="Specify title, classification, pricing, discount calculator, and attributes"
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

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-start">
                  <Field label="Regular Price (MSRP)">
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
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><AttachMoneyOutlined sx={{ color: primaryTeal, fontSize: 16 }} /></InputAdornment>,
                        endAdornment: discountInfo ? (
                          <InputAdornment position="end">
                            <Chip
                              label={`-${discountInfo.percentage}%`}
                              size="small"
                              sx={{ height: 20, bgcolor: "#EF4444", color: "#FFF", fontWeight: 800, fontSize: "0.62rem", fontFamily: primaryFont }}
                            />
                          </InputAdornment>
                        ) : undefined
                      }}
                      sx={inputStyle}
                      helperText={discountInfo ? `Shoppers save $${discountInfo.savings} off MSRP` : undefined}
                    />
                  </Field>

                  <Field label="SKU / Barcode">
                    <TextField
                      fullWidth
                      value={form.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                      placeholder="SKU-89214"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><QrCodeOutlined sx={{ color: "#94A3B8", fontSize: 16 }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Auto-generate Smart SKU">
                              <IconButton size="small" onClick={handleAutoGenerateSKU} sx={{ color: primaryTeal, p: 0.3 }}>
                                <AutoFixHighOutlined sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }}
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
                      placeholder="e.g. Zara, Nike, Apple, Sony, IKEA"
                      sx={inputStyle}
                    />
                  </Field>
                  <Field label="Product Subtype">
                    <TextField
                      fullWidth
                      value={form.productType}
                      onChange={(e) => handleChange("productType", e.target.value)}
                      placeholder="e.g. Casual Wear, Outerwear, Hardware"
                      sx={inputStyle}
                    />
                  </Field>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Field label="Package Size">
                    <TextField fullWidth value={form.size} onChange={(e) => handleChange("size", e.target.value)} placeholder="e.g. Standard / Large Box" sx={inputStyle} />
                  </Field>
                  <Field label="Unit of Measure">
                    <TextField fullWidth value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} placeholder="e.g. pcs, pack, set" sx={inputStyle} />
                  </Field>
                </Stack>

                <Field label="Overview Description">
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Provide a comprehensive product pitch, composition, wash care instructions, or key specifications..."
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

            {/* STEP 3: INTERACTIVE PRODUCT OPTIONS & PRESETS */}
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
                      Multi-e-commerce presets library, color matrices, sizes, and dynamic attributes
                    </Typography>
                  </Box>
                </Box>

                {/* FITTED ADD OPTION BUTTON */}
                <Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => setAddOptionAnchorEl(e.currentTarget)}
                    endIcon={<KeyboardArrowDownOutlined sx={{ fontSize: 13 }} />}
                    startIcon={<AddBoxOutlined sx={{ fontSize: 13 }} />}
                    sx={{
                      borderRadius: "7px",
                      fontFamily: primaryFont,
                      fontWeight: 700,
                      fontSize: "0.70rem",
                      color: primaryTeal,
                      borderColor: primaryTeal,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      px: 1.2,
                      py: 0.4,
                      height: 29,
                      "&:hover": { borderColor: primaryTealHover, bgcolor: "rgba(0, 70, 82, 0.05)" }
                    }}
                  >
                    + Add Option
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
                        minWidth: 230,
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

              {/* AUTO-DETECTED CATEGORY BANNER */}
              {detected && detectedPreset && (
                <Alert
                  severity="info"
                  icon={<ElectricBoltOutlined sx={{ color: primaryTeal, fontSize: 18 }} />}
                  action={
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setActivePresetKey(detectedPreset.key);
                        setActiveTypeLabel(detected.typeLabel);
                        applyPreset(detectedPreset.key, detected.typeLabel, keepExistingOptions);
                      }}
                      sx={{
                        bgcolor: primaryTeal,
                        fontFamily: primaryFont,
                        fontSize: "0.66rem",
                        fontWeight: 800,
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        borderRadius: "5px",
                        px: 1.1,
                        py: 0.3,
                        height: 25,
                        "&:hover": { bgcolor: primaryTealHover }
                      }}
                    >
                      Apply Match
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
                    Category Match: {detectedPreset.label}{detected.typeLabel ? ` → ${detected.typeLabel}` : ""}
                  </AlertTitle>
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "0.69rem", color: "#334155" }}>
                    Detected category match for your product. Click to load its pre-configured e-commerce options.
                  </Typography>
                </Alert>
              )}

              {/* PRESETS LIBRARY */}
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
                    Presets Library:
                  </Typography>
                  <TextField
                    size="small"
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                    placeholder="Search presets or types (e.g. perfume, jeans)..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined sx={{ fontSize: 14, color: "#94A3B8" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: { xs: "100%", sm: 260 },
                      "& .MuiInputBase-input": { py: 0.4, fontSize: "0.70rem", fontFamily: primaryFont },
                      "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "#FFF" }
                    }}
                  />
                </Stack>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.4 }}>
                  {[
                    { id: "all", label: "All (19)" },
                    { id: "fashion", label: "Fashion" },
                    { id: "tech", label: "Tech" },
                    { id: "beauty_health", label: "Beauty" },
                    { id: "living", label: "Living" },
                    { id: "lifestyle", label: "Lifestyle" },
                  ].map((tab) => {
                    const isSelected = selectedDept === tab.id;
                    return (
                      <Chip
                        key={tab.id}
                        label={tab.label}
                        size="small"
                        clickable
                        onClick={() => setSelectedDept(tab.id as PresetDepartment)}
                        sx={{
                          height: 22,
                          fontFamily: primaryFont,
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: "0.62rem",
                          bgcolor: isSelected ? primaryTeal : "#FFFFFF",
                          color: isSelected ? "#FFFFFF" : "#64748B",
                          border: `1px solid ${isSelected ? primaryTeal : borderColor}`,
                          "&:hover": { bgcolor: isSelected ? primaryTealHover : "#F1F5F9" }
                        }}
                      />
                    );
                  })}
                </Box>

                {/* PRESET BUTTONS (click = select, shows TYPE list below) */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7 }}>
                  {filteredPresets.length === 0 ? (
                    <Typography sx={{ fontFamily: primaryFont, fontSize: "0.70rem", color: "#94A3B8", py: 1 }}>
                      No preset matched your search.
                    </Typography>
                  ) : (
                    filteredPresets.map((preset) => {
                      const isDetected = detectedPreset?.key === preset.key;
                      const isActive = activePresetKey === preset.key;
                      return (
                        <Tooltip key={preset.key} title={`${preset.categoryName} — ${preset.description}`} arrow>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleSelectPreset(preset.key)}
                            startIcon={preset.icon}
                            sx={{
                              borderRadius: "6px",
                              fontFamily: primaryFont,
                              fontWeight: isDetected || isActive ? 800 : 700,
                              fontSize: "0.67rem",
                              textTransform: "none",
                              whiteSpace: "nowrap",
                              py: 0.35,
                              px: 0.9,
                              height: 28,
                              bgcolor: isActive ? primaryTeal : isDetected ? "rgba(0, 70, 82, 0.08)" : "#FFFFFF",
                              color: isActive ? "#FFFFFF" : isDetected ? primaryTeal : "#334155",
                              borderColor: isActive || isDetected ? primaryTeal : borderColor,
                              borderWidth: isActive || isDetected ? "1.5px" : "1px",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                              "&:hover": {
                                borderColor: primaryTeal,
                                bgcolor: isActive ? primaryTealHover : "rgba(0, 70, 82, 0.05)"
                              }
                            }}
                          >
                            {preset.label}
                            {isDetected && !isActive && (
                              <Chip
                                label="Match"
                                size="small"
                                sx={{
                                  ml: 0.5,
                                  height: 14,
                                  fontSize: "0.52rem",
                                  fontWeight: 800,
                                  bgcolor: primaryTeal,
                                  color: "#FFF"
                                }}
                              />
                            )}
                          </Button>
                        </Tooltip>
                      );
                    })
                  )}
                </Box>

                {/* SELECTED PRESET -> TYPES ARRAY LOOP + APPLY */}
                {activePreset && (
                  <Box
                    sx={{
                      mt: 1.6,
                      p: 1.4,
                      borderRadius: "10px",
                      bgcolor: "#FFFFFF",
                      border: `1.5px solid ${borderColor}`
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.4 }}>
                      <Typography sx={{ fontFamily: primaryFont, fontSize: "0.76rem", fontWeight: 800, color: primaryTeal }}>
                        {activePreset.label} — {activePreset.categoryName}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => { setActivePresetKey(null); setActiveTypeLabel(null); }}
                        sx={{ fontFamily: primaryFont, fontSize: "0.62rem", textTransform: "none", color: "#64748B", p: 0.2, minWidth: 0 }}
                      >
                        Close
                      </Button>
                    </Stack>
                    <Typography sx={{ fontFamily: primaryFont, fontSize: "0.66rem", color: "#64748B", mb: 1.1 }}>
                      {activePreset.description}
                    </Typography>

                    {activePreset.types.length > 0 && (
                      <>
                        <Typography sx={{ fontFamily: primaryFont, fontSize: "0.63rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", mb: 0.6 }}>
                          Type ({activePreset.types.length})
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mb: 1.3 }}>
                          {/* General = no type, base options only */}
                          <Chip
                            label="General"
                            size="small"
                            clickable
                            onClick={() => setActiveTypeLabel(null)}
                            sx={{
                              height: 24,
                              fontFamily: primaryFont,
                              fontWeight: activeTypeLabel === null ? 800 : 600,
                              fontSize: "0.65rem",
                              bgcolor: activeTypeLabel === null ? primaryTeal : "#F8FAFC",
                              color: activeTypeLabel === null ? "#FFF" : "#334155",
                              border: `1px solid ${activeTypeLabel === null ? primaryTeal : borderColor}`,
                              "&:hover": { bgcolor: activeTypeLabel === null ? primaryTealHover : "#F1F5F9" }
                            }}
                          />
                          {activePreset.types.map((t) => {
                            const isSel = activeTypeLabel === t.label;
                            return (
                              <Tooltip
                                key={t.label}
                                arrow
                                title={t.extra?.length ? `Adds: ${t.extra.map(([l]) => l).join(", ")}` : "Base options only"}
                              >
                                <Chip
                                  label={t.label}
                                  size="small"
                                  clickable
                                  icon={isSel ? <CheckOutlined sx={{ fontSize: "12px !important", color: "#FFF !important" }} /> : undefined}
                                  onClick={() => setActiveTypeLabel(t.label)}
                                  sx={{
                                    height: 24,
                                    fontFamily: primaryFont,
                                    fontWeight: isSel ? 800 : 600,
                                    fontSize: "0.65rem",
                                    bgcolor: isSel ? primaryTeal : "#F8FAFC",
                                    color: isSel ? "#FFF" : "#334155",
                                    border: `1px solid ${isSel ? primaryTeal : borderColor}`,
                                    "&:hover": { bgcolor: isSel ? primaryTealHover : "#F1F5F9" }
                                  }}
                                />
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </>
                    )}

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between">
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={keepExistingOptions}
                            onChange={(e) => setKeepExistingOptions(e.target.checked)}
                            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: primaryTeal }, "& .MuiSwitch-track": { bgcolor: keepExistingOptions ? primaryTeal : undefined } }}
                          />
                        }
                        label={
                          <Typography sx={{ fontFamily: primaryFont, fontSize: "0.68rem", fontWeight: 600, color: "#475569" }}>
                            Keep my existing options (add only new ones)
                          </Typography>
                        }
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => applyPreset(activePreset.key, activeTypeLabel, keepExistingOptions)}
                        startIcon={<AutoAwesomeOutlined sx={{ fontSize: 13 }} />}
                        sx={{
                          background: tealGradient,
                          borderRadius: "6px",
                          fontFamily: primaryFont,
                          fontWeight: 800,
                          fontSize: "0.68rem",
                          textTransform: "none",
                          whiteSpace: "nowrap",
                          px: 1.4,
                          py: 0.4,
                          height: 28,
                          boxShadow: "0 2px 6px rgba(0,70,82,0.18)",
                          "&:hover": { background: primaryTealHover }
                        }}
                      >
                        Apply {activePreset.label}{activeTypeLabel ? ` → ${activeTypeLabel}` : ""}
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>

              {/* LIST OF ACTIVE OPTIONS */}
              {form.options.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 3, bgcolor: surfaceBg, borderRadius: "12px", border: `1.5px dashed ${borderColor}` }}>
                  <PaletteOutlined sx={{ fontSize: 28, color: "#94A3B8", mb: 0.4 }} />
                  <Typography sx={{ color: "#475569", fontFamily: primaryFont, fontWeight: 700, fontSize: "0.78rem" }}>
                    No options applied yet
                  </Typography>
                  <Typography sx={{ color: "#94A3B8", fontFamily: primaryFont, fontSize: "0.68rem", mt: 0.2 }}>
                    Pick an E-Commerce Category preset above or click "+ Add Option" to configure colors, sizes, or attributes.
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

            {/* STEP 4: PRODUCT VARIANTS */}
            <Paper elevation={0} sx={paperSx}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} mb={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: tealGradient, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,70,82,0.2)" }}>
                    <LayersOutlined sx={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.88rem", color: "#0F172A", letterSpacing: -0.2 }}>
                      Variants & SKUs Inventory
                    </Typography>
                    <Typography sx={{ fontSize: "0.67rem", color: "#64748B", fontWeight: 500, fontFamily: primaryFont }}>
                      {form.variants.length} variant(s) configured in inventory
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={0.6} alignItems="center" flexWrap="nowrap">
                  {form.variants.length > 0 && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setBulkDialog({ open: true, type: "price", value: "" })}
                        sx={{ fontSize: "0.66rem", fontFamily: primaryFont, fontWeight: 700, textTransform: "none", whiteSpace: "nowrap", py: 0.3, px: 0.8, height: 28 }}
                      >
                        Bulk Price
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setBulkDialog({ open: true, type: "stock", value: "" })}
                        sx={{ fontSize: "0.66rem", fontFamily: primaryFont, fontWeight: 700, textTransform: "none", whiteSpace: "nowrap", py: 0.3, px: 0.8, height: 28 }}
                      >
                        Bulk Stock
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setBulkDialog({ open: true, type: "sku", value: "" })}
                        sx={{ fontSize: "0.66rem", fontFamily: primaryFont, fontWeight: 700, textTransform: "none", whiteSpace: "nowrap", py: 0.3, px: 0.8, height: 28 }}
                      >
                        Auto SKUs
                      </Button>
                    </>
                  )}

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={addVariant}
                    startIcon={<AddBoxOutlined sx={{ fontSize: 13 }} />}
                    sx={{
                      borderRadius: "6px",
                      fontFamily: primaryFont,
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      color: primaryTeal,
                      borderColor: primaryTeal,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      px: 1.0,
                      py: 0.35,
                      height: 28,
                      "&:hover": { borderColor: primaryTealHover, bgcolor: "rgba(0, 70, 82, 0.05)" }
                    }}
                  >
                    + Add Variant
                  </Button>
                </Stack>
              </Stack>

              {form.variants.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 3, bgcolor: surfaceBg, borderRadius: "12px", border: `1.5px dashed ${borderColor}` }}>
                  <LayersOutlined sx={{ fontSize: 28, color: "#94A3B8", mb: 0.4 }} />
                  <Typography sx={{ color: "#475569", fontFamily: primaryFont, fontWeight: 700, fontSize: "0.78rem" }}>
                    No product variants configured
                  </Typography>
                  <Typography sx={{ color: "#94A3B8", fontFamily: primaryFont, fontSize: "0.68rem", mt: 0.2 }}>
                    Click "Generate Variants" under Color & Sizes above, or click "+ Add Variant" to add items manually.
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

                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Tooltip title="Clone Variant">
                            <IconButton size="small" onClick={() => cloneVariant(v)} sx={{ color: "#64748B", p: 0.4 }}>
                              <ContentCopyOutlined sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Variant">
                            <IconButton size="small" onClick={() => removeVariant(v.id)} sx={{ color: "#EF4444", bgcolor: "#FEF2F2", p: 0.4, "&:hover": { bgcolor: "#FEE2E2" } }}>
                              <DeleteOutline sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
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
                        </Stack>

                        {/* Variant description highlights */}
                        <Box sx={{ p: 1.4, bgcolor: surfaceBg, borderRadius: "8px", border: `1px solid ${borderColor}` }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                            <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.65rem", color: "#475569", textTransform: "uppercase" }}>
                              Variant Highlights & Specs
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => addDescLine(v)}
                              startIcon={<AddBoxOutlined sx={{ fontSize: 13 }} />}
                              sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.66rem", color: primaryTeal, textTransform: "none", p: 0, whiteSpace: "nowrap" }}
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

            {/* STEP 6: SEO */}
            <Paper elevation={0} sx={paperSx}>
              <SectionHeader
                icon={<SearchOutlined sx={{ fontSize: 17 }} />}
                title="Search Engine Optimization (SEO)"
                subtitle="Preview and manage how this product appears on Google Search"
                stepNumber="Step 6"
              />

              <Stack spacing={1.6}>
                <Box sx={{ p: 1.6, borderRadius: "10px", bgcolor: "#FAFBFD", border: `1px solid ${borderColor}` }}>
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "0.62rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", mb: 0.5 }}>
                    Google Search Result Simulation
                  </Typography>
                  <Typography sx={{ color: "#202124", fontSize: "0.75rem", fontFamily: primaryFont }}>
                    https://store.example.com › products › <span style={{ color: "#5f6368" }}>{form.slug || "product-url-slug"}</span>
                  </Typography>
                  <Typography sx={{ color: "#1a0dab", fontSize: "0.95rem", fontWeight: 600, fontFamily: primaryFont, mt: 0.2 }}>
                    {form.metaTitle || form.name || "Product Title Preview"} | Official Store
                  </Typography>
                  <Typography sx={{ color: "#4d5156", fontSize: "0.75rem", fontFamily: primaryFont, mt: 0.3, lineHeight: 1.4 }}>
                    {form.metaDescription || form.description.slice(0, 150) || "Comprehensive product overview and online purchasing with fast home delivery and warranty."}
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Field label="SEO Meta Title">
                    <TextField
                      fullWidth
                      value={form.metaTitle}
                      onChange={(e) => handleChange("metaTitle", e.target.value)}
                      placeholder={form.name || "Custom meta title..."}
                      sx={inputStyle}
                    />
                  </Field>
                  <Field label="URL Handle / Slug">
                    <TextField
                      fullWidth
                      value={form.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      placeholder="e.g. premium-crewneck-tshirt"
                      sx={inputStyle}
                    />
                  </Field>
                </Stack>

                <Field label="Meta Description">
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={form.metaDescription}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                    placeholder="Short summary for search engines (160 chars recommended)..."
                    sx={inputStyle}
                  />
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
                  placeholder="e.g. casual, cotton, summer, trending"
                  helperText="Separate keywords with commas"
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
                whiteSpace: "nowrap",
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
              {loading ? "Publishing..." : "Publish Product"}
            </Button>

          </Stack>
        </Box>
      </Stack>

      {/* ================= LIVE STOREFRONT PREVIEW MODAL ================= */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 24px 60px rgba(15,23,42,0.2)",
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontFamily: primaryFont, fontWeight: 900, fontSize: "0.95rem", color: "#0F172A" }}>
              Live Storefront Preview
            </Typography>
            <Chip label="PDP Simulation" size="small" sx={{ height: 18, fontSize: "0.60rem", bgcolor: "rgba(0,70,82,0.08)", color: primaryTeal, fontWeight: 800 }} />
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Desktop View">
              <IconButton size="small" onClick={() => setPreviewMode("desktop")} sx={{ color: previewMode === "desktop" ? primaryTeal : "#94A3B8" }}>
                <DesktopWindowsOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mobile View">
              <IconButton size="small" onClick={() => setPreviewMode("mobile")} sx={{ color: previewMode === "mobile" ? primaryTeal : "#94A3B8" }}>
                <SmartphoneOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "#F8FAFC", display: "flex", justifyContent: "center", p: { xs: 1.5, sm: 3 } }}>
          <Box
            sx={{
              width: previewMode === "mobile" ? "360px" : "100%",
              maxWidth: "760px",
              bgcolor: "#FFFFFF",
              borderRadius: "14px",
              p: 2.5,
              boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              border: `1px solid ${borderColor}`,
              transition: "width 0.3s ease"
            }}
          >
            <Stack direction={{ xs: "column", sm: previewMode === "mobile" ? "column" : "row" }} spacing={2.5}>
              {/* Product Media Column */}
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: `1px solid ${borderColor}`,
                    bgcolor: "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                  }}
                >
                  {form.images[0] ? (
                    <img src={form.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Typography sx={{ fontFamily: primaryFont, fontSize: "0.75rem", color: "#94A3B8" }}>
                      No Image Uploaded
                    </Typography>
                  )}

                  {discountInfo && (
                    <Chip
                      label={`-${discountInfo.percentage}%`}
                      size="small"
                      sx={{ position: "absolute", top: 8, left: 8, bgcolor: "#EF4444", color: "#FFF", fontWeight: 800, fontSize: "0.65rem" }}
                    />
                  )}
                </Box>
              </Box>

              {/* Product Info Column */}
              <Box sx={{ flex: 1.2 }}>
                <Typography sx={{ fontFamily: primaryFont, fontSize: "0.68rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  {form.brand || "Brand"}
                </Typography>
                <Typography sx={{ fontFamily: primaryFont, fontSize: "1.05rem", fontWeight: 800, color: "#0F172A", mt: 0.2 }}>
                  {form.name || "Untitled Product"}
                </Typography>

                <Stack direction="row" spacing={0.8} alignItems="center" sx={{ my: 0.8 }}>
                  <Rating value={4.8} precision={0.5} size="small" readOnly />
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "0.68rem", fontWeight: 700, color: "#64748B" }}>
                    4.8 (124 reviews)
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "1.25rem", fontWeight: 900, color: primaryTeal }}>
                    ${form.price ? Number(form.price).toFixed(2) : "0.00"}
                  </Typography>
                  {form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
                    <Typography sx={{ fontFamily: primaryFont, fontSize: "0.85rem", color: "#94A3B8", textDecoration: "line-through" }}>
                      ${Number(form.originalPrice).toFixed(2)}
                    </Typography>
                  )}
                </Stack>

                {/* Badges */}
                <Stack direction="row" spacing={0.8} sx={{ mb: 1.5 }}>
                  <Chip
                    label={form.soldOut ? "Out of Stock" : "In Stock"}
                    size="small"
                    sx={{
                      height: 20,
                      fontWeight: 800,
                      fontSize: "0.62rem",
                      bgcolor: form.soldOut ? "#FEE2E2" : "#DCFCE7",
                      color: form.soldOut ? "#DC2626" : "#16A34A"
                    }}
                  />
                  <Chip
                    icon={<LocalShippingOutlined sx={{ fontSize: "12px !important" }} />}
                    label={form.deliveryTime}
                    size="small"
                    sx={{ height: 20, fontWeight: 700, fontSize: "0.62rem", bgcolor: "#F1F5F9", color: "#334155" }}
                  />
                </Stack>

                <Typography sx={{ fontFamily: primaryFont, fontSize: "0.72rem", color: "#475569", lineHeight: 1.5, mb: 2 }}>
                  {form.description || "Product overview and features will be rendered here."}
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={form.soldOut}
                  startIcon={<ShoppingBagOutlined sx={{ fontSize: 16 }} />}
                  sx={{
                    background: tealGradient,
                    borderRadius: "8px",
                    fontFamily: primaryFont,
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    py: 0.9,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(0,70,82,0.22)"
                  }}
                >
                  {form.soldOut ? "Sold Out" : "Add to Cart"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setPreviewOpen(false)} sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.72rem", color: "#64748B", whiteSpace: "nowrap" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= BULK ACTIONS MODAL ================= */}
      <Dialog open={bulkDialog.open} onClose={() => setBulkDialog({ open: false, type: null, value: "" })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.92rem", color: "#0F172A" }}>
          {bulkDialog.type === "price" && "Bulk Set Variant Price"}
          {bulkDialog.type === "stock" && "Bulk Set Stock Quantity"}
          {bulkDialog.type === "sku" && "Regenerate All SKUs"}
        </DialogTitle>
        <DialogContent>
          {bulkDialog.type === "sku" ? (
            <Typography sx={{ fontFamily: primaryFont, fontSize: "0.75rem", color: "#475569" }}>
              This will automatically re-assign unique, standardized SKUs across all <b>{form.variants.length}</b> configured variants.
            </Typography>
          ) : (
            <TextField
              fullWidth
              autoFocus
              type="number"
              label={bulkDialog.type === "price" ? "New Price for All Variants ($)" : "Stock Units for All"}
              value={bulkDialog.value}
              onChange={(e) => setBulkDialog((prev) => ({ ...prev, value: e.target.value }))}
              sx={{ mt: 1, ...inputStyle }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <Button onClick={() => setBulkDialog({ open: false, type: null, value: "" })} sx={{ fontFamily: primaryFont, fontSize: "0.72rem", color: "#64748B", whiteSpace: "nowrap" }}>
            Cancel
          </Button>
          <Button onClick={handleExecuteBulkAction} variant="contained" sx={{ bgcolor: primaryTeal, fontFamily: primaryFont, fontWeight: 800, fontSize: "0.72rem", whiteSpace: "nowrap" }}>
            Apply to All
          </Button>
        </DialogActions>
      </Dialog>

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
            {form.variants.length > 0 ? ` alongside ${form.variants.length} variant configuration(s)` : ""}. It will be immediately discoverable in your live storefront catalog.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.6, gap: 0.8 }}>
          <Button
            size="small"
            onClick={() => setConfirmDialogOpen(false)}
            disabled={loading}
            sx={{ color: "#64748B", fontWeight: 700, fontFamily: primaryFont, fontSize: "0.72rem", textTransform: "none", py: 0.4, px: 1.2, height: 28, whiteSpace: "nowrap" }}
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
              whiteSpace: "nowrap",
              px: 1.6,
              py: 0.4,
              height: 28,
              "&:hover": { background: primaryTealHover }
            }}
          >
            {loading ? "Publishing..." : "Publish Now"}
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
