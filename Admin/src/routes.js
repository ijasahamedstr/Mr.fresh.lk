import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";

// @mui icons
import Icon from "@mui/material/Icon";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import SliderSectionView from "layouts/Slider-section";
import AddSlider from "layouts/Slider-section/AddSlider";
import EditSlider from "layouts/Slider-section/EditSlider";
import InquirySectionView from "layouts/Inquire Here";
import RequestServicesView from "layouts/Request Service";
import CourseSectionView from "layouts/Course";
import AddCourse from "layouts/Course/Addcoures";
import EditCourse from "layouts/Course/Editcoures";
import OttServiceGridView from "layouts/OTT-Service";
import AddOTTService from "layouts/OTT-Service/Add-ott-Service";
import EditOttService from "layouts/OTT-Service/Edit-ott-Service";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Slider section",
    key: "Slider-section",
    icon: <CardGiftcardIcon />,
    route: "/Slider-section",
    component: <SliderSectionView />,
  },
  {
    type: "collapse",
    name: "Inquire section",
    key: "Inquire-section",
    icon: <CardGiftcardIcon />,
    route: "/Inquire-section",
    component: <InquirySectionView />,
  },
  {
    type: "collapse",
    name: "Request Service",
    key: "Request-Service",
    icon: <CardGiftcardIcon />,
    route: "/Request-Service",
    component: <RequestServicesView />,
  },
  {
    type: "collapse",
    name: "Course",
    key: "Course",
    icon: <CardGiftcardIcon />,
    route: "/Course",
    component: <CourseSectionView />,
  },
  {
    type: "collapse",
    name: "OTT Service",
    key: "OTT-Service",
    icon: <CardGiftcardIcon />,
    route: "/OTT-Service",
    component: <OttServiceGridView />,
  },
  {
    type: "collapse",
    name: "Sign Out",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    route: "/AddSlider",
    component: <AddSlider />,
  },
  {
    route: "/Addcoures",
    component: <AddCourse />,
  },
  {
    route: "/AddOTT",
    component: <AddOTTService />,
  },
  {
    route: "/Editcoures/:id",
    component: <EditCourse />,
  },
  {
    route: "/EditSlider/:id",
    component: <EditSlider />,
  },
  {
    route: "/EditOTT/:id",
    component: <EditOttService />,
  },
];

export default routes;
