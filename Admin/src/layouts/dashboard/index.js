import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import React, { useState, useEffect } from "react";

function Dashboard() {
  const [Promotionalgifts, setPromotionalgifts] = useState([]);
  const [Printingdepartment, setPrintingdepartment] = useState([]);
  const [Screensdepartment, setScreensdepartment] = useState([]);
  const [ArabicCalligraphy, setArabicCalligraphy] = useState([]);
  const [Socialmedia, setSocialmedia] = useState([]);
  const [MediaCommunicationsphoto, setMediaCommunicationsphoto] = useState([]);
  const [MediaCommunicationsvideo, setMediaCommunicationsvideo] = useState([]);
  const [News, setNews] = useState([]);
  const [Partner, setPartner] = useState([]);

  useEffect(() => {
    // Fetch data from the API (replace with your actual API endpoint)
    fetch(`${process.env.REACT_APP_API_HOST}/Promotionalgifts`)
      .then((response) => response.json())
      .then((data) => {
        setPromotionalgifts(data); // Store the fetched data in the state
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the API (replace with your actual API endpoint)
    fetch(`${process.env.REACT_APP_API_HOST}/Printingdepartment`)
      .then((response) => response.json())
      .then((data) => {
        setPrintingdepartment(data); // Store the fetched data in the state
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the API (replace with your actual API endpoint)
    fetch(`${process.env.REACT_APP_API_HOST}/Screensdepartment`)
      .then((response) => response.json())
      .then((data) => {
        setScreensdepartment(data); // Store the fetched data in the state
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the API (replace with your actual API endpoint)
    fetch(`${process.env.REACT_APP_API_HOST}/ArabicCalligraphy`)
      .then((response) => response.json())
      .then((data) => {
        setArabicCalligraphy(data); // Store the fetched data in the state
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the API (replace with your actual API endpoint)
    fetch(`${process.env.REACT_APP_API_HOST}/Socialmedia`)
      .then((response) => response.json())
      .then((data) => {
        setSocialmedia(data); // Store the fetched data in the state
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the API (replace with your actual API endpoint)
    fetch(`${process.env.REACT_APP_API_HOST}/MediaCommunicationsphoto`)
      .then((response) => response.json())
      .then((data) => {
        setMediaCommunicationsphoto(data); // Store the fetched data in the state
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the API (replace with your actual API endpoint)
    fetch(`${process.env.REACT_APP_API_HOST}/MediaCommunicationsvideo`)
      .then((response) => response.json())
      .then((data) => {
        setMediaCommunicationsvideo(data); // Store the fetched data in the state
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the API (replace with your actual API endpoint)
    fetch(`${process.env.REACT_APP_API_HOST}/News`)
      .then((response) => response.json())
      .then((data) => {
        setNews(data); // Store the fetched data in the state
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch data from the API (replace with your actual API endpoint)
    fetch(`${process.env.REACT_APP_API_HOST}/Partner`)
      .then((response) => response.json())
      .then((data) => {
        setPartner(data); // Store the fetched data in the state
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Promotional gifts section */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                title="Promotional gifts section"
                count={Promotionalgifts.length} // Set the count to 0 or dynamic if required
                color="primary"
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
                icon={
                  <img
                    src="https://i.ibb.co/HdgVtF5/image.webp"
                    alt="Promotional Gifts"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }} // Set size and fit the image
                  />
                }
              />
            </MDBox>
          </Grid>

          {/* Printing section */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/dmvyMMn/image-1.webp"
                    alt="Printing"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                title="Printing section"
                count={Printingdepartment.length}
                color="warning"
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>

          {/* Department of Fine Arts section */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/LP17MwP/image-6.webp"
                    alt="Fine Arts"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                color="success"
                title="Department of Fine Arts section"
                count="0"
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>

          {/* Screens section */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/dmvyMMn/image-1.webp"
                    alt="Screens"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                color="error"
                title="Screens section"
                count={Screensdepartment.length}
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>

          {/* Department of Arabic Calligraphy section */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/5vHKmx1/image-2.webp"
                    alt="Calligraphy"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                title="Department of Arabic Calligraphy section"
                count={ArabicCalligraphy.length} // Fallback to 0 if citiesCount is invalid
                color="info"
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>

          {/* Software department section */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/DDCFSm4/image-3.webp"
                    alt="Software"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                title="Software department section"
                count={0}
                color="primary"
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>

          {/* Social media section */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/K5khVnQ/image-4.webp"
                    alt="Social Media"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                title="Social media section"
                count={Socialmedia.length}
                color="secondary"
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>

          {/* Media and Communications Department */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/8BD4CKD/image-5.webp"
                    alt="Media & Communications"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                color="success"
                title="Media and Communications Photo"
                count={MediaCommunicationsphoto.length}
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/fdzHCnPG/67f3c789-8e2f-4ca3-aee6-e3db66af1c6f-removalai-preview.png"
                    alt="Media & Communications"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                color="success"
                title="Media and Communications Video"
                count={MediaCommunicationsvideo.length}
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/NgXxvg9P/58583b7c-7c76-4f85-82b0-3e9fdf165d74-removalai-preview.png"
                    alt="News"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                color="error"
                title="News section"
                count={News.length}
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // Replacing icon with an image
                icon={
                  <img
                    src="https://i.ibb.co/7J7PSj28/2dfdbf59-c33c-4ca6-ae20-a6b6a1f40559-removalai-preview.png"
                    alt="Calligraphy"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                }
                title="Partner section"
                count={Partner.length} // Fallback to 0 if citiesCount is invalid
                color="info"
                sx={{ fontSize: "1.2rem" }} // Setting font size for the count text
              />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
