import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";

// @mui icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CollectionsIcon from "@mui/icons-material/Collections";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import LogoutIcon from "@mui/icons-material/Logout";

// Slider
import SliderSectionView from "layouts/Slider-section";
import AddSlider from "layouts/Slider-section/AddSlider";
import EditSlider from "layouts/Slider-section/EditSlider";

// Inquiry & Request
import InquirySectionView from "layouts/Inquire Here";
import RequestServicesView from "layouts/Request Service";

// OTT Service
import OttServiceGridView from "layouts/OTT-Service";

// Categories
import CategoriesAdmin from "layouts/Categories";
import AddCategory from "layouts/Categories/AddCategory";
import EditCategory from "layouts/Categories/EditCategory";
import Products from "layouts/All-Products";
import AddProduct from "layouts/All-Products/AddProducts";
import EditProduct from "layouts/All-Products/EditCategory";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <DashboardIcon />,
    route: "/dashboard",
    component: <Dashboard />,
  },

  {
    type: "collapse",
    name: "Slider Section",
    key: "slider-section",
    icon: <ViewCarouselIcon />,
    collapse: [
      {
        type: "collapse",
        name: "All Sliders",
        key: "slider-list",
        icon: <CollectionsIcon />,
        route: "/Slider-section",
        component: <SliderSectionView />,
      },
      {
        type: "collapse",
        name: "Add Slider",
        key: "slider-add",
        icon: <AddPhotoAlternateIcon />,
        route: "/AddSlider",
        component: <AddSlider />,
      },
    ],
  },

  {
    type: "collapse",
    name: "Inquire Section",
    key: "inquire-section",
    icon: <SupportAgentIcon />,
    route: "/Inquire-section",
    component: <InquirySectionView />,
  },

  {
    type: "collapse",
    name: "Request Service",
    key: "request-service",
    icon: <MiscellaneousServicesIcon />,
    route: "/Request-Service",
    component: <RequestServicesView />,
  },

  {
    type: "collapse",
    name: "Products",
    key: "products",
    icon: <Inventory2Icon />,
    collapse: [
      {
        type: "collapse",
        name: "All Products",
        key: "products-list",
        icon: <StorefrontIcon />,
        route: "/Products",
        component: <Products />,
      },
      {
        type: "collapse",
        name: "Category",
        key: "categories-list",
        icon: <CategoryIcon />,
        route: "/Categories",
        component: <CategoriesAdmin />,
      },
      {
        type: "collapse",
        name: "Discounts",
        key: "discounts-list",
        icon: <LocalOfferIcon />,
        route: "/Discounts",
        component: <CategoriesAdmin />,
      },
    ],
  },

  {
    type: "collapse",
    name: "OTT Service",
    key: "ott-service",
    icon: <LiveTvIcon />,
    collapse: [
      {
        type: "collapse",
        name: "All OTT Services",
        key: "ott-list",
        icon: <SubscriptionsIcon />,
        route: "/OTT-Service",
        component: <OttServiceGridView />,
      },
    ],
  },

  {
    type: "collapse",
    name: "Sign Out",
    key: "sign-in",
    icon: <LogoutIcon />,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },

  {
    route: "/AddCategory",
    component: <AddCategory />,
  },
  {
    route: "/AddProducts",
    component: <AddProduct />,
  },
  {
    route: "/EditSlider/:id",
    component: <EditSlider />,
  },
  {
    route: "/EditCategory/:id",
    component: <EditCategory />,
  },
  {
    route: "/EditProduct/:id",
    component: <EditProduct />,
  },
];

export default routes;
