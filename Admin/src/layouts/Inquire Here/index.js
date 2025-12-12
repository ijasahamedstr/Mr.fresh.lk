import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import CircularProgress from "@mui/material/CircularProgress";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

/* ---------------- Helper components ---------------- */
const Author = ({ name, style }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1}>
    <MDBox ml={2} lineHeight={1}>
      <MDTypography variant="button" fontWeight="medium" style={style}>
        {name}
      </MDTypography>
    </MDBox>
  </MDBox>
);

Author.propTypes = {
  name: PropTypes.string.isRequired,
  style: PropTypes.object,
};

Author.defaultProps = {
  style: {},
};

const SubText = ({ text }) => (
  <MDBox lineHeight={1} textAlign="left">
    <MDTypography variant="caption" color="text" fontWeight="medium">
      {text}
    </MDTypography>
  </MDBox>
);

SubText.propTypes = {
  text: PropTypes.string.isRequired,
};

/* ---------------- Component ---------------- */
function InquirySectionView() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = process.env.REACT_APP_API_HOST || "";

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiBase}/inquiry`);
        const data = response?.data;
        if (mounted) {
          if (Array.isArray(data)) {
            // newest first
            setInquiries(data.slice().reverse());
          } else {
            setInquiries([]);
            // eslint-disable-next-line no-console
            console.warn("/inquiry returned non-array:", data);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching inquiries:", err);
        if (mounted) setError("Failed to fetch inquiries.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [apiBase]);

  const columns = [
    { Header: "Name", accessor: "Name", width: "25%", align: "left" },
    { Header: "Mobile", accessor: "Mobile", width: "20%", align: "left" },
    { Header: "Inquiry Type", accessor: "Type", width: "20%", align: "left" },
    { Header: "Order No.", accessor: "OrderNo", width: "15%", align: "left" },
    { Header: "Order Date", accessor: "OrderDate", width: "20%", align: "left" },
  ];

  const rows = inquiries.map((item) => ({
    Name: (
      <Author
        name={item.name || "—"}
        style={{ fontFamily: "Tajawal, sans-serif", fontSize: "15px" }}
      />
    ),
    Mobile: <SubText text={item.mobile || "—"} />,
    Type: <SubText text={item.inquirytype || "—"} />,
    OrderNo: <SubText text={item.ordernumber || "—"} />,
    OrderDate: <SubText text={item.orderdate || "—"} />,
  }));

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          pt={6}
          pb={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography color="error" variant="h6" align="center">
            {error}
          </MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
              >
                <MDTypography variant="h6" color="white">
                  Inquiries
                </MDTypography>
              </MDBox>

              <MDBox pt={3}>
                {inquiries.length === 0 ? (
                  <MDBox p={4} textAlign="center">
                    <MDTypography variant="h6">No inquiries found.</MDTypography>
                    <MDTypography variant="caption" color="text">
                      Click &quot;Add New&quot; to create the first inquiry.
                    </MDTypography>
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={8}
                    showTotalEntries
                    pagination
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default InquirySectionView;
