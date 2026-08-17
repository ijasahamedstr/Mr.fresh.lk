import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Box, Typography, Stack, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Avatar, 
  Button, TextField, Pagination, Dialog, Tooltip,
  Snackbar, Alert, LinearProgress, Checkbox, Breadcrumbs, Link, 
  ThemeProvider, createTheme, Chip, Divider, MenuItem, Select
} from "@mui/material";
import { 
  DeleteOutline, SearchOutlined, WarningAmberRounded,
  FileDownloadOutlined, NavigateNext, ReceiptLongOutlined,
  VisibilityOutlined, CloseOutlined, LocalShippingOutlined,
  PersonOutlineOutlined, PlaceOutlined
} from "@mui/icons-material";

// --- CONFIGURATION & CONSTANTS ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CACHE_KEY = "ORDERS_MANAGEMENT_CACHE";
const PRIMARY_TEAL = "#004652";

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
export interface OrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  customer: { name?: string; email?: string; phone?: string; [key: string]: any };
  items: OrderItem[];
  delivery: { method?: string; cost?: number; [key: string]: any };
  address: {
    street?: string;
    unit?: string;
    city?: string;
    postal?: string;
    country?: string;
  };
  mapLocation?: { lat: number; lng: number };
  totals: { subtotal?: number; tax?: number; total: number; [key: string]: any };
  status: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return { bg: '#FEF3C7', color: '#D97706' };
    case 'processing': return { bg: '#DBEAFE', color: '#2563EB' };
    case 'shipped': return { bg: '#F3E8FF', color: '#9333EA' };
    case 'delivered': return { bg: '#D1FAE5', color: '#059669' };
    case 'cancelled': return { bg: '#FEE2E2', color: '#DC2626' };
    default: return { bg: '#F1F5F9', color: '#64748B' };
  }
};

