import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Stack, Paper, TextField, Button, Avatar, IconButton,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Dialog, 
  Snackbar, Alert, ToggleButtonGroup, ToggleButton, Breadcrumbs, Link,
  ThemeProvider, createTheme, Card, CardContent, InputAdornment, Tooltip
} from "@mui/material";
import {
  MailOutline, Link as LinkIcon, AddCircleOutline, ArrowBack, EditOutlined, 
  Search, QrCode2, AccessTime, DeleteOutline, KeyboardArrowRight,
  ShieldMoonOutlined, SecurityUpdateGood, 
  NavigateNext, // ✅ Added NavigateNext import
  HistoryToggleOffOutlined, GridViewOutlined, ViewListOutlined, 
  CheckCircleOutline, CloseOutlined, SupervisorAccountOutlined,
  WarningAmberRounded, VisibilityOutlined
} from "@mui/icons-material";

// --- CONFIGURATION & CONSTANTS ---
const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD = "#CC9D2F";
const DANGER_RED = "#E11D48";
const PRIMARY_FONT = "'Montserrat', sans-serif";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CACHE_KEY = "ADMIN_VAULT_DATA";

const montserratTheme = createTheme({
  typography: {
    fontFamily: PRIMARY_FONT,
    allVariants: { fontFamily: PRIMARY_FONT },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, borderRadius: '10px' } } },
    MuiTableCell: { styleOverrides: { root: { fontFamily: PRIMARY_FONT } } },
  }
});

