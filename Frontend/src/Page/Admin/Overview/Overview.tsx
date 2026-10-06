import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Paper, Fade } from "@mui/material";
import { 
  ArrowForward, 
  ViewCarouselOutlined, 
  HowToRegOutlined, 
  VerifiedOutlined, 
  CampaignOutlined, 
  QuestionAnswerOutlined, 
  NewspaperOutlined, 
  EventOutlined, 
  SupportAgentOutlined, 
  AccountBalanceOutlined, 
  Diversity1Outlined, 
  HandshakeOutlined, 
  SettingsOutlined,
  SchoolOutlined,
  Circle
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Import Recharts for the Graph
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// Constants
const primaryTeal = "#004652";
const accentGold = "#CC9D2F";
const primaryFont = "'Montserrat', sans-serif"; 

const Overview = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    slider: 0, 
    registration: 0, 
    courses: 0, 
    certificates: 0, 
    offers: 0,
    students: 0, 
    news: 0, 
    events: 0, 
    consultation: 0,
    faculties: 0, 
    studentLife: 0, 
    partners: 0, 
    settings: "Active"
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const apiHost = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const endpoints = {
      slider: "/api/sliders",
      registration: "/api/students",
      courses: "/api/course", 
      certificates: "/api/certificates",
      offers: "/api/offers",
      students: "/api/guidance",
      news: "/api/news",
      events: "/api/events",
      consultation: "/api/guidance",
      faculties: "/api/faculties",
      studentLife: "/api/student-life",
      partners: "/api/partners"
    };

    const fetchPromises = Object.entries(endpoints).map(([key, url]) => 
      fetch(`${apiHost}${url}`)
        .then(res => res.json())
        .then(data => {
          const val = data.success && Array.isArray(data.data) 
            ? data.data.length 
            : (Array.isArray(data) ? data.length : 0);
          setCounts(prev => ({ ...prev, [key]: val }));
        })
        .catch(err => console.error(`Error fetching ${key}:`, err))
    );

    Promise.all(fetchPromises).finally(() => setLoaded(true));
  }, []);

  const services = [
    { id: "slider", title: "Home Slider", count: counts.slider, icon: <ViewCarouselOutlined />, color: "#3B82F6" },
    { id: "registration", title: "Registration", count: counts.registration, icon: <HowToRegOutlined />, color: "#10B981" },
    { id: "courses", title: "Courses", count: counts.courses, icon: <SchoolOutlined />, color: "#F97316" }, 
    { id: "certificates", title: "Certificates", count: counts.certificates, icon: <VerifiedOutlined />, color: accentGold },
    { id: "offers", title: "Campus Offers", count: counts.offers, icon: <CampaignOutlined />, color: "#F43F5E" },
    { id: "students", title: "Student Queries", count: counts.students, icon: <QuestionAnswerOutlined />, color: "#8B5CF6" },
    { id: "news", title: "Latest News", count: counts.news, icon: <NewspaperOutlined />, color: "#06B6D4" },
    { id: "events", title: "Campus Events", count: counts.events, icon: <EventOutlined />, color: "#F59E0B" },
    { id: "consultation", title: "Consultations", count: counts.consultation, icon: <SupportAgentOutlined />, color: "#EC4899" },
    { id: "faculties", title: "Faculties", count: counts.faculties, icon: <AccountBalanceOutlined />, color: primaryTeal },
    { id: "studentLife", title: "Student Life", count: counts.studentLife, icon: <Diversity1Outlined />, color: "#6366F1" },
    { id: "partners", title: "Our Partners", count: counts.partners, icon: <HandshakeOutlined />, color: "#2DD4BF" },
    { id: "settings", title: "Settings", count: "Active", icon: <SettingsOutlined />, color: "#64748B" }
  ];

  const chartData = services
    .filter(s => s.id !== "settings")
    .map(s => ({
      name: s.title,
      Total: s.count,
      color: s.color
    }));

  return (
    <Box 
      sx={{ 
        direction: "ltr", 
        width: "100%",
        flexGrow: 1,
        mt: "0px",
        maxWidth: "1600px",
        mx: "auto"
      }}
    >
      {/* Header Section */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography 
            variant="h3" 
            fontWeight={800} 
            color={primaryTeal} 
            sx={{ fontFamily: primaryFont, letterSpacing: "-1.5px", mb: 0.5 }}
          >
            Overview
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ fontFamily: primaryFont, fontWeight: 500 }}
          >
            Real-time metrics across all system modules.
          </Typography>
        </Box>

        {/* Live Status Badge */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          bgcolor: '#FFFFFF', 
          px: 2, 
          py: 1, 
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <Circle sx={{ 
            color: '#10B981', 
            fontSize: '10px',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(0.95)', opacity: 0.5 },
              '50%': { transform: 'scale(1.2)', opacity: 1 },
              '100%': { transform: 'scale(0.95)', opacity: 0.5 },
            }
          }}/>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            SYSTEM LIVE
          </Typography>
        </Box>
      </Stack>

      {/* Grid Layout for Cards */}
      <Box 
        sx={{ 
          display: "grid", 
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)"
          },
          gap: 3, 
          mb: 6 
        }}
      >
        {services.map((s, index) => (
          <Fade in={loaded || true} timeout={(index + 1) * 200} key={s.id}>
            <Paper
              elevation={0}
              onClick={() => navigate(`/service-detail/${s.id}`)}
              sx={{
                p: 3,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(226, 232, 240, 0.6)",
                boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.02)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  boxShadow: `0 20px 40px -10px ${s.color}30`,
                  transform: "translateY(-6px)",
                  borderColor: `${s.color}40`,
                  "& .arrow-icon": { 
                    transform: "translateX(4px)", 
                    color: s.color 
                  },
                  "& .icon-wrapper": {
                    bgcolor: s.color,
                    color: "#FFF"
                  }
                }
              }}
            >
              {/* Top Row: Icon & Arrow */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box 
                  className="icon-wrapper"
                  sx={{ 
                    p: 1.5, 
                    borderRadius: "14px", 
                    bgcolor: `${s.color}15`, 
                    color: s.color,
                    display: "flex",
                    transition: "all 0.3s ease"
                  }}
                >
                  {React.cloneElement(s.icon, { sx: { fontSize: 26 } })}
                </Box>
                <ArrowForward className="arrow-icon" sx={{ fontSize: 20, color: "#CBD5E1", transition: "0.3s" }} />
              </Stack>

              {/* Bottom Row: Number & Title */}
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={800} 
                  color="text.primary" 
                  sx={{ fontFamily: primaryFont, lineHeight: 1 }}
                >
                  {s.count}
                </Typography>
                <Typography 
                  variant="caption" 
                  fontWeight={700} 
                  color="text.secondary" 
                  sx={{ 
                    fontFamily: primaryFont,
                    textTransform: "uppercase", 
                    letterSpacing: "1.2px", 
                    display: "block",
                    mt: 1.5,
                    fontSize: "0.7rem"
                  }}
                >
                  {s.title}
                </Typography>
              </Box>
            </Paper>
          </Fade>
        ))}
      </Box>

      {/* Graph Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: "24px", 
          border: "1px solid rgba(226, 232, 240, 0.6)",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.02)",
          bgcolor: "#FFFFFF" 
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight={800} 
          color={primaryTeal} 
          sx={{ fontFamily: primaryFont, mb: 1 }}
        >
          System Analytics
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ fontFamily: primaryFont, mb: 5 }}
        >
          Distribution of records across active modules
        </Typography>
        
        <Box sx={{ width: '100%', height: 420 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600, fontFamily: primaryFont }} 
                angle={-45} 
                textAnchor="end"
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600, fontFamily: primaryFont }}
              />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  fontFamily: primaryFont,
                  fontWeight: 600
                }}
                itemStyle={{ color: primaryTeal }}
              />
              <Bar dataKey="Total" radius={[8, 8, 0, 0]} maxBarSize={50}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default Overview;