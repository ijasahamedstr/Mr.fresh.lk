import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, Typography, Stack, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Avatar, 
  Button, TextField, Pagination, Dialog, Tooltip,
  Snackbar, Alert, LinearProgress, Checkbox, Breadcrumbs, Link, 
  ThemeProvider, createTheme, Chip, CircularProgress
} from "@mui/material";
import { 
  DeleteOutline, SearchOutlined, WarningAmberRounded,
  FileDownloadOutlined, NavigateNext, PersonAddAlt1Outlined,
  AdminPanelSettingsOutlined, EmailOutlined, EditOutlined,
  SecurityOutlined, GppGoodOutlined, ShieldOutlined,
  QrCode2, ShieldMoonOutlined
} from "@mui/icons-material";

// Import your sub-pages
import NewAccountCreate from "./New Account Create.tsx";
import EditAdmin from "./EditAdmin";

// --- CONFIGURATION & CONSTANTS ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CACHE_KEY = "ADMIN_ACCOUNTS_VAULT";
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

export interface AdminAccount {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  twoFAEnabled?: boolean; // Unified 2FA flag
  createdAt: string;
  updatedAt: string;
}

const AdminAccountsView = () => {
  const [admins, setAdmins] = useState<AdminAccount[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle");
  
  // Page Navigation States
  const [showAddForm, setShowAddForm] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState<AdminAccount | null>(null);
  
  // Dialog States
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  
  // Advanced 2FA Modal State
  const [twoFASetup, setTwoFASetup] = useState<{
    open: boolean;
    adminId: string | null;
    isEnabling: boolean;
    qrCode: string;
    token: string;
    loading: boolean;
  }>({ open: false, adminId: null, isEnabling: true, qrCode: "", token: "", loading: false });

  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const rowsPerPage = 8; 

  // --- DATA FETCHING ---
  const fetchAdmins = useCallback(async (isManual = false) => {
    if (isManual) setSyncStatus("syncing");
    try {
      const response = await fetch(`${API_BASE_URL}/api/all`);
      if (!response.ok) throw new Error("Connection Interrupted");
      const data = await response.json();
      
      setAdmins(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setSyncStatus("idle");
      if (isManual) triggerSnackbar("Database synchronization complete", "success");
    } catch (error) {
      setSyncStatus("error");
      triggerSnackbar("Offline Mode: Using cached data", "error");
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    const interval = setInterval(() => fetchAdmins(), 300000);
    return () => clearInterval(interval);
  }, [fetchAdmins]);

  const triggerSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // --- CORE ACTIONS ---
  const handleDelete = async () => {
    const targetId = deleteDialog.id;
    if (!targetId) return;

    const updated = admins.filter(a => a._id !== targetId);
    setAdmins(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setDeleteDialog({ open: false, id: null });
    setSelected(prev => prev.filter(id => id !== targetId));

    try {
      const res = await fetch(`${API_BASE_URL}/api/delete/${targetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      triggerSnackbar("Admin account successfully purged", "success");
    } catch {
      fetchAdmins();
      triggerSnackbar("Deletion failed on server. Restoring.", "error");
    }
  };

  const handleBulkDelete = async () => {
    const updated = admins.filter(a => !selected.includes(a._id));
    setAdmins(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setSelected([]);
    triggerSnackbar(`Purging selected admin accounts...`, "success");
    fetchAdmins(); 
  };

  // --- 2FA AUTHENTICATION LOGIC ---
  const openTwoFADialog = (admin: AdminAccount) => {
    setTwoFASetup({
      open: true,
      adminId: admin._id,
      isEnabling: !admin.twoFAEnabled,
      qrCode: "",
      token: "",
      loading: false
    });
  };

  const handleInit2FA = async () => {
    setTwoFASetup(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/setup-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: twoFASetup.adminId })
      });
      const data = await res.json();
      if (res.ok && data.qrCode) {
        setTwoFASetup(prev => ({ ...prev, qrCode: data.qrCode, loading: false }));
      } else {
        throw new Error();
      }
    } catch (err) {
      setTwoFASetup(prev => ({ ...prev, loading: false }));
      triggerSnackbar("Failed to initialize security handshake.", "error");
    }
  };

  const handleVerify2FA = async () => {
    setTwoFASetup(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: twoFASetup.adminId, token: twoFASetup.token })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Optimistic Update
        const updated = admins.map(a => a._id === twoFASetup.adminId ? { ...a, twoFAEnabled: true } : a);
        setAdmins(updated);
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        
        triggerSnackbar("Security Token Validated! 2FA Active.", "success");
        setTwoFASetup({ open: false, adminId: null, isEnabling: true, qrCode: "", token: "", loading: false });
      } else {
        throw new Error();
      }
    } catch (err) {
      setTwoFASetup(prev => ({ ...prev, loading: false }));
      triggerSnackbar("Invalid token. Please try again.", "error");
    }
  };

  const handleDisable2FA = async () => {
    setTwoFASetup(prev => ({ ...prev, loading: true }));
    try {
      // Direct update to disable 2FA in the database
      const res = await fetch(`${API_BASE_URL}/api/${twoFASetup.adminId}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFAEnabled: false })
      });
      
      if (!res.ok) throw new Error();
      
      // Optimistic Update
      const updated = admins.map(a => a._id === twoFASetup.adminId ? { ...a, twoFAEnabled: false } : a);
      setAdmins(updated);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      
      triggerSnackbar("Two-Step Verification securely disabled.", "success");
      setTwoFASetup({ open: false, adminId: null, isEnabling: true, qrCode: "", token: "", loading: false });
    } catch {
      setTwoFASetup(prev => ({ ...prev, loading: false }));
      triggerSnackbar("Failed to update security settings on server.", "error");
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
    const headers = ["ID,Name,Email,TwoFactor,ProfileImage,JoinedDate\n"];
    const rows = admins.map(a => 
      `${a._id},"${a.name}","${a.email}",${a.twoFAEnabled ? 'Enabled' : 'Disabled'},${a.profileImage || 'None'},${new Date(a.createdAt).toISOString()}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin_directory_${new Date().getTime()}.csv`;
    a.click();
  };

  const filteredData = useMemo(() => {
    return admins.filter((a) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(searchLower) || 
        a.email.toLowerCase().includes(searchLower) ||
        a._id.toLowerCase().includes(searchLower)
      );
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [admins, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // --- ROUTING VIEWS ---
  if (showAddForm) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <NewAccountCreate onBack={() => { setShowAddForm(false); fetchAdmins(); }} />
      </ThemeProvider>
    );
  }

  if (adminToEdit) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <EditAdmin 
          adminData={adminToEdit} 
          onBack={() => { setAdminToEdit(null); fetchAdmins(); }} 
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
              <Typography color="text.primary" sx={{ fontSize: '0.65rem', fontWeight: 800, color: PRIMARY_TEAL }}>ADMIN DIRECTORY</Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, letterSpacing: "-0.5px", fontSize: '1.4rem' }}>
              Identity & Access Console
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: syncStatus === 'idle' ? '#10B981' : '#F59E0B', animation: syncStatus === 'syncing' ? 'pulse 1.5s infinite' : 'none' }} />
               <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: "#64748B", letterSpacing: 0.5 }}>
                 {syncStatus === 'syncing' ? 'SYNCING DIRECTORY...' : 'SYSTEM SECURE & ONLINE'}
               </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
             <Tooltip title="Export Directory">
               <IconButton size="medium" onClick={exportToCSV} sx={{ bgcolor: "#FFF", border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                 <FileDownloadOutlined fontSize="small" />
               </IconButton>
             </Tooltip>
             <Button 
              size="medium" variant="contained" onClick={() => setShowAddForm(true)}
              startIcon={<PersonAddAlt1Outlined fontSize="small" />}
              sx={{ bgcolor: PRIMARY_TEAL, borderRadius: "8px", px: 3, py: 1, fontSize: '0.8rem', fontWeight: 700, boxShadow: "0 4px 12px rgba(0,70,82,0.15)", "&:hover": { bgcolor: "#002d35" } }}
            >
              Provision New Admin
            </Button>
          </Stack>
        </Stack>

        {/* SEARCH BAR */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ width: '100%' }}>
            <Paper elevation={0} sx={{ p: 1, px: 2, borderRadius: "8px", border: "1px solid #E2E8F0", display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth size="small" variant="standard"
                placeholder="Search administrators by credentials or ID..."
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
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>ADMINISTRATOR</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>CONTACT INFO</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>SECURITY (2FA)</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>DATE PROVISIONED</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", pr: 4, letterSpacing: 0.5 }}>CONTROLS</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((admin) => (
                        <TableRow key={admin._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell padding="checkbox">
                            <Checkbox size="small" checked={selected.includes(admin._id)} onChange={() => handleSelectOne(admin._id)} />
                            </TableCell>
                            
                            <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={admin.profileImage || undefined} sx={{ width: 40, height: 40, bgcolor: PRIMARY_TEAL, border: '2px solid #E2E8F0' }}>
                                  {!admin.profileImage && admin.name.substring(0,2).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem", lineHeight: 1.2 }}>
                                    {admin.name}
                                  </Typography>
                                  <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                                    <AdminPanelSettingsOutlined sx={{ fontSize: 12, color: "#94A3B8" }} />
                                    <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 600, fontFamily: 'monospace' }}>
                                      UID: {admin._id.substring(0, 8)}
                                    </Typography>
                                  </Stack>
                                </Box>
                            </Stack>
                            </TableCell>

                            <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <EmailOutlined sx={{ fontSize: 16, color: '#94A3B8' }} />
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                                      {admin.email}
                                    </Typography>
                                </Stack>
                            </TableCell>

                            <TableCell>
                                <Chip 
                                  size="small"
                                  icon={admin.twoFAEnabled ? <GppGoodOutlined style={{ color: '#059669', fontSize: '14px' }} /> : <ShieldOutlined style={{ color: '#94A3B8', fontSize: '14px' }} />}
                                  label={admin.twoFAEnabled ? "Secured" : "Unsecured"}
                                  sx={{ 
                                    bgcolor: admin.twoFAEnabled ? '#ECFDF5' : '#F1F5F9',
                                    color: admin.twoFAEnabled ? '#059669' : '#64748B',
                                    fontWeight: 700, fontSize: '0.7rem', px: 0.5
                                  }}
                                />
                            </TableCell>

                            <TableCell>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                                  {new Date(admin.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </Typography>
                            </TableCell>

                            <TableCell align="right" sx={{ pr: 3 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Tooltip title={admin.twoFAEnabled ? "Manage Security" : "Enable Security"}>
                                    <IconButton size="small" onClick={() => openTwoFADialog(admin)} sx={{ color: "#3B82F6", bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
                                      <SecurityOutlined fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Profile">
                                    <IconButton size="small" onClick={() => setAdminToEdit(admin)} sx={{ color: ACCENT_AMBER, bgcolor: '#FFFBEB', '&:hover': { bgcolor: '#FEF3C7' } }}>
                                      <EditOutlined fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Revoke Access (Delete)">
                                    <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: admin._id })} sx={{ color: "#EF4444", bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}>
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
                              <Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>No administrative accounts found.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                </Table>
                </TableContainer>
            </motion.div>
        </Box>

        <Paper elevation={0} sx={{ mt: 3, p: 2, borderRadius: "12px", border: "1px solid #E2E8F0", display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Stack direction="row" spacing={3} alignItems="center">
                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: "#64748B" }}>
                    TOTAL ACCOUNTS: {filteredData.length}
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

        {/* 2FA SETUP / DISABLE DIALOG */}
        <Dialog 
          open={twoFASetup.open} 
          onClose={() => setTwoFASetup(p => ({...p, open: false}))} 
          PaperProps={{ sx: { borderRadius: "20px", p: 1, maxWidth: '420px', width: '100%' } }}
        >
          <Box p={3}>
            <Stack alignItems="center" textAlign="center">
              {/* Top Icon */}
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: twoFASetup.isEnabling ? '#EFF6FF' : '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {twoFASetup.isEnabling ? <ShieldMoonOutlined sx={{ color: "#3B82F6", fontSize: 32 }} /> : <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 32 }} />}
              </Box>
              
              <Typography sx={{ fontWeight: 800, color: "#1E293B", fontSize: '1.2rem', mb: 1 }}>
                {twoFASetup.isEnabling ? "Two-Step Verification" : "Disable Protection"}
              </Typography>
              <Typography sx={{ color: "#64748B", mb: 3, fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.5 }}>
                {twoFASetup.isEnabling 
                  ? "Add a defensive layer to this account. Scan the QR code to begin." 
                  : "Are you sure you want to disable Two-Step Verification? This reduces account security."}
              </Typography>
            </Stack>

            {/* IF ENABLING (QR CODE SCANNER UI) */}
            {twoFASetup.isEnabling && (
              <Box sx={{ p: 2.5, borderRadius: "16px", background: "linear-gradient(135deg, #004652 0%, #006D77 100%)", color: "#FFF", mb: 3 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box sx={{ bgcolor: "#FFF", p: 1, borderRadius: "12px", minWidth: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {twoFASetup.qrCode ? (
                      <motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} src={twoFASetup.qrCode} style={{ width: 80 }} />
                    ) : (
                      <QrCode2 sx={{ fontSize: 40, color: "#94A3B8" }} />
                    )}
                  </Box>
                  <Box>
                    {!twoFASetup.qrCode ? (
                      <Button 
                        variant="contained" fullWidth 
                        onClick={handleInit2FA} disabled={twoFASetup.loading}
                        sx={{ bgcolor: "#FFF", color: "#000", fontWeight: 800, "&:hover": { bgcolor: "#E2E8F0" } }}
                      >
                        {twoFASetup.loading ? <CircularProgress size={20} color="inherit" /> : "Generate QR"}
                      </Button>
                    ) : (
                      <Stack spacing={1.5}>
                        <TextField 
                          placeholder="6-Digit Token" size="small" 
                          value={twoFASetup.token} 
                          onChange={(e) => setTwoFASetup(p => ({ ...p, token: e.target.value }))}
                          InputProps={{ sx: { bgcolor: "#FFF", borderRadius: "8px", fontWeight: 800, fontSize: '0.8rem', textAlign: 'center' } }} 
                        />
                        <Button 
                          onClick={handleVerify2FA} disabled={twoFASetup.loading || twoFASetup.token.length < 6} 
                          variant="contained" sx={{ bgcolor: "#10B981", fontWeight: 800, "&:hover": { bgcolor: "#059669" } }}
                        >
                          {twoFASetup.loading ? <CircularProgress size={20} color="inherit" /> : "Verify Token"}
                        </Button>
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Box>
            )}

            {/* BOTTOM ACTION BUTTONS */}
            <Stack direction="row" spacing={2}>
              <Button 
                size="large" fullWidth variant="outlined" 
                onClick={() => setTwoFASetup(p => ({...p, open: false}))}
                sx={{ fontWeight: 700, color: "#64748B", borderColor: '#CBD5E1', fontSize: '0.8rem' }}
              >
                Cancel
              </Button>
              
              {!twoFASetup.isEnabling && (
                <Button 
                  size="large" fullWidth variant="contained" 
                  onClick={handleDisable2FA} disabled={twoFASetup.loading}
                  sx={{ bgcolor: "#EF4444", fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(239,68,68,0.2)', "&:hover": { bgcolor: '#DC2626' } }}
                >
                  {twoFASetup.loading ? <CircularProgress size={24} color="inherit" /> : "Disable 2FA"}
                </Button>
              )}
            </Stack>
          </Box>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "16px", p: 1, maxWidth: '380px' } }}>
          <Box textAlign="center" p={3}>
            <Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 36 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: "#1E293B", fontSize: '1.1rem', mb: 1 }}>Confirm Access Revocation</Typography>
            <Typography sx={{ color: "#64748B", mb: 4, fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.5 }}>
              You are about to permanently delete this administrator account. They will lose all access to the system immediately.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button size="large" onClick={() => setDeleteDialog({ open: false, id: null })} fullWidth variant="outlined" sx={{ fontWeight: 700, color: "#64748B", borderColor: '#CBD5E1', fontSize: '0.8rem' }}>Cancel</Button>
              <Button size="large" onClick={handleDelete} fullWidth variant="contained" sx={{ bgcolor: "#EF4444", fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(239,68,68,0.2)', "&:hover": { bgcolor: '#DC2626' } }}>Revoke Access</Button>
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

export default AdminAccountsView;