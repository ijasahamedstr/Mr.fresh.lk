import React, { useState, useEffect, useMemo } from "react";
import { 
  Box, Typography, Avatar, IconButton, List, ListItemButton, 
  ListItemIcon, ListItemText, Drawer, AppBar, Toolbar, Stack, 
  useTheme, useMediaQuery, Divider, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, Tooltip,
  Fade, Collapse, Breadcrumbs, Link, Paper, Badge, Menu, MenuItem,
  Snackbar, Alert, Tab, Tabs
} from "@mui/material";
import { 
  DashboardOutlined, ExpandLess, ExpandMore,SupportAgentOutlined,SettingsOutlined, 
  LogoutOutlined, MenuOpen, ArrowForwardIos,
  NotificationsActiveOutlined,ChevronRight,
  AdminPanelSettingsOutlined,
  KeyboardArrowDownOutlined,
  CloudDoneOutlined, SecurityOutlined, SpeedOutlined,
  StorageOutlined,
  TranslateOutlined, PsychologyOutlined,
  Inventory2Outlined, CategoryOutlined, ContactSupportOutlined,
  ViewCarouselOutlined,
  ShoppingCartOutlined, 
  PendingActionsOutlined, 
  CancelOutlined,
  ManageAccountsOutlined
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// MODULE IMPORTS (Assuming these exist in your project)
import Overview from "../Overview/Overview";
import AccountCreate from "../New Account Create/New Account Create";
import AllProducts from "../Products/All Products/All Products";
import NewProductsCreate from "../Products/All Products/New Products Create";
import AllOrders from "../Orders/All Orders";
import AllCategories from "../Products/Categories/All Categories";

// CONSTANTS
const DRAWER_WIDTH = 290;
const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD = "#CC9D2F";
const PRIMARY_FONT = "'Montserrat', sans-serif";
const LOGO_URL = "https://i.ibb.co/6RkH7J3r/Small-scaled.webp";

// TYPES
interface NavItem {
  text: string;
  icon: React.ReactNode;
  isNested?: boolean;
  path?: string;
  children?: NavItem[];
}

// FIX: Cast components to React.FC<any> to resolve strict Prop type mismatches 
// (Resolves both IntrinsicAttributes error and missing onBack prop error)
const TypedAccountCreate = AccountCreate as React.FC<any>;
const TypedNewProductsCreate = NewProductsCreate as React.FC<any>;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // --- EXTENDED STATE ---
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [syncStatus] = useState("Online");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  
  const [userData, setUserData] = useState({ 
    name: "System Administrator", 
    profileImage: "", 
    role: "Super Admin",
    lastLogin: new Date().toLocaleString()
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 400);
    const savedData = localStorage.getItem("adminData");
    if (savedData) {
      try { setUserData(prev => ({ ...prev, ...JSON.parse(savedData) })); } catch (e) { console.error(e); }
    }
    return () => clearTimeout(timer);
  }, []);

  // --- HANDLERS ---
  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseProfile = () => setAnchorEl(null);
  
  const handleLogout = () => {
    setLogoutDialogOpen(false);
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigation = (text: string) => {
    setActiveTab(text);
    if (isMobile) setMobileOpen(false);
    setSnackbarOpen(true); 
  };

  // --- NAVIGATION CONFIG ---
  const NAVIGATION_MAP: NavItem[] = useMemo(() => [
    { text: "Dashboard", icon: <DashboardOutlined /> },
    { 
      text: "Products", 
      icon: <Inventory2Outlined />,
      isNested: true,
      children: [
        { text: "All Products", icon: <Inventory2Outlined /> },
        { text: "Add New Product", icon: <Inventory2Outlined /> },
        { text: "Categories", icon: <CategoryOutlined /> }
      ]
    },
    { 
      text: "Orders", 
      icon: <ShoppingCartOutlined />,
      isNested: true,
      children: [
        { text: "All Orders", icon: <ShoppingCartOutlined /> },
        { text: "Pending Orders", icon: <PendingActionsOutlined /> },
        { text: "Cancelled Orders", icon: <CancelOutlined /> }
      ]
    },
    { text: "Customer Account", icon: <ManageAccountsOutlined /> },
    { text: "Inquire Here", icon: <ContactSupportOutlined /> },
    { text: "Slider Section", icon: <ViewCarouselOutlined /> },
    { text: "Account Create", icon: <SettingsOutlined />, path: "Settings" },
  ], []);

  // --- MODULE RENDERING LOGIC ---
  const ModuleWrapper = ({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) => (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={4} spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 900, color: PRIMARY_TEAL, letterSpacing: "-1px" }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>{subtitle}</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, borderColor: "#E2E8F0", color: "#64748B" }}>Export</Button>
          <Button variant="contained" sx={{ bgcolor: PRIMARY_TEAL, borderRadius: "10px", textTransform: "none", fontWeight: 700, px: 3 }}>Add New</Button>
        </Stack>
      </Stack>
      {children}
    </Box>
  );

  const ActiveContent = () => {
    switch (activeTab) {
      case "Dashboard": return <Overview />;
      
      // FIX: Using typed components and passing required onBack props to both
      case "Account Create": return <TypedAccountCreate onBack={() => setActiveTab("Dashboard")} />;
      case "Add New Product": return <TypedNewProductsCreate onBack={() => setActiveTab("All Products")} />;
      
      case "All Products": return <AllProducts />;
      
      case "Customer Account":
      case "Categories": return <AllCategories />
      case "All Orders": return <AllOrders />
      case "Pending Orders":
      case "Cancelled Orders":
      case "Inquire Here":
      case "OTT Service":
      case "Request Service":
      case "Slider Section":
        return (
          <ModuleWrapper title={`${activeTab} Management`} subtitle={`Configure and manage university ${activeTab.toLowerCase()} records.`}>
            <Tabs value={activeSubTab} onChange={(_, v) => setActiveSubTab(v)} sx={{ mb: 3, borderBottom: "1px solid #E2E8F0" }}>
              <Tab label="Overview" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, textTransform: "none" }} />
              <Tab label="Active" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, textTransform: "none" }} />
              <Tab label="Archived" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, textTransform: "none" }} />
            </Tabs>
            <Paper variant="outlined" sx={{ p: { xs: 5, md: 10 }, textAlign: 'center', borderRadius: '24px', borderStyle: 'dashed', bgcolor: '#F8FAFC' }}>
              <Typography variant="h6" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 800, color: PRIMARY_TEAL, mb: 1 }}>
                {activeTab} Module
              </Typography>
              <Typography sx={{ fontFamily: PRIMARY_FONT, fontWeight: 600, color: '#94A3B8' }}>
                Add your {activeTab.toLowerCase()} form, table, API data, or management component here.
              </Typography>
            </Paper>
          </ModuleWrapper>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 20 }}>
            <PsychologyOutlined sx={{ fontSize: 80, color: '#E2E8F0', mb: 2 }} />
            <Typography variant="h5" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 800, color: PRIMARY_TEAL }}>{activeTab} Expansion</Typography>
            <Typography sx={{ fontFamily: PRIMARY_FONT, color: '#94A3B8' }}>This module is currently being optimized for high-volume data.</Typography>
          </Box>
        );
    }
  };

  // --- SIDEBAR COMPONENT ---
  const Sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: PRIMARY_TEAL, color: "white" }}>
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', bgcolor: 'white' }}>
          <Box component="img" src={LOGO_URL} sx={{ width: "100%", maxWidth: 150 }} />
        </Paper>
      </Box>

      <List sx={{ px: 2, flexGrow: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
        {NAVIGATION_MAP.map((item) => (
          <React.Fragment key={item.text}>
            <ListItemButton 
              onClick={() => item.isNested ? setOpenSubmenu(openSubmenu === item.text ? null : item.text) : handleNavigation(item.text)} 
              sx={{ 
                borderRadius: "14px", mb: 0.8, py: 1.5,
                bgcolor: activeTab === item.text || openSubmenu === item.text ? "rgba(255,255,255,0.12)" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" }
              }}
            >
              <ListItemIcon sx={{ color: activeTab === item.text ? ACCENT_GOLD : "white", minWidth: 42 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontFamily: PRIMARY_FONT, fontWeight: 700, fontSize: '0.85rem' }} />
              {item.isNested ? (openSubmenu === item.text ? <ExpandLess /> : <ExpandMore />) : (activeTab === item.text && <ArrowForwardIos sx={{ fontSize: 10, color: ACCENT_GOLD }} />)}
            </ListItemButton>

            {item.isNested && item.children && (
              <Collapse in={openSubmenu === item.text} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ mb: 1 }}>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.text} onClick={() => handleNavigation(child.text)}
                      sx={{ 
                        pl: 7, py: 1.2, borderRadius: "12px", mx: 1, mb: 0.3,
                        bgcolor: activeTab === child.text ? "rgba(204, 157, 47, 0.15)" : "transparent",
                      }}
                    >
                      <ListItemText 
                        primary={child.text} 
                        primaryTypographyProps={{ fontFamily: PRIMARY_FONT, fontSize: '0.8rem', fontWeight: 600, color: activeTab === child.text ? ACCENT_GOLD : "rgba(255,255,255,0.5)" }} 
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      
      <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.15)' }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <CloudDoneOutlined sx={{ fontSize: 18, color: '#10B981' }} />
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981' }}>SYSTEM SECURE & SYNCED</Typography>
        </Stack>
        <Button 
          fullWidth variant="contained" startIcon={<LogoutOutlined />} 
          onClick={() => setLogoutDialogOpen(true)}
          sx={{ bgcolor: 'rgba(255,142,142,0.1)', color: '#FF8E8E', fontWeight: 800, textTransform: 'none', borderRadius: '12px', "&:hover": { bgcolor: 'rgba(255,142,142,0.2)' } }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "#F4F7F9", minHeight: "100vh" }}>
      {/* HEADERBAR */}
      <AppBar position="fixed" elevation={0} sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` }, bgcolor: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #E2E8F0", zIndex: 1201 }}>
        <Toolbar sx={{ height: 90, px: 4, justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {isMobile && <IconButton onClick={() => setMobileOpen(true)} sx={{ color: PRIMARY_TEAL }}><MenuOpen /></IconButton>}
            <Box>
              <Breadcrumbs separator={<ChevronRight fontSize="small" sx={{ color: '#94A3B8' }} />}>
                <Link underline="hover" color="#94A3B8" sx={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: PRIMARY_FONT }}>ADMIN</Link>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: PRIMARY_FONT, color: ACCENT_GOLD }}>{activeTab.toUpperCase()}</Typography>
              </Breadcrumbs>
              <Typography variant="h5" sx={{ fontWeight: 900, color: PRIMARY_TEAL, fontFamily: PRIMARY_FONT }}>{activeTab}</Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2.5}>
            <Tooltip title="Help Center"><IconButton sx={{ bgcolor: '#F1F5F9' }}><SupportAgentOutlined sx={{ color: '#64748B', fontSize: 20 }} /></IconButton></Tooltip>
            <Tooltip title="Notifications">
              <IconButton onClick={() => setNotificationCount(0)} sx={{ bgcolor: '#F1F5F9' }}>
                <Badge badgeContent={notificationCount} color="error"><NotificationsActiveOutlined sx={{ color: '#64748B', fontSize: 20 }} /></Badge>
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ height: 35, my: 'auto' }} />
            <Box onClick={handleProfileMenu} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5, p: 0.8, borderRadius: '50px', transition: '0.2s', "&:hover": { bgcolor: '#F1F5F9' } }}>
              <Avatar src={userData.profileImage} sx={{ width: 44, height: 44, border: `2px solid ${ACCENT_GOLD}` }} />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: PRIMARY_TEAL, fontFamily: PRIMARY_FONT }}>{userData.name}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 700 }}>● {userData.role}</Typography>
              </Box>
              <KeyboardArrowDownOutlined sx={{ color: '#64748B' }} />
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: 0 }}>
        <Drawer variant={isMobile ? "temporary" : "permanent"} open={isMobile ? mobileOpen : true} onClose={() => setMobileOpen(false)} sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none", boxShadow: "15px 0 35px rgba(0,0,0,0.03)" } }}>
          {Sidebar}
        </Drawer>
      </Box>

      {/* MAIN VIEWPORT */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: "90px" }}>
        <Fade in={isLoaded} timeout={600}>
          <Box>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 5 }, borderRadius: '32px', minHeight: '80vh', border: '1px solid #E2E8F0', bgcolor: 'white' }}>
              <ActiveContent />
            </Paper>
            
            <Stack direction="row" justifyContent="center" spacing={4} sx={{ mt: 5, opacity: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityOutlined sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>SSL ENCRYPTED</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <StorageOutlined sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>DATABASE: {syncStatus}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <SpeedOutlined sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>LATENCY: 24ms</Typography>
              </Stack>
            </Stack>
          </Box>
        </Fade>
      </Box>

      {/* OVERLAYS */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseProfile} PaperProps={{ sx: { mt: 1, width: 220, borderRadius: '18px', p: 1, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' } }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#94A3B8' }}>ACCOUNT SETTINGS</Typography>
        </Box>
        <MenuItem onClick={handleCloseProfile} sx={{ borderRadius: '10px', py: 1.2, mb: 0.5 }}>
          <ListItemIcon><AdminPanelSettingsOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="Admin Profile" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} />
        </MenuItem>
        <MenuItem onClick={handleCloseProfile} sx={{ borderRadius: '10px', py: 1.2 }}>
          <ListItemIcon><TranslateOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="Language" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} />
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={() => setLogoutDialogOpen(true)} sx={{ borderRadius: '10px', color: 'error.main' }}>
          <ListItemIcon><LogoutOutlined fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }} />
        </MenuItem>
      </Menu>

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} PaperProps={{ sx: { borderRadius: "28px", p: 2, maxWidth: 400 } }}>
        <DialogTitle sx={{ fontFamily: PRIMARY_FONT, fontWeight: 900, color: PRIMARY_TEAL, textAlign: "center", fontSize: "1.5rem" }}>Security Protocol</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#64748B", fontWeight: 500 }}>Confirming session termination. You will need to re-authenticate to access the management modules.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center", gap: 2 }}>
          <Button fullWidth onClick={() => setLogoutDialogOpen(false)} sx={{ color: "#94A3B8", fontWeight: 800, textTransform: "none", py: 1.5, borderRadius: "12px", bgcolor: "#F1F5F9" }}>Keep Session</Button>
          <Button fullWidth onClick={handleLogout} variant="contained" sx={{ bgcolor: "#F43F5E", fontWeight: 800, textTransform: "none", py: 1.5, borderRadius: "12px", "&:hover": { bgcolor: "#E11D48" } }}>Logout</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="info" variant="filled" sx={{ borderRadius: '12px', fontWeight: 700, fontFamily: PRIMARY_FONT }}>Module: {activeTab} Loaded Successfully</Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;