const AllOrders = () => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle");
  
  // Dialog States
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });

  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const rowsPerPage = 8; 

  // --- DATA FETCHING ---
  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setSyncStatus("syncing");
    try {
      const response = await fetch(`${API_BASE_URL}/Productsoder`);
      if (!response.ok) throw new Error("Connection Interrupted");
      const data = await response.json();
      
      setOrders(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setSyncStatus("idle");
      if (isManual) triggerSnackbar("Orders synchronized", "success");
    } catch (error) {
      setSyncStatus("error");
      triggerSnackbar("Offline Mode: Using cached data", "error");
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 300000); // 5 min sync
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const triggerSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // --- CORE ACTIONS ---
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Optimistic Update
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    
    if (viewDialog.order && viewDialog.order._id === orderId) {
      setViewDialog({ open: true, order: { ...viewDialog.order, status: newStatus }});
    }

    try {
      await fetch(`${API_BASE_URL}/Productsoder/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      triggerSnackbar(`Order status updated to ${newStatus}`, "success");
    } catch {
      fetchOrders(); // Revert on failure
      triggerSnackbar("Failed to update status", "error");
    }
  };

  const handleDelete = async () => {
    const targetId = deleteDialog.id;
    if (!targetId) return;

    // Optimistic UI Update
    const updated = orders.filter(o => o._id !== targetId);
    setOrders(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setDeleteDialog({ open: false, id: null });
    setSelected(prev => prev.filter(id => id !== targetId));

    try {
      const res = await fetch(`${API_BASE_URL}/Productsoder/${targetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      triggerSnackbar("Order successfully deleted", "success");
    } catch {
      fetchOrders();
      triggerSnackbar("Deletion failed on server. Restoring order.", "error");
    }
  };

  // --- SELECTION & EXPORT ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? paginatedData.map(n => n._id) : []);
  };

  const handleSelectOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const exportToCSV = () => {
    const headers = ["OrderID,CustomerName,Total,Status,Date\n"];
    const rows = orders.map(o => 
      `${o._id},"${o.customer?.name || 'Guest'}",${o.totals?.total || 0},${o.status},${new Date(o.createdAt).toISOString()}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().getTime()}.csv`;
    a.click();
  };

  // --- FILTER & PAGINATION ---
  const filteredData = useMemo(() => {
    return orders.filter((o) => {
      const searchLower = searchQuery.toLowerCase();
      const customerName = o.customer?.name || "";
      return (
        o._id.toLowerCase().includes(searchLower) || 
        customerName.toLowerCase().includes(searchLower) ||
        o.status.toLowerCase().includes(searchLower)
      );
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // --- MAIN TABLE VIEW ---
  return (
    <ThemeProvider theme={montserratTheme}>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1.5, md: 3 } }}>
        
        {/* HEADER */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} mb={3} spacing={2}>
          <Box>
            <Breadcrumbs separator={<NavigateNext sx={{ fontSize: '0.8rem' }} />} sx={{ mb: 0.5 }}>
              <Link underline="hover" color="inherit" href="/" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>DASHBOARD</Link>
              <Typography color="text.primary" sx={{ fontSize: '0.65rem', fontWeight: 800, color: PRIMARY_TEAL }}>ALL ORDERS</Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, letterSpacing: "-0.5px", fontSize: '1.4rem' }}>
              Order Management
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: syncStatus === 'idle' ? '#10B981' : '#F59E0B', animation: syncStatus === 'syncing' ? 'pulse 1.5s infinite' : 'none' }} />
               <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: "#64748B", letterSpacing: 0.5 }}>
                 {syncStatus === 'syncing' ? 'SYNCING ORDERS...' : 'ORDERS UP TO DATE'}
               </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
             <Tooltip title="Export Orders">
               <IconButton size="medium" onClick={exportToCSV} sx={{ bgcolor: "#FFF", border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                 <FileDownloadOutlined fontSize="small" />
               </IconButton>
             </Tooltip>
          </Stack>
        </Stack>

        {/* SEARCH BAR */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ width: '100%' }}>
            <Paper elevation={0} sx={{ p: 1, px: 2, borderRadius: "8px", border: "1px solid #E2E8F0", display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth size="small" variant="standard"
                placeholder="Search orders by ID, Customer Name, or Status..."
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
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>ORDER ID & DATE</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>CUSTOMER</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>TOTAL</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>STATUS</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", pr: 4, letterSpacing: 0.5 }}>ACTIONS</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((order) => {
                          const statusStyle = getStatusColor(order.status || 'pending');
                          
                          return (
                          <TableRow key={order._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell padding="checkbox">
                                <Checkbox size="small" checked={selected.includes(order._id)} onChange={() => handleSelectOne(order._id)} />
                              </TableCell>
                              
                              {/* ORDER INFO */}
                              <TableCell>
                              <Stack direction="row" spacing={2} alignItems="center">
                                  <Avatar variant="rounded" sx={{ width: 42, height: 42, bgcolor: "#F1F5F9", border: '1px solid #E2E8F0', color: PRIMARY_TEAL }}>
                                    <ReceiptLongOutlined fontSize="small" />
                                  </Avatar>
                                  <Box>
                                    <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem", fontFamily: 'monospace', mb: 0.5 }}>
                                      #{order._id.slice(-8).toUpperCase()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 700 }}>
                                      {new Date(order.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                              </Stack>
                              </TableCell>

                              {/* CUSTOMER */}
                              <TableCell>
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>
                                  {order.customer?.name || 'Guest User'}
                                </Typography>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#94A3B8' }}>
                                  {order.items?.length || 0} items
                                </Typography>
                              </TableCell>

                              {/* TOTAL PRICE */}
                              <TableCell>
                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: PRIMARY_TEAL }}>
                                  ${Number(order.totals?.total || 0).toFixed(2)}
                                </Typography>
                              </TableCell>

                              {/* STATUS */}
                              <TableCell>
                                <Chip 
                                  size="small"
                                  label={(order.status || 'Pending').toUpperCase()}
                                  sx={{ 
                                    bgcolor: statusStyle.bg, color: statusStyle.color,
                                    fontWeight: 800, fontSize: '0.65rem', px: 1
                                  }}
                                />
                              </TableCell>

                              {/* CONTROLS (View, Delete) */}
                              <TableCell align="right" sx={{ pr: 3 }}>
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Tooltip title="View Order Details">
                                      <IconButton size="small" onClick={() => setViewDialog({ open: true, order })} sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
                                        <VisibilityOutlined fontSize="small" />
                                      </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Order">
                                      <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: order._id })} sx={{ color: "#EF4444", bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}>
                                        <DeleteOutline fontSize="small" />
                                      </IconButton>
                                  </Tooltip>
                              </Stack>
                              </TableCell>
                          </TableRow>
                        )})}
                        {paginatedData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                              <Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>No orders found in the database.</Typography>
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
                    TOTAL ORDERS: {filteredData.length}
                </Typography>
            </Stack>
            <Pagination size="medium" count={Math.ceil(filteredData.length / rowsPerPage) || 1} page={page} onChange={(_, v) => setPage(v)} sx={{ "& .Mui-selected": { bgcolor: `${PRIMARY_TEAL} !important`, color: "#FFF", fontWeight: 800 }, "& .MuiPaginationItem-root": { fontWeight: 600, fontSize: '0.8rem' } }} />
        </Paper>

        {/* --- DIALOGS --- */}

        {/* 1. View Comprehensive Order Details Dialog */}
        <Dialog 
          open={viewDialog.open} 
          onClose={() => setViewDialog({ open: false, order: null })}
          PaperProps={{ sx: { borderRadius: "16px", p: 3, maxWidth: '900px', width: '100%' } }}
        >
          {viewDialog.order && (
            <Box>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography sx={{ fontWeight: 900, color: PRIMARY_TEAL, fontSize: '1.4rem' }}>
                    Order #{viewDialog.order._id.slice(-8).toUpperCase()}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                    Placed on {new Date(viewDialog.order.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <IconButton onClick={() => setViewDialog({ open: false, order: null })} sx={{ color: '#94A3B8' }}><CloseOutlined /></IconButton>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                
                {/* Left Column (Customer & Delivery) */}
                <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0 }}>
                  
                  {/* Status Update Card */}
                  <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 3 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, mb: 1 }}>ORDER STATUS</Typography>
                    <Select
                      size="small"
                      fullWidth
                      value={viewDialog.order.status || 'pending'}
                      onChange={(e) => handleStatusChange(viewDialog.order!._id, e.target.value)}
                      sx={{ fontWeight: 700, fontSize: '0.85rem', bgcolor: '#FFF' }}
                    >
                      <MenuItem value="pending" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Pending</MenuItem>
                      <MenuItem value="processing" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Processing</MenuItem>
                      <MenuItem value="shipped" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Shipped</MenuItem>
                      <MenuItem value="delivered" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Delivered</MenuItem>
                      <MenuItem value="cancelled" sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#DC2626' }}>Cancelled</MenuItem>
                    </Select>
                  </Paper>

                  {/* Customer Info */}
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E2E8F0', mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                      <PersonOutlineOutlined sx={{ color: PRIMARY_TEAL }} />
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: PRIMARY_TEAL }}>Customer Details</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                      {viewDialog.order.customer?.name || 'N/A'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#475569', mb: 0.5 }}>{viewDialog.order.customer?.email || 'No email provided'}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>{viewDialog.order.customer?.phone || 'No phone provided'}</Typography>
                  </Paper>

                  {/* Shipping Address */}
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                      <PlaceOutlined sx={{ color: PRIMARY_TEAL }} />
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: PRIMARY_TEAL }}>Shipping Address</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                      {viewDialog.order.address?.street} {viewDialog.order.address?.unit && `Apt ${viewDialog.order.address.unit}`}<br/>
                      {viewDialog.order.address?.city}, {viewDialog.order.address?.postal}<br/>
                      {viewDialog.order.address?.country}
                    </Typography>
                    {viewDialog.order.delivery?.method && (
                      <Chip 
                        icon={<LocalShippingOutlined style={{ fontSize: '14px' }} />} 
                        label={viewDialog.order.delivery.method} 
                        size="small" 
                        sx={{ mt: 2, bgcolor: '#F1F5F9', fontWeight: 700, fontSize: '0.7rem' }} 
                      />
                    )}
                  </Paper>

                </Box>
                
                {/* Right Column (Items & Totals) */}
                <Stack flex={1} spacing={3}>
                  
                  {/* Order Items Table */}
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: PRIMARY_TEAL, mb: 1.5 }}>Order Items ({viewDialog.order.items?.length || 0})</Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748B' }}>ITEM</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748B' }}>QTY</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748B' }}>PRICE</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748B' }}>TOTAL</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewDialog.order.items?.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B' }}>{item.name}</TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#475569' }}>x{item.quantity}</TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#475569' }}>${Number(item.price).toFixed(2)}</TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
                                ${Number(item.price * item.quantity).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  
                  {/* Totals Summary */}
                  <Box sx={{ alignSelf: 'flex-end', width: '100%', maxWidth: '300px' }}>
                    <Stack spacing={1.5} p={2} bgcolor="#F8FAFC" borderRadius="8px" border="1px dashed #CBD5E1">
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Subtotal</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: 700 }}>${Number(viewDialog.order.totals?.subtotal || 0).toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Delivery</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: 700 }}>${Number(viewDialog.order.delivery?.cost || 0).toFixed(2)}</Typography>
                      </Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: '0.95rem', color: PRIMARY_TEAL, fontWeight: 900 }}>Total Amount</Typography>
                        <Typography sx={{ fontSize: '1.1rem', color: PRIMARY_TEAL, fontWeight: 900 }}>${Number(viewDialog.order.totals?.total || 0).toFixed(2)}</Typography>
                      </Stack>
                    </Stack>
                  </Box>

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
            <Typography sx={{ fontWeight: 800, color: "#1E293B", fontSize: '1.1rem', mb: 1 }}>Delete Order</Typography>
            <Typography sx={{ color: "#64748B", mb: 4, fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this order? This action removes the record permanently.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button size="large" onClick={() => setDeleteDialog({ open: false, id: null })} fullWidth variant="outlined" sx={{ fontWeight: 700, color: "#64748B", borderColor: '#CBD5E1', fontSize: '0.8rem' }}>Cancel</Button>
              <Button size="large" onClick={handleDelete} fullWidth variant="contained" sx={{ bgcolor: "#EF4444", fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(239,68,68,0.2)', "&:hover": { bgcolor: '#DC2626' } }}>Delete</Button>
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

export default AllOrders;