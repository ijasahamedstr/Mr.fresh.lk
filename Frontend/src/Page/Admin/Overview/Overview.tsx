import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Paper, Divider } from "@mui/material";
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
  SchoolOutlined
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

  // THIS IS YOUR CONNECTION TO THE BACKEND / DATABASE
  useEffect(() => {
    const apiHost = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Fallback added for testing
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

    Object.entries(endpoints).forEach(([key, url]) => {
      fetch(`${apiHost}${url}`)
        .then(res => res.json())
        .then(data => {
          // Robust data length checking
          const val = data.success && Array.isArray(data.data) 
            ? data.data.length 
            : (Array.isArray(data) ? data.length : 0);
          
          setCounts(prev => ({ ...prev, [key]: val }));
        })
        .catch(err => console.error(`Error fetching ${key}:`, err));
    });
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

  // Prepare data for the Graph (Exclude "Settings" since it's just "Active")
  const chartData = services
    .filter(s => s.id !== "settings")
    .map(s => ({
      name: s.title,
      Total: s.count,
      color: s.color
    }));

  return (
    <Box sx={{ 
      direction: "ltr", 
      width: "100%", 
      p: { xs: 2, md: 4 }, 
      bgcolor: "#F8FAFC",
      minHeight: "100vh" 
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          fontWeight={800} 
          color={primaryTeal} 
          sx={{ fontFamily: primaryFont, letterSpacing: "-1px" }}
        >
          Dashboard
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ fontFamily: primaryFont, mt: 1 }}
        >
          Real-time metrics across all system modules.
        </Typography>
      </Box>

      {/* Grid Layout for Cards */}
      <Box 
        sx={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "20px", 
          justifyContent: "flex-start",
          mb: 6 // Added margin below cards
        }}
      >
        {services.map((s) => (
          <Box 
            key={s.id}
            sx={{ 
              width: {
                xs: "100%",                  
                sm: "calc(50% - 10px)",          
                md: "calc(33.33% - 14px)",       
                lg: "calc(20% - 16px)"           
              },
              flexGrow: 0,
              flexShrink: 0
            }}
          >
            <Paper
              elevation={0}
              onClick={() => navigate(`/service-detail/${s.id}`)}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                "&:hover": {
                  borderColor: s.color,
                  boxShadow: `0 12px 24px -10px ${s.color}40`,
                  transform: "translateY(-5px)",
                  "& .arrow-icon": { 
                    transform: "translateX(4px)", 
                    color: s.color 
                  }
                }
              }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: "12px", 
                      bgcolor: `${s.color}10`, 
                      color: s.color,
                      display: "flex"
                    }}
                  >
                    {React.cloneElement(s.icon, { sx: { fontSize: 28 } })}
                  </Box>
                  <ArrowForward className="arrow-icon" sx={{ fontSize: 20, color: "#CBD5E1", transition: "0.3s" }} />
                </Stack>

                <Typography 
                  variant="body2" 
                  fontWeight={700} 
                  color="text.secondary" 
                  sx={{ 
                    fontFamily: primaryFont,
                    textTransform: "uppercase", 
                    letterSpacing: "1px", 
                    mb: 0.5, 
                    fontSize: "0.7rem" 
                  }}
                >
                  {s.title}
                </Typography>
                
                <Typography 
                  variant="h4" 
                  fontWeight={800} 
                  color={primaryTeal} 
                  sx={{ fontFamily: primaryFont }}
                >
                  {s.count}
                </Typography>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2, opacity: 0.6 }} />
                <Typography 
                  variant="caption" 
                  color="text.disabled" 
                  fontWeight={600} 
                  sx={{ fontFamily: primaryFont }}
                >
                  TOTAL RECORDS
                </Typography>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* NEW: Graph Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: "20px", 
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF" 
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight={700} 
          color={primaryTeal} 
          sx={{ fontFamily: primaryFont, mb: 4 }}
        >
          System Overview Graph
        </Typography>
        
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }} 
                angle={-45} 
                textAnchor="end"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="Total" radius={[4, 4, 0, 0]}>
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