const AccountCreate: React.FC = () => {
  const [view, setView] = useState<"list" | "form" | "details">("list");
  const [admins, setAdmins] = useState<any[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [syncStatus, setSyncStatus] = useState<"online" | "offline">("online");
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [history, setHistory] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/all`);
      const newDataString = JSON.stringify(response.data);
      const currentCache = localStorage.getItem(CACHE_KEY);

      if (currentCache !== newDataString) {
        setAdmins(response.data);
        localStorage.setItem(CACHE_KEY, newDataString);
      }
      setSyncStatus("online");
    } catch (error) {
      setSyncStatus("offline");
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    const interval = setInterval(() => fetchAdmins(), 3000); 
    return () => clearInterval(interval);
  }, [fetchAdmins]);

  const filteredAdmins = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return admins.filter(a => 
      a.name.toLowerCase().includes(query) || a.email.toLowerCase().includes(query)
    );
  }, [searchQuery, admins]);

  const triggerSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddNew = () => {
    setSelectedAdmin(null);
    setIsEditing(false);
    setView("form");
  };

  const handleFormSave = async (formData: any) => {
    setLoading(true);
    try {
      if (isEditing && selectedAdmin) {
        await axios.put(`${BASE_URL}/api/edit/${selectedAdmin._id}`, formData);
        triggerSnackbar("Administrator Profile Updated", "success");
        setHistory(prev => [`Updated Profile: ${formData.name}`, ...prev].slice(0, 8));
      } else {
        await axios.post(`${BASE_URL}/api/create`, formData);
        triggerSnackbar("New Admin Provisioned", "success");
        setHistory(prev => [`Provisioned Admin: ${formData.name}`, ...prev].slice(0, 8));
      }
      fetchAdmins();
      setView("list");
    } catch (error: any) {
      triggerSnackbar("Operation Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    const targetId = deleteDialog.id;
    if (!targetId) return;
    const targetName = admins.find(a => a._id === targetId)?.name || "User";
    
    const updated = admins.filter(a => a._id !== targetId);
    setAdmins(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setDeleteDialog({ open: false, id: null });

    try {
      await axios.delete(`${BASE_URL}/api/delete/${targetId}`);
      triggerSnackbar("Access Revoked Successfully", "success");
      setHistory(prev => [`Revoked Access: ${targetName}`, ...prev].slice(0, 8));
      if (view === "details") setView("list");
    } catch {
      fetchAdmins();
      triggerSnackbar("De-provisioning Failed", "error");
    }
  };

  return (
    <ThemeProvider theme={montserratTheme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1.5, md: 3 } }}>
        
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} mb={3} spacing={2}>
          <Box>
            <Breadcrumbs separator={<NavigateNext sx={{ fontSize: '0.8rem' }} />} sx={{ mb: 0.5 }}>
              <Link underline="hover" color="inherit" href="/" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>SYSTEM</Link>
              <Typography color="text.primary" sx={{ fontSize: '0.65rem', fontWeight: 800, color: PRIMARY_TEAL }}>IDENTITY MANAGEMENT</Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, letterSpacing: "-0.5px", fontSize: '1.4rem' }}>
              {view === "list" ? "Admin Console" : "Security Hub"}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: syncStatus === 'online' ? '#10B981' : '#EF4444' }} />
               <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: "#64748B", letterSpacing: 0.5 }}>
                 {syncStatus === 'online' ? 'SECURITY SYNC ACTIVE' : 'CONNECTION INTERRUPTED'}
               </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {view === "list" ? (
              <Button 
                variant="contained" onClick={handleAddNew} startIcon={<AddCircleOutline />} 
                sx={{ bgcolor: PRIMARY_TEAL, px: 3, py: 1, boxShadow: "0 4px 12px rgba(0,70,82,0.15)", "&:hover": { bgcolor: "#002d35" } }}
              >
                Create Admin
              </Button>
            ) : (
              <Button onClick={() => setView("list")} startIcon={<ArrowBack />} sx={{ color: PRIMARY_TEAL }}>
                Back to Console
              </Button>
            )}
          </Stack>
        </Stack>

        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ flex: 2 }}>
                  <Paper elevation={0} sx={{ p: 1, px: 2, borderRadius: "12px", border: "1px solid #E2E8F0", display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
                    <TextField
                      fullWidth size="small" variant="standard"
                      placeholder="Filter by credentials or identity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        disableUnderline: true,
                        startAdornment: <Search sx={{ mr: 1, color: PRIMARY_TEAL, fontSize: '1.2rem' }} />,
                        sx: { fontWeight: 600, fontSize: '0.85rem' }
                      }}
                    />
                  </Paper>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Paper elevation={0} sx={{ p: 1, borderRadius: "12px", border: "1px solid #E2E8F0", display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <ToggleButtonGroup value={viewMode} exclusive onChange={(_, m) => m && setViewMode(m)} size="small">
                      <ToggleButton value="table" sx={{ px: 2, "&.Mui-selected": { bgcolor: PRIMARY_TEAL, color: 'white' } }}>
                        <ViewListOutlined fontSize="small" sx={{ mr: 1 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.7rem' }}>TABLE</Typography>
                      </ToggleButton>
                      <ToggleButton value="grid" sx={{ px: 2, "&.Mui-selected": { bgcolor: PRIMARY_TEAL, color: 'white' } }}>
                        <GridViewOutlined fontSize="small" sx={{ mr: 1 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.7rem' }}>GRID</Typography>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Paper>
                </Box>
              </Stack>

              {viewMode === "table" ? (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                  <Table size="medium">
                    <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>ADMINISTRATOR</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>SECURITY STATUS</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>ENROLLED</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", pr: 4, letterSpacing: 0.5 }}>CONTROLS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAdmins.map((admin) => (
                        <TableRow key={admin._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar src={admin.profileImage} sx={{ width: 42, height: 42, borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                              <Box>
                                <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem" }}>{admin.name}</Typography>
                                <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>{admin.email}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip label={admin.twoFAEnabled ? "2FA SECURED" : "STANDARD"} size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800, bgcolor: admin.twoFAEnabled ? "#ECFDF5" : "#F1F5F9", color: admin.twoFAEnabled ? "#10B981" : "#64748B" }} />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748B" }}>
                              {new Date(admin.createdAt || Date.now()).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 2 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Security Details">
                                <IconButton onClick={() => {setSelectedAdmin(admin); setView("details");}} size="small" sx={{ color: PRIMARY_TEAL, bgcolor: '#F1F5F9' }}>
                                  <KeyboardArrowRight fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Profile">
                                <IconButton onClick={() => { setSelectedAdmin(admin); setIsEditing(true); setView("form"); }} size="small" sx={{ color: ACCENT_GOLD, bgcolor: '#F1F5F9' }}>
                                  <EditOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Revoke Access">
                                <IconButton onClick={() => setDeleteDialog({ open: true, id: admin._id })} size="small" sx={{ color: DANGER_RED, bgcolor: '#FEF2F2' }}>
                                  <DeleteOutline fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                  {filteredAdmins.map((admin) => (
                    <Card key={admin._id} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                      <Box sx={{ p: 3, pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#F8FAFC', position: 'relative' }}>
                        <Avatar src={admin.profileImage} sx={{ width: 64, height: 64, mb: 2, border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B', textAlign: 'center' }}>{admin.name}</Typography>
                        <Chip label={admin.twoFAEnabled ? "2FA SECURED" : "STANDARD"} size="small" sx={{ mt: 1.5, height: 18, fontSize: '0.55rem', fontWeight: 800, bgcolor: admin.twoFAEnabled ? "#10B981" : "#E2E8F0", color: 'white' }} />
                      </Box>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <MailOutline sx={{ fontSize: 14 }} /> {admin.email}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton onClick={() => {setSelectedAdmin(admin); setView("details");}} size="small" sx={{ color: PRIMARY_TEAL }}><VisibilityOutlined fontSize="small" /></IconButton>
                          <IconButton onClick={() => { setSelectedAdmin(admin); setIsEditing(true); setView("form"); }} size="small" sx={{ color: ACCENT_GOLD }}><EditOutlined fontSize="small" /></IconButton>
                          <IconButton onClick={() => setDeleteDialog({ open: true, id: admin._id })} size="small" sx={{ color: DANGER_RED }}><DeleteOutline fontSize="small" /></IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </motion.div>
          )}

          {view === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <AdminForm admin={selectedAdmin} isEditing={isEditing} onSave={handleFormSave} loading={loading} />
            </motion.div>
          )}

          {view === "details" && (
            <motion.div key="details" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <AdminDetails admin={selectedAdmin} onEdit={() => { setIsEditing(true); setView("form"); }} onDelete={(id: any) => setDeleteDialog({ open: true, id })} />
            </motion.div>
          )}
        </AnimatePresence>

        {view === "list" && (
          <Box sx={{ mt: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <HistoryToggleOffOutlined sx={{ color: PRIMARY_TEAL, fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: PRIMARY_TEAL, letterSpacing: 0.5 }}>AUDIT LOG</Typography>
              </Stack>
              {history.length === 0 ? (
                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, fontStyle: 'italic' }}>No system events recorded.</Typography>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  {history.map((log, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: '8px', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: '#10B981' }} />
                      <Typography sx={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>{log}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        )}

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "20px", p: 1, maxWidth: '380px' } }}>
          <Box textAlign="center" p={3}>
            <Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <WarningAmberRounded sx={{ color: DANGER_RED, fontSize: 36 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: "#1E293B", fontSize: '1.1rem', mb: 1 }}>Confirm Access Revocation</Typography>
            <Typography sx={{ color: "#64748B", mb: 4, fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.5 }}>Are you sure you want to revoke system access? This action is immediate.</Typography>
            <Stack direction="row" spacing={2}>
              <Button size="large" onClick={() => setDeleteDialog({ open: false, id: null })} fullWidth variant="outlined" sx={{ color: "#64748B", borderColor: '#CBD5E1' }}>Abort</Button>
              <Button size="large" onClick={confirmDelete} fullWidth variant="contained" sx={{ bgcolor: DANGER_RED, "&:hover": { bgcolor: '#DC2626' } }}>Revoke Access</Button>
            </Stack>
          </Box>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "8px", fontWeight: 700 }}>{snackbar.message}</Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
};

const AdminForm = ({ admin, isEditing, onSave, loading }: any) => {
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    password: "",
    profileImage: admin?.profileImage || "",
  });

  return (
    <Paper elevation={0} sx={{ p: 5, borderRadius: "24px", border: "1px solid #E2E8F0", maxWidth: "650px", mx: "auto", bgcolor: '#FFF' }}>
      <Stack spacing={4}>
        <Box sx={{ textAlign: 'center' }}>
          <Avatar src={formData.profileImage} sx={{ width: 100, height: 100, mx: 'auto', mb: 2, border: `4px solid #F0F5F6`, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <SupervisorAccountOutlined sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 900, color: PRIMARY_TEAL }}>{isEditing ? "Modify Credentials" : "Provision New Node"}</Typography>
        </Box>
        <Stack spacing={2.5}>
          <TextField fullWidth label="Full Name" size="medium" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><SupervisorAccountOutlined sx={{ color: PRIMARY_TEAL }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
          <TextField fullWidth label="Institutional Email" size="medium" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><MailOutline sx={{ color: PRIMARY_TEAL }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
          <TextField fullWidth label="Profile Image URL" size="medium" value={formData.profileImage} onChange={(e) => setFormData({...formData, profileImage: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon sx={{ color: PRIMARY_TEAL }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
          <TextField fullWidth type="password" label={isEditing ? "New Password (Keep blank to stay same)" : "Access Password"} size="medium" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
        </Stack>
        <Button variant="contained" fullWidth disabled={loading} onClick={() => onSave(formData)} sx={{ bgcolor: PRIMARY_TEAL, py: 1.8, borderRadius: "12px", fontSize: '1rem', boxShadow: '0 8px 20px rgba(0,70,82,0.2)' }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? "Confirm Infrastructure Update" : "Deploy Admin Credentials")}
        </Button>
      </Stack>
    </Paper>
  );
};

const AdminDetails = ({ admin: initialAdmin, onEdit, onDelete }: any) => {
  const [admin, setAdmin] = useState(initialAdmin);
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleSetup2FA = async () => {
    setLoading2FA(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/setup-2fa`, { adminId: admin._id });
      setQrCode(res.data.qrCode);
      setIsVerifying(true);
    } catch (err) {
      setSnackbar({ open: true, message: "Handshake Error" });
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    setLoading2FA(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/verify-2fa`, { adminId: admin._id, token: verificationCode });
      if (res.data.success) {
        setAdmin({ ...admin, twoFAEnabled: true });
        setIsVerifying(false);
        setQrCode("");
        setSnackbar({ open: true, message: "Security Token Validated" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Validation Failed" });
    } finally {
      setLoading2FA(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: "1px solid #E2E8F0", maxWidth: '800px', mx: 'auto', bgcolor: '#FFF' }}>
      <Stack spacing={4}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
          <Avatar src={admin.profileImage} sx={{ width: 120, height: 120, borderRadius: "24px", border: `6px solid #F0F5F6` }} />
          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: PRIMARY_TEAL, mb: 0.5 }}>{admin.name}</Typography>
            <Typography sx={{ color: "#64748B", fontWeight: 700, fontSize: '0.9rem', mb: 2 }}>{admin.email}</Typography>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }}>
               <Button size="small" variant="contained" onClick={onEdit} startIcon={<EditOutlined />} sx={{ bgcolor: ACCENT_GOLD }}>Edit</Button>
               <Button size="small" variant="outlined" onClick={() => onDelete(admin._id)} startIcon={<DeleteOutline />} sx={{ color: DANGER_RED, borderColor: DANGER_RED }}>Revoke</Button>
            </Stack>
          </Box>
        </Stack>
        <Divider />
        <Paper sx={{ p: 4, borderRadius: "20px", background: admin.twoFAEnabled ? "linear-gradient(135deg, #004652 0%, #006D77 100%)" : "#1E293B", color: "#FFF" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={4} alignItems="center">
            <Box sx={{ bgcolor: "#FFF", p: 1.5, borderRadius: "16px", minWidth: 120, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {qrCode ? <motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} src={qrCode} style={{ width: 110 }} /> : <QrCode2 sx={{ fontSize: 70, color: admin.twoFAEnabled ? PRIMARY_TEAL : "#475569" }} />}
            </Box>
            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1.5 }}>
                {admin.twoFAEnabled ? <SecurityUpdateGood /> : <ShieldMoonOutlined />} {admin.twoFAEnabled ? "Biometric Hardening Active" : "Two-Step Verification"}
              </Typography>
              <Typography sx={{ opacity: 0.8, mt: 1, fontSize: '0.85rem', fontWeight: 500, maxWidth: 400 }}>{admin.twoFAEnabled ? "This account is protected by an external token layer." : "Add a defensive layer to this account. Scan the QR code to begin."}</Typography>
              {!admin.twoFAEnabled && !isVerifying && (
                <Button variant="contained" onClick={handleSetup2FA} disabled={loading2FA} sx={{ bgcolor: "#FFF", color: "#000", mt: 3, fontWeight: 800, px: 4 }}>
                   {loading2FA ? <CircularProgress size={20} /> : "Initialize 2FA"}
                </Button>
              )}
              {isVerifying && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <TextField placeholder="TOKEN" size="small" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} InputProps={{ sx: { bgcolor: "#FFF", borderRadius: "8px", fontWeight: 800, width: 100 } }} />
                  <Button onClick={handleVerifyAndEnable} disabled={loading2FA} variant="contained" sx={{ bgcolor: "#10B981" }}>
                    {loading2FA ? <CircularProgress size={20} color="inherit" /> : "Verify"}
                  </Button>
                  <IconButton onClick={() => setIsVerifying(false)} sx={{ color: "#FFF" }}><CloseOutlined /></IconButton>
                </Stack>
              )}
            </Box>
          </Stack>
        </Paper>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '15px', border: '1px solid #E2E8F0' }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: '#F0F5F6', color: PRIMARY_TEAL }}><AccessTime fontSize="small" /></Avatar>
                <Box><Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Provisioned Date</Typography><Typography sx={{ fontWeight: 700, color: PRIMARY_TEAL }}>{new Date(admin.createdAt || Date.now()).toLocaleString()}</Typography></Box>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '15px', border: '1px solid #E2E8F0' }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: '#F0F5F6', color: PRIMARY_TEAL }}><ShieldMoonOutlined fontSize="small" /></Avatar>
                <Box><Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Security Level</Typography><Typography sx={{ fontWeight: 700, color: PRIMARY_TEAL }}>{admin.twoFAEnabled ? "Infrastructure Admin (L2)" : "Standard Admin (L1)"}</Typography></Box>
            </Stack>
          </Paper>
        </Box>
      </Stack>
      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity="info" sx={{ fontWeight: 700 }}>{snackbar.message}</Alert></Snackbar>
    </Paper>
  );
};

export default AccountCreate;