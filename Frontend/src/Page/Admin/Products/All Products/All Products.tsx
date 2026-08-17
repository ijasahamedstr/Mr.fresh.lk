import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, Typography, Stack, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Avatar, 
  Button, TextField, Pagination, Dialog, Tooltip,
  Snackbar, Alert, LinearProgress, Checkbox, Breadcrumbs, Link, 
  ThemeProvider, createTheme, Chip, Divider
} from "@mui/material";
import { 
  DeleteOutline, SearchOutlined, WarningAmberRounded,
  FileDownloadOutlined, NavigateNext, EditOutlined,
  Inventory2Outlined, LocalOfferOutlined, StarBorderOutlined,
  VisibilityOutlined, VisibilityOffOutlined, AddBoxOutlined,
  CategoryOutlined, CloseOutlined, PublicOutlined, LocalShippingOutlined,
  ListAltOutlined
} from "@mui/icons-material";

// Import your sub-pages
import NewProductsCreate from "./New Products Create.tsx";
import ProductUpdate from "./EditProducts.tsx";

// --- CONFIGURATION & CONSTANTS ---
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const CACHE_KEY = "PRODUCTS_INVENTORY_CACHE";
const PRIMARY_TEAL = "#004652";
const ACCENT_AMBER = "#F59E0B";

const montserratTheme = createTheme({
  typography: {
    fontFamily: "'Montserrat', sans-serif",
    allVariants: { fontFamily: "'Montserrat', sans-serif" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", textTransform: 'none' } } },
    MuiTableCell: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiInputBase: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiAlert: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiPaginationItem: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
  }
});

// --- MATCHING MONGOOSE SCHEMA ---
export interface Variant {
  name?: string;
  price?: number;
  originalPrice?: number;
  sku?: string;
  weight?: number;
  images?: string[];
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  mainCategory?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  weight?: number;
  description?: string;
  images: string[];
  
  // NEW FIELDS
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

  todaySpecial: boolean;
  popularProduct: boolean;
  visibility: boolean;
  soldOut: boolean;
  trackQty: boolean;
  quantity: number;
  minQty: number;
  maxQty: number;
  tags?: any; // Marked as any to handle both array/string safely
  variants?: Variant[];
  createdAt: string;
  updatedAt: string;
}

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle");
  
  // Page Navigation States
  const [showAddForm, setShowAddForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  // Dialog States
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });

  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const rowsPerPage = 8; 

  // --- DATA FETCHING ---
  const fetchProducts = useCallback(async (isManual = false) => {
    if (isManual) setSyncStatus("syncing");
    try {
      const response = await fetch(`${API_BASE_URL}/Products`);
      if (!response.ok) throw new Error("Connection Interrupted");
      const payload = await response.json();
      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      if (!Array.isArray(data)) throw new Error("Invalid products response");

      setProducts(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setSyncStatus("idle");
      if (isManual) triggerSnackbar("Database synchronization complete", "success");
    } catch (error) {
      setSyncStatus("error");
      triggerSnackbar("Offline Mode: Using cached data", "error");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(() => fetchProducts(), 300000); // 5 min sync
    return () => clearInterval(interval);
  }, [fetchProducts]);

  const triggerSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // --- CORE ACTIONS ---
  const handleDelete = async () => {
    const targetId = deleteDialog.id;
    if (!targetId) return;

    // Optimistic UI Update
    const updated = products.filter(p => p._id !== targetId);
    setProducts(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setDeleteDialog({ open: false, id: null });
    setSelected(prev => prev.filter(id => id !== targetId));

    try {
      const res = await fetch(`${API_BASE_URL}/Products/${targetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      triggerSnackbar("Product successfully deleted", "success");
    } catch {
      fetchProducts();
      triggerSnackbar("Deletion failed on server. Restoring product.", "error");
    }
  };

  const handleBulkDelete = async () => {
    const updated = products.filter(p => !selected.includes(p._id));
    setProducts(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setSelected([]);
    triggerSnackbar(`Purging selected products...`, "success");
    
    // Simulate backend calls for bulk delete
    fetchProducts(); 
  };

  // --- SELECTION & EXPORT ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? paginatedData.map(n => n._id) : []);
  };

  const handleSelectOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const exportToCSV = () => {
    const headers = ["ID,Name,Brand,Category,Price,Quantity,SKU,Origin,Visibility,AddedDate\n"];
    const rows = products.map(p => 
      `${p._id},"${p.name}","${p.brand || ''}","${p.category}",${p.price},${p.quantity},"${p.sku || ''}","${p.originType || 'Local'}",${p.visibility ? 'Visible' : 'Hidden'},${new Date(p.createdAt).toISOString()}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product_inventory_${new Date().getTime()}.csv`;
    a.click();
  };

  // --- FILTER & PAGINATION ---
  const filteredData = useMemo(() => {
    return products.filter((p) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(searchLower) || 
        p.category.toLowerCase().includes(searchLower) ||
        (p.brand && p.brand.toLowerCase().includes(searchLower)) ||
        (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
        p._id.toLowerCase().includes(searchLower)
      );
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [products, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // --- ROUTING VIEWS ---
  if (showAddForm) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <NewProductsCreate onBack={() => { setShowAddForm(false); fetchProducts(); }} />
      </ThemeProvider>
    );
  }

  if (productToEdit) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <ProductUpdate
          productId={productToEdit._id}
          initialProduct={productToEdit}
          onBack={() => { setProductToEdit(null); fetchProducts(); }}
        />
      </ThemeProvider>
    );
  }

  // --- MAIN TABLE VIEW ---
  return (
    <ThemeProvider theme={montserratTheme}>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1.5, md: 3 } }}>
        
        {/* HEADER */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} mb={3} spacing={2}>
          <Box>
            <Breadcrumbs separator={<NavigateNext sx={{ fontSize: '0.8rem' }} />} sx={{ mb: 0.5 }}>
              <Link underline="hover" color="inherit" href="/" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>DASHBOARD</Link>
              <Typography color="text.primary" sx={{ fontSize: '0.65rem', fontWeight: 800, color: PRIMARY_TEAL }}>ALL PRODUCTS</Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, letterSpacing: "-0.5px", fontSize: '1.4rem' }}>
              Product Inventory
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: syncStatus === 'idle' ? '#10B981' : '#F59E0B', animation: syncStatus === 'syncing' ? 'pulse 1.5s infinite' : 'none' }} />
               <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: "#64748B", letterSpacing: 0.5 }}>
                 {syncStatus === 'syncing' ? 'SYNCING CATALOG...' : 'CATALOG UP TO DATE'}
               </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
             <Tooltip title="Export Inventory">
               <IconButton size="medium" onClick={exportToCSV} sx={{ bgcolor: "#FFF", border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                 <FileDownloadOutlined fontSize="small" />
               </IconButton>
             </Tooltip>
             <Button 
              size="medium" variant="contained" onClick={() => setShowAddForm(true)}
              startIcon={<AddBoxOutlined fontSize="small" />}
              sx={{ bgcolor: PRIMARY_TEAL, borderRadius: "8px", px: 3, py: 1, fontSize: '0.8rem', fontWeight: 700, boxShadow: "0 4px 12px rgba(0,70,82,0.15)", "&:hover": { bgcolor: "#002d35" } }}
            >
              Add New Product
            </Button>
          </Stack>
        </Stack>

        {/* SEARCH BAR */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ width: '100%' }}>
            <Paper elevation={0} sx={{ p: 1, px: 2, borderRadius: "8px", border: "1px solid #E2E8F0", display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth size="small" variant="standard"
                placeholder="Search products by Name, Brand, Category, or SKU..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: <SearchOutlined sx={{ mr: 1, color: PRIMARY_TEAL, fontSize: '1.2rem' }} />,
                  sx: { fontWeight: 600, fontSize: '0.85rem' }
                }}
              />
            </Paper>
          </Box>
        </Stack>

        {/* DATA TABLE */}
        <Box sx={{ position: 'relative', minHeight: '400px' }}>
            {syncStatus === 'syncing' && <LinearProgress sx={{ position: 'absolute', top: -10, left: 0, right: 0, height: 3, borderRadius: '4px', bgcolor: 'transparent', '& .MuiLinearProgress-bar': { bgcolor: PRIMARY_TEAL } }} />}
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <Table size="medium" sx={{ minWidth: 1000 }}>
                    <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                        <TableCell padding="checkbox">
                        <Checkbox size="small" indeterminate={selected.length > 0 && selected.length < paginatedData.length} checked={paginatedData.length > 0 && selected.length === paginatedData.length} onChange={handleSelectAll} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>PRODUCT INFO</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>PRICE</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>STATUS / STOCK</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>HIGHLIGHTS</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", pr: 4, letterSpacing: 0.5 }}>ACTIONS</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((product) => (
                        <TableRow key={product._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell padding="checkbox">
                            <Checkbox size="small" checked={selected.includes(product._id)} onChange={() => handleSelectOne(product._id)} />
                            </TableCell>
                            
                            {/* PRODUCT INFO */}
                            <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar 
                                  variant="rounded" 
                                  src={product.images && product.images.length > 0 ? product.images[0] : undefined} 
                                  sx={{ width: 50, height: 50, bgcolor: "#F1F5F9", border: '1px solid #E2E8F0', color: PRIMARY_TEAL }}
                                >
                                  {!product.images?.length && <Inventory2Outlined fontSize="small" />}
                                </Avatar>
                                <Box>
                                  <Stack direction="row" spacing={1} alignItems="center" mb={0.3}>
                                    <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem", lineHeight: 1.2 }}>
                                      {product.name}
                                    </Typography>
                                    {product.countryFlag && (
                                      <img src={product.countryFlag} alt={product.country} style={{ height: 12, borderRadius: 2 }} />
                                    )}
                                  </Stack>
                                  {product.brand && (
                                    <Typography sx={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 700, mb: 0.3 }}>
                                      By {product.brand}
                                    </Typography>
                                  )}
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <CategoryOutlined sx={{ fontSize: 12, color: "#94A3B8" }} />
                                      <Typography sx={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 700 }}>
                                        {product.category}
                                      </Typography>
                                    </Stack>
                                    {product.sku && (
                                      <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 600, fontFamily: 'monospace' }}>
                                        SKU: {product.sku}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Box>
                            </Stack>
                            </TableCell>

                            {/* PRICE */}
                            <TableCell>
                                <Stack direction="column">
                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>
                                      ${(Number(product.price) || 0).toFixed(2)}
                                    </Typography>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#94A3B8', textDecoration: 'line-through' }}>
                                        ${(Number(product.originalPrice) || 0).toFixed(2)}
                                      </Typography>
                                    )}
                                </Stack>
                            </TableCell>

                            {/* STATUS / STOCK */}
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip 
                                  size="small"
                                  icon={product.visibility ? <VisibilityOutlined style={{ fontSize: '14px' }} /> : <VisibilityOffOutlined style={{ fontSize: '14px' }} />}
                                  label={product.visibility ? "Visible" : "Hidden"}
                                  sx={{ 
                                    bgcolor: product.visibility ? '#EFF6FF' : '#F1F5F9',
                                    color: product.visibility ? '#2563EB' : '#64748B',
                                    fontWeight: 700, fontSize: '0.65rem', px: 0.5
                                  }}
                                />
                                {product.trackQty && (
                                  <Chip 
                                    size="small"
                                    label={product.soldOut || product.quantity <= 0 ? "Out of Stock" : `${product.quantity || 0} in Stock`}
                                    sx={{ 
                                      bgcolor: product.soldOut || product.quantity <= 0 ? '#FEF2F2' : '#ECFDF5',
                                      color: product.soldOut || product.quantity <= 0 ? '#DC2626' : '#059669',
                                      fontWeight: 700, fontSize: '0.65rem'
                                    }}
                                  />
                                )}
                              </Stack>
                            </TableCell>

                            {/* HIGHLIGHTS */}
                            <TableCell>
                                <Stack direction="row" spacing={0.5}>
                                  {product.popularProduct && (
                                    <Tooltip title="Marked as Popular">
                                      <Chip size="small" icon={<StarBorderOutlined style={{ color: '#D97706', fontSize: '14px' }} />} label="Popular" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, fontSize: '0.6rem' }} />
                                    </Tooltip>
                                  )}
                                  {product.todaySpecial && (
                                    <Tooltip title="Today's Special">
                                      <Chip size="small" icon={<LocalOfferOutlined style={{ color: '#059669', fontSize: '14px' }} />} label="Special" sx={{ bgcolor: '#D1FAE5', color: '#059669', fontWeight: 700, fontSize: '0.6rem' }} />
                                    </Tooltip>
                                  )}
                                  {!product.popularProduct && !product.todaySpecial && (
                                    <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Standard</Typography>
                                  )}
                                </Stack>
                            </TableCell>

                            {/* CONTROLS (View, Edit, Delete) */}
                            <TableCell align="right" sx={{ pr: 3 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Tooltip title="View Details">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setViewDialog({ open: true, product }); }} sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
                                      <VisibilityOutlined fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Product">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setProductToEdit(product); }} sx={{ color: ACCENT_AMBER, bgcolor: '#FFFBEB', '&:hover': { bgcolor: '#FEF3C7' } }}>
                                      <EditOutlined fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Product">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: product._id }); }} sx={{ color: "#EF4444", bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}>
                                      <DeleteOutline fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                            </TableCell>
                        </TableRow>
                        ))}
                        {paginatedData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                              <Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>No products found matching your criteria.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                </Table>
                </TableContainer>
            </motion.div>
        </Box>

        {/* BOTTOM CONTROLS */}
        <Paper elevation={0} sx={{ mt: 3, p: 2, borderRadius: "12px", border: "1px solid #E2E8F0", display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Stack direction="row" spacing={3} alignItems="center">
                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: "#64748B" }}>
                    TOTAL PRODUCTS: {filteredData.length}
                </Typography>
                <AnimatePresence>
                    {selected.length > 0 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                            <Button size="small" variant="contained" color="error" onClick={handleBulkDelete} startIcon={<DeleteOutline sx={{ fontSize: '1rem' }} />} sx={{ fontWeight: 700, fontSize: '0.7rem', px: 2, borderRadius: '6px' }}>
                                DELETE SELECTED ({selected.length})
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Stack>
            <Pagination size="medium" count={Math.ceil(filteredData.length / rowsPerPage) || 1} page={page} onChange={(_, v) => setPage(v)} sx={{ "& .Mui-selected": { bgcolor: `${PRIMARY_TEAL} !important`, color: "#FFF", fontWeight: 800 }, "& .MuiPaginationItem-root": { fontWeight: 600, fontSize: '0.8rem' } }} />
        </Paper>

        {/* --- DIALOGS --- */}

        {/* 1. View Comprehensive Product Details Dialog */}
        <Dialog 
          open={viewDialog.open} 
          onClose={() => setViewDialog({ open: false, product: null })}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: "16px", p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC' } }}
        >
          {viewDialog.product && (
            <Box>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography sx={{ fontWeight: 900, color: PRIMARY_TEAL, fontSize: '1.4rem' }}>
                  Product Overview
                </Typography>
                <IconButton onClick={() => setViewDialog({ open: false, product: null })} sx={{ color: '#94A3B8', bgcolor: '#FFF', border: '1px solid #E2E8F0', '&:hover':{ bgcolor: '#F1F5F9' } }}><CloseOutlined /></IconButton>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                
                {/* Left Column (Image & Meta) */}
                <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
                  <Box sx={{ width: '100%', height: '280px', bgcolor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {viewDialog.product.images?.length > 0 ? (
                      <img src={viewDialog.product.images[0]} alt={viewDialog.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Inventory2Outlined sx={{ fontSize: 60, color: '#CBD5E1' }} />
                    )}
                  </Box>
                  
                  {/* Meta Information Container */}
                  <Stack mt={3} spacing={1.5} p={2.5} bgcolor="#FFF" borderRadius="12px" border="1px solid #E2E8F0">
                    <Box>
                      <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800 }}>PRODUCT ID</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace', fontWeight: 600 }}>{viewDialog.product._id}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800 }}>ADDED ON</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                        {viewDialog.product.createdAt ? new Date(viewDialog.product.createdAt).toLocaleString() : 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800 }}>LAST UPDATED</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                        {viewDialog.product.updatedAt ? new Date(viewDialog.product.updatedAt).toLocaleString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                
                {/* Right Column (Details) */}
                <Stack flex={1} spacing={3}>
                  
                  {/* Title & Brand Info */}
                  <Box>
                    <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E293B', lineHeight: 1.2 }}>{viewDialog.product.name}</Typography>
                    {viewDialog.product.brand && (
                      <Typography sx={{ fontSize: '0.9rem', color: PRIMARY_TEAL, fontWeight: 700, mt: 0.5 }}>By {viewDialog.product.brand}</Typography>
                    )}
                  </Box>
                  
                  {/* ROW 1: Pricing & Category */}
                  <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Stack direction="row" flexWrap="wrap" gap={4}>
                      <Box sx={{ flex: '1 1 auto', minWidth: '100px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>CURRENT PRICE</Typography>
                        <Typography sx={{ fontSize: '1.3rem', color: PRIMARY_TEAL, fontWeight: 800 }}>${(Number(viewDialog.product.price) || 0).toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 auto', minWidth: '100px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>CATEGORY</Typography>
                        <Typography sx={{ fontSize: '0.95rem', color: '#334155', fontWeight: 700 }}>{viewDialog.product.category || 'N/A'}</Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 auto', minWidth: '100px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>SKU</Typography>
                        <Typography sx={{ fontSize: '0.95rem', color: '#334155', fontWeight: 700, fontFamily: 'monospace' }}>{viewDialog.product.sku || 'N/A'}</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* ROW 2: Origin & Delivery */}
                  <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#F1F5F9' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PublicOutlined sx={{ fontSize: 16 }}/> ORIGIN & AVAILABILITY
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={4}>
                      <Box sx={{ flex: '1 1 auto', minWidth: '100px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>ORIGIN</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {viewDialog.product.countryFlag && <img src={viewDialog.product.countryFlag} alt="flag" style={{ width: 18, borderRadius: 2 }} />}
                          <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>{viewDialog.product.originType || 'Local'} {viewDialog.product.country && `(${viewDialog.product.country})`}</Typography>
                        </Stack>
                      </Box>
                      <Box sx={{ flex: '1 1 auto', minWidth: '100px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>AVAILABILITY</Typography>
                        <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>{viewDialog.product.availability || 'On Hand'}</Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 auto', minWidth: '100px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>EST. DELIVERY</Typography>
                        <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocalShippingOutlined sx={{ fontSize: 16, color: PRIMARY_TEAL }} />
                          {viewDialog.product.deliveryTime || '1-3 Days'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                  
                  {/* ROW 3: Specifications */}
                  <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ListAltOutlined sx={{ fontSize: 16 }}/> SPECIFICATIONS
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={3} useFlexGap>
                      <Box sx={{ width: '120px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>TYPE</Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>{viewDialog.product.productType || '--'}</Typography>
                      </Box>
                      <Box sx={{ width: '120px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>FORM</Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>{viewDialog.product.itemForm || '--'}</Typography>
                      </Box>
                      <Box sx={{ width: '120px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>PACKAGING</Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>{viewDialog.product.packagingType || '--'}</Typography>
                      </Box>
                      <Box sx={{ width: '120px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>UNIT / WEIGHT</Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>{viewDialog.product.weight || '--'} {viewDialog.product.unit || ''}</Typography>
                      </Box>
                      <Box sx={{ width: '120px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>FRAGRANCE</Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>{viewDialog.product.fragrance || '--'}</Typography>
                      </Box>
                      <Box sx={{ width: '150px' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>MATERIAL FREE</Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>{viewDialog.product.materialTypeFree || '--'}</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Stock & Tags Row */}
                  <Stack direction="row" flexWrap="wrap" gap={3}>
                    <Box sx={{ flex: '1 1 auto', minWidth: '100px' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 0.3 }}>STOCK LEVEL</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: viewDialog.product.quantity > 0 && !viewDialog.product.soldOut ? '#059669' : '#DC2626', fontWeight: 800 }}>
                        {viewDialog.product.quantity || 0} Units {viewDialog.product.soldOut && '(Sold Out)'}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 auto', minWidth: '150px' }}>
                       <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 1 }}>STATUS & FLAGS</Typography>
                       <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip size="small" label={viewDialog.product.visibility ? "Visible" : "Hidden"} sx={{ bgcolor: viewDialog.product.visibility ? '#EFF6FF' : '#F1F5F9', color: viewDialog.product.visibility ? '#2563EB' : '#64748B', fontWeight: 700, mb: 1 }} />
                          {viewDialog.product.todaySpecial && <Chip size="small" label="Today's Special" sx={{ bgcolor: '#D1FAE5', color: '#059669', fontWeight: 700, mb: 1 }} />}
                          {viewDialog.product.popularProduct && <Chip size="small" label="Popular Product" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, mb: 1 }} />}
                          
                          {/* Safe Tags Rendering */}
                          {Array.isArray(viewDialog.product.tags) 
                            ? viewDialog.product.tags.map((tag: string, idx: number) => (
                                <Chip key={idx} size="small" label={tag.trim()} sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, mb: 1 }} />
                              ))
                            : typeof viewDialog.product.tags === 'string' && viewDialog.product.tags.trim() !== ''
                              ? viewDialog.product.tags.split(',').map((tag: string, idx: number) => (
                                  <Chip key={idx} size="small" label={tag.trim()} sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, mb: 1 }} />
                                ))
                              : null
                          }
                       </Stack>
                    </Box>
                  </Stack>
                  
                  {/* Descriptions */}
                  {(viewDialog.product.description || viewDialog.product.keyFeatures) && (
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 1 }}>DESCRIPTION & FEATURES</Typography>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', maxHeight: '200px', overflowY: 'auto' }}>
                        {viewDialog.product.description && (
                          <Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, mb: viewDialog.product.keyFeatures ? 2 : 0 }}>
                            {viewDialog.product.description}
                          </Typography>
                        )}
                        {viewDialog.product.keyFeatures && (
                          <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: PRIMARY_TEAL, mb: 0.5 }}>KEY FEATURES</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#475569', whiteSpace: 'pre-line' }}>{viewDialog.product.keyFeatures}</Typography>
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  )}

                  {/* Variants List Section */}
                  {viewDialog.product.variants && viewDialog.product.variants.length > 0 && (
                    <Box mt={2}>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 1 }}>PRODUCT VARIANTS ({viewDialog.product.variants.length})</Typography>
                      <Stack spacing={1.5}>
                        {viewDialog.product.variants.map((variant, index) => (
                          <Paper key={index} elevation={0} sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#FFF' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: PRIMARY_TEAL }}>{variant.name || `Variant ${index + 1}`}</Typography>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E293B' }}>${(Number(variant.price) || 0).toFixed(2)}</Typography>
                            </Stack>
                            <Stack direction="row" flexWrap="wrap" gap={2} mb={variant.images && variant.images.length > 0 ? 1.5 : 0}>
                              <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}><strong>SKU:</strong> {variant.sku || 'N/A'}</Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}><strong>Weight:</strong> {variant.weight ? `${variant.weight} kg` : 'N/A'}</Typography>
                              {variant.originalPrice && (
                                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}><strong>Orig:</strong> ${(Number(variant.originalPrice) || 0).toFixed(2)}</Typography>
                              )}
                            </Stack>

                            {/* Variant Images Rendering */}
                            {variant.images && variant.images.length > 0 && (
                              <Stack direction="row" spacing={1} overflow="auto" sx={{ pt: 0.5 }}>
                                {variant.images.map((img, imgIndex) => (
                                  <Box key={imgIndex} sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: '6px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                    <img src={img} alt={`Variant ${index + 1} Image ${imgIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </Box>
                                ))}
                              </Stack>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}
                  
                </Stack>
              </Stack>
            </Box>
          )}
        </Dialog>

        {/* 2. Delete Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "16px", p: 1, maxWidth: '380px' } }}>
          <Box textAlign="center" p={3}>
            <Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 36 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: "#1E293B", fontSize: '1.1rem', mb: 1 }}>Confirm Deletion</Typography>
            <Typography sx={{ color: "#64748B", mb: 4, fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.5 }}>
              You are about to permanently delete this product from your inventory. This action cannot be undone.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button size="large" onClick={() => setDeleteDialog({ open: false, id: null })} fullWidth variant="outlined" sx={{ fontWeight: 700, color: "#64748B", borderColor: '#CBD5E1', fontSize: '0.8rem' }}>Cancel</Button>
              <Button size="large" onClick={handleDelete} fullWidth variant="contained" sx={{ bgcolor: "#EF4444", fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(239,68,68,0.2)', "&:hover": { bgcolor: '#DC2626' } }}>Delete Product</Button>
            </Stack>
          </Box>
        </Dialog>

        {/* Notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "8px", fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default AllProducts;