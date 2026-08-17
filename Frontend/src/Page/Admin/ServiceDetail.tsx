import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Stack, Paper, Button } from "@mui/material";
import { 
  ArrowForward, 
  HomeWorkOutlined, 
  ShoppingBagOutlined, 
  VpnKeyOutlined, 
  FormatPaintOutlined 
} from "@mui/icons-material";

type ServiceId = "sale" | "buying" | "rental" | "finishing";

interface ServiceInfo {
  title: string;
  color: string;
  icon: React.ReactElement<any>;
}

const serviceConfig: Record<ServiceId, ServiceInfo> = {
  sale: { title: "بيع العقار", color: "#10B981", icon: <HomeWorkOutlined /> },
  buying: { title: "شراء العقار", color: "#CC9D2F", icon: <ShoppingBagOutlined /> },
  rental: { title: "إيجار العقار", color: "#3B82F6", icon: <VpnKeyOutlined /> },
  finishing: { title: "تشطيب العقار", color: "#8B5CF6", icon: <FormatPaintOutlined /> }
};

const ServiceDetail: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const isValidId = (id: any): id is ServiceId => id in serviceConfig;
  const service = isValidId(serviceId) ? serviceConfig[serviceId] : null;

  if (!service) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', direction: "rtl" }}>
        <Typography variant="h6" color="error" fontFamily="Tajawal">القسم غير موجود</Typography>
        <Button onClick={() => navigate("/dashboard")}>العودة للوحة التحكم</Button>
      </Box>
    );
  }

  return (
    <>
     <Box sx={{ direction: "rtl", p: 4 }}>
      {/* التعديل هنا: التوجه إلى مسار /dashboard عند الضغط */}
      <Button 
        startIcon={<ArrowForward sx={{ ml: 1 }} />} 
        onClick={() => navigate("/dashboard")} 
        sx={{ 
          mb: 4, 
          fontWeight: 700, 
          color: "#004652", 
          fontFamily: "Tajawal",
          "&:hover": { bgcolor: "rgba(0, 70, 82, 0.05)" }
        }}
      >
        العودة للوحة التحكم
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: "40px", border: "1px solid #E2E8F0" }}>
        <Stack direction="row" spacing={3} alignItems="center" mb={6}>
          <Box sx={{ 
            width: 80, height: 80, 
            bgcolor: `${service.color}15`, borderRadius: "24px", 
            display: "flex", justifyContent: "center", alignItems: "center", 
            color: service.color 
          }}>
            {React.cloneElement(service.icon, { sx: { fontSize: 40 } })}
          </Box>
          <Box>
            <Typography variant="h3" fontWeight={900} color="#004652" fontFamily="Tajawal">
              {service.title}
            </Typography>
            <Typography color="#64748B" fontFamily="Tajawal">إدارة جميع الطلبات والبيانات</Typography>
          </Box>
        </Stack>

        <Box sx={{ 
          minHeight: "400px", 
          border: "2px dashed #E2E8F0", 
          borderRadius: "30px", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          bgcolor: '#fafafa' 
        }}>
           <Typography color="#94A3B8" fontFamily="Tajawal">
             سيتم عرض جدول البيانات الخاص بـ {service.title} هنا
           </Typography>
        </Box>
      </Paper>
    </Box>
    </>
  );
};

export default ServiceDetail;