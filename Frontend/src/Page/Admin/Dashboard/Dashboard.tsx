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
  DashboardOutlined, ExpandLess, ExpandMore, SupportAgentOutlined, SettingsOutlined, 
  LogoutOutlined, MenuOpen, ArrowForwardIos, NotificationsActiveOutlined, ChevronRight,
  AdminPanelSettingsOutlined, KeyboardArrowDownOutlined, CloudDoneOutlined, SecurityOutlined, 
  SpeedOutlined, StorageOutlined, PsychologyOutlined, Inventory2Outlined, 
  CategoryOutlined, ContactSupportOutlined, ViewCarouselOutlined, ShoppingCartOutlined, 
  PendingActionsOutlined, CancelOutlined, ManageAccountsOutlined
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// MODULE IMPORTS (Assuming these exist in your project)
import Overview from "../Overview/Overview";
import AccountCreate from "../New Account Create/New Account Create";
import AllProducts from "../Products/All Products/All Products";
import NewProductsCreate from "../Products/All Products/New Products Create";
import AllOrders from "../Orders/All Orders";
import AllCategories from "../Products/Categories/All Categories";

// CONSTANTS - Refined Palette
const DRAWER_WIDTH = 290;
const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD = "#D4AF37";
const PRIMARY_FONT = "'Montserrat', sans-serif";
const LOGO_URL = "https://i.ibb.co/gMKsF5Fd/image-1.webp";

// TYPES
interface NavItem {
  text: string;
  icon: React.ReactNode;
  isNested?: boolean;
  path?: string;
  children?: NavItem[];
}

const TypedAccountCreate = AccountCreate as React.FC<any>;
const TypedNewProductsCreate = NewProductsCreate as React.FC<any>;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // STATE
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

  // INITIALIZATION
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 400);
    const savedData = localStorage.getItem("adminData");
    if (savedData) {
      try { setUserData(prev => ({ ...prev, ...JSON.parse(savedData) })); } catch (e) { console.error(e); }
    }
    return () => clearTimeout(timer);
  }, []);

  // HANDLERS
  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseProfile = () => setAnchorEl(null);
  
  const handleLogout = () => {
    setLogoutDialogOpen(false);
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigation = (text: string, parentMenuName: string | null = null) => {
    setActiveTab(text);
    
    if (parentMenuName) {
      setOpenSubmenu(parentMenuName);
    } else {
      setOpenSubmenu(null);
    }
    
    if (isMobile) setMobileOpen(false);
    setSnackbarOpen(true); 
  };

  // NAVIGATION CONFIG
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

  // MODULE WRAPPER
  const ModuleWrapper = ({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) => (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={4} spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 900, color: PRIMARY_TEAL, letterSpacing: "-0.5px" }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mt: 0.5 }}>{subtitle}</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button 
            variant="outlined" 
            sx={{ 
              borderRadius: "12px", textTransform: "none", fontWeight: 700, 
              borderColor: "#E2E8F0", color: "#64748B", transition: "all 0.2s",
              "&:hover": { borderColor: PRIMARY_TEAL, color: PRIMARY_TEAL, transform: "translateY(-2px)" }
            }}
          >
            Export
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: PRIMARY_TEAL, borderRadius: "12px", textTransform: "none", 
              fontWeight: 700, px: 3, boxShadow: "0 8px 16px rgba(0,70,82,0.2)",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#00353e", transform: "translateY(-2px)", boxShadow: "0 12px 20px rgba(0,70,82,0.3)" }
            }}
          >
            Add New
          </Button>
        </Stack>
      </Stack>
      {children}
    </Box>
  );

  const ActiveContent = () => {
    switch (activeTab) {
      case "Dashboard": return <Overview />;
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
            <Tabs 
              value={activeSubTab} 
              onChange={(_, v) => setActiveSubTab(v)} 
              sx={{ mb: 4, borderBottom: "1px solid #E2E8F0", "& .MuiTabs-indicator": { backgroundColor: PRIMARY_TEAL, height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 } }}
            >
              <Tab label="Overview" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, textTransform: "none", color: "#64748B", "&.Mui-selected": { color: PRIMARY_TEAL } }} />
              <Tab label="Active" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, textTransform: "none", color: "#64748B", "&.Mui-selected": { color: PRIMARY_TEAL } }} />
              <Tab label="Archived" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, textTransform: "none", color: "#64748B", "&.Mui-selected": { color: PRIMARY_TEAL } }} />
            </Tabs>
            <Paper variant="outlined" sx={{ p: { xs: 5, md: 10 }, textAlign: 'center', borderRadius: '24px', borderStyle: 'dashed', borderColor: '#CBD5E1', bgcolor: '#F8FAFC', transition: 'all 0.3s', "&:hover": { borderColor: PRIMARY_TEAL, bgcolor: 'white' } }}>
              <Typography variant="h6" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 800, color: PRIMARY_TEAL, mb: 1 }}>
                {activeTab} Module
              </Typography>
              <Typography sx={{ fontFamily: PRIMARY_FONT, fontWeight: 500, color: '#94A3B8' }}>
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

  // SIDEBAR COMPONENT
  const Sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", background: `linear-gradient(180deg, ${PRIMARY_TEAL} 0%, #001f24 100%)`, color: "white" }}>
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Box component="img" src={LOGO_URL} sx={{ width: "100%", maxWidth: 150 }} />
        </Paper>
      </Box>

      <List sx={{ px: 2, flexGrow: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' } }}>
        {NAVIGATION_MAP.map((item) => {
          const isChildActive = item.children?.some(c => c.text === activeTab);
          const isActive = activeTab === item.text || openSubmenu === item.text || isChildActive;

          return (
            <React.Fragment key={item.text}>
              <ListItemButton 
                onClick={() => {
                  if (item.isNested) {
                    setOpenSubmenu(openSubmenu === item.text ? null : item.text);
                  } else {
                    handleNavigation(item.text, null);
                  }
                }} 
                sx={{ 
                  borderRadius: "12px", mb: 0.8, py: 1.5,
                  bgcolor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: isActive ? `4px solid ${ACCENT_GOLD}` : "4px solid transparent",
                  transition: "all 0.3s ease",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.15)", transform: "translateX(4px)" }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? ACCENT_GOLD : "rgba(255,255,255,0.7)", minWidth: 42, transition: 'color 0.3s' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontFamily: PRIMARY_FONT, fontWeight: isActive ? 700 : 500, fontSize: '0.9rem', color: isActive ? '#fff' : 'rgba(255,255,255,0.8)' }} />
                {item.isNested ? (openSubmenu === item.text ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.5)' }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.5)' }} />) : (isActive && <ArrowForwardIos sx={{ fontSize: 10, color: ACCENT_GOLD }} />)}
              </ListItemButton>

              {item.isNested && item.children && (
                <Collapse in={openSubmenu === item.text} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ mb: 1 }}>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.text} 
                        onClick={() => handleNavigation(child.text, item.text)} 
                        sx={{ 
                          pl: 7, py: 1.2, borderRadius: "12px", mx: 1, mb: 0.3,
                          bgcolor: activeTab === child.text ? "rgba(212, 175, 55, 0.1)" : "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.08)" }
                        }}
                      >
                        <ListItemText 
                          primary={child.text} 
                          primaryTypographyProps={{ fontFamily: PRIMARY_FONT, fontSize: '0.85rem', fontWeight: activeTab === child.text ? 700 : 500, color: activeTab === child.text ? ACCENT_GOLD : "rgba(255,255,255,0.6)" }} 
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
      
      <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <CloudDoneOutlined sx={{ fontSize: 18, color: '#10B981' }} />
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', letterSpacing: '0.5px', fontFamily: PRIMARY_FONT }}>SYSTEM SECURE & SYNCED</Typography>
        </Stack>
        <Button 
          fullWidth variant="contained" startIcon={<LogoutOutlined />} 
          onClick={() => setLogoutDialogOpen(true)}
          sx={{ bgcolor: 'rgba(255,142,142,0.1)', color: '#FF8E8E', fontWeight: 700, textTransform: 'none', borderRadius: '12px', boxShadow: 'none', "&:hover": { bgcolor: 'rgba(255,142,142,0.25)', boxShadow: 'none', fontFamily: PRIMARY_FONT } }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      {/* HEADERBAR */}
      <AppBar position="fixed" elevation={0} sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` }, bgcolor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(226, 232, 240, 0.8)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)", zIndex: 1201 }}>
        <Toolbar sx={{ height: 90, px: { xs: 2, md: 5 }, justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {isMobile && <IconButton onClick={() => setMobileOpen(true)} sx={{ color: PRIMARY_TEAL }}><MenuOpen /></IconButton>}
            <Box>
              <Breadcrumbs separator={<ChevronRight fontSize="small" sx={{ color: '#94A3B8' }} />}>
                <Link underline="hover" color="#94A3B8" sx={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: PRIMARY_FONT, cursor: 'pointer' }}>ADMIN</Link>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: PRIMARY_FONT, color: ACCENT_GOLD }}>{activeTab.toUpperCase()}</Typography>
              </Breadcrumbs>
              <Typography variant="h5" sx={{ fontWeight: 900, color: PRIMARY_TEAL, fontFamily: PRIMARY_FONT, letterSpacing: '-0.5px' }}>{activeTab}</Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Tooltip title="Help Center">
              <IconButton sx={{ bgcolor: '#F1F5F9', transition: 'all 0.2s', '&:hover': { bgcolor: '#E2E8F0', transform: 'scale(1.05)' } }}>
                <SupportAgentOutlined sx={{ color: '#475569', fontSize: 22 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton onClick={() => setNotificationCount(0)} sx={{ bgcolor: '#F1F5F9', transition: 'all 0.2s', '&:hover': { bgcolor: '#E2E8F0', transform: 'scale(1.05)' } }}>
                <Badge badgeContent={notificationCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 700 } }}>
                  <NotificationsActiveOutlined sx={{ color: '#475569', fontSize: 22 }} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ height: 35, my: 'auto', mx: 1 }} />
            <Box onClick={handleProfileMenu} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5, p: 0.8, borderRadius: '50px', transition: 'all 0.2s', "&:hover": { bgcolor: '#F1F5F9' } }}>
              <Avatar src={userData.profileImage} sx={{ width: 44, height: 44, border: `2px solid ${ACCENT_GOLD}`, boxShadow: '0 4px 10px rgba(212,175,55,0.3)' }} />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: PRIMARY_TEAL, fontFamily: PRIMARY_FONT }}>{userData.name}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>● {userData.role}</Typography>
              </Box>
              <KeyboardArrowDownOutlined sx={{ color: '#64748B' }} />
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: 0 }}>
        <Drawer variant={isMobile ? "temporary" : "permanent"} open={isMobile ? mobileOpen : true} onClose={() => setMobileOpen(false)} sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none", boxShadow: "4px 0 24px rgba(0,0,0,0.06)" } }}>
          {Sidebar}
        </Drawer>
      </Box>

      {/* MAIN VIEWPORT */}
      <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, md: 5 }, pb: { xs: 2, md: 5 }, pt: { xs: 0, md: 0 }, mt: "90px", maxWidth: '1600px', mx: 'auto', width: '100%' }}>
        <Fade in={isLoaded} timeout={800}>
          <Box>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 5 }, borderRadius: '32px', minHeight: '80vh', bgcolor: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(226,232,240,0.6)' }}>
              <ActiveContent />
            </Paper>
            
            <Stack direction="row" justifyContent="center" spacing={4} sx={{ mt: 5, opacity: 0.6 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityOutlined sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.5px' }}>SSL ENCRYPTED</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <StorageOutlined sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.5px' }}>DATABASE: {syncStatus.toUpperCase()}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <SpeedOutlined sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.5px' }}>LATENCY: 24ms</Typography>
              </Stack>
            </Stack>
          </Box>
        </Fade>
      </Box>

      {/* OVERLAYS */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseProfile} PaperProps={{ sx: { mt: 1.5, width: 220, borderRadius: '16px', p: 1, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' } }} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#94A3B8', letterSpacing: '0.5px' }}>ACCOUNT SETTINGS</Typography>
        </Box>
        <MenuItem onClick={handleCloseProfile} sx={{ borderRadius: '10px', py: 1.2, mb: 0.5 }}>
          <ListItemIcon><AdminPanelSettingsOutlined fontSize="small" sx={{ color: PRIMARY_TEAL }} /></ListItemIcon>
          <ListItemText primary="Admin Profile" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} />
        </MenuItem>
        <Divider sx={{ my: 1, borderColor: '#F1F5F9' }} />
        <MenuItem onClick={() => { handleCloseProfile(); setLogoutDialogOpen(true); }} sx={{ borderRadius: '10px', color: '#E11D48', '&:hover': { bgcolor: 'rgba(225,29,72,0.05)' } }}>
          <ListItemIcon><LogoutOutlined fontSize="small" sx={{ color: '#E11D48' }} /></ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }} />
        </MenuItem>
      </Menu>

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} PaperProps={{ sx: { borderRadius: "28px", p: 2, maxWidth: 400, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}>
        <DialogTitle sx={{ fontFamily: PRIMARY_FONT, fontWeight: 900, color: PRIMARY_TEAL, textAlign: "center", fontSize: "1.5rem" }}>Security Protocol</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#64748B", fontWeight: 500, lineHeight: 1.6 }}>Confirming session termination. You will need to re-authenticate to access the management modules.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center", gap: 2 }}>
          <Button fullWidth onClick={() => setLogoutDialogOpen(false)} sx={{ color: "#64748B", fontWeight: 700, textTransform: "none", py: 1.5, borderRadius: "14px", bgcolor: "#F1F5F9", '&:hover': { bgcolor: '#E2E8F0' } }}>Keep Session</Button>
          <Button fullWidth onClick={handleLogout} variant="contained" sx={{ bgcolor: "#F43F5E", fontWeight: 700, textTransform: "none", py: 1.5, borderRadius: "14px", boxShadow: "0 8px 16px rgba(244, 63, 94, 0.25)", "&:hover": { bgcolor: "#E11D48", boxShadow: "0 10px 20px rgba(225, 29, 72, 0.3)" } }}>Logout</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: '12px', fontWeight: 600, fontFamily: PRIMARY_FONT, bgcolor: PRIMARY_TEAL, color: 'white' }}>Module: {activeTab} Loaded</Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;