import { useEffect, useState } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Collapse from "@mui/material/Collapse";
import Icon from "@mui/material/Icon";

// Material Dashboard components
import MDBox from "components/MDBox";

// Example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles
import SidenavRoot from "examples/Sidenav/SidenavRoot";

// Context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

const newLogo = "https://i.ibb.co/JRPnDfqQ/cmh6a26eo000h04jmaveg5yzp-removebg-preview.png";

function Sidenav({ routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

  const location = useLocation();
  const pathname = location.pathname;

  const [openCollapse, setOpenCollapse] = useState({});

  /* ================= AUTO OPEN ACTIVE SUB MENU ================= */
  useEffect(() => {
    const state = {};
    routes.forEach((route) => {
      route.collapse?.forEach((sub) => {
        if (sub.route === pathname) {
          state[route.key] = true;
        }
      });
    });
    setOpenCollapse(state);
  }, [pathname, routes]);

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    function handleResize() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, transparentSidenav, whiteSidenav]);

  /* ================= RENDER ROUTES ================= */
  const renderRoutes = (routesArray, level = 0) =>
    routesArray.map(({ type, name, icon, key, href, route, collapse }) => {
      if (type !== "collapse") return null;

      const hasSubMenu = Boolean(collapse);
      const isOpen = openCollapse[key];

      const toggle = () => {
        if (hasSubMenu) {
          setOpenCollapse((prev) => ({ ...prev, [key]: !prev[key] }));
        }
      };

      return (
        <MDBox key={key}>
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            onClick={toggle}
            sx={{ cursor: hasSubMenu ? "pointer" : "default" }}
          >
            {href ? (
              <Link href={href} target="_blank" sx={{ flex: 1, textDecoration: "none" }}>
                <SidenavCollapse name={name} icon={icon} active={pathname === route} />
              </Link>
            ) : route && !hasSubMenu ? (
              <NavLink to={route} style={{ flex: 1 }}>
                <SidenavCollapse name={name} icon={icon} active={pathname === route} />
              </NavLink>
            ) : (
              <SidenavCollapse name={name} icon={icon} />
            )}

            {/* ===== Arrow Icon ===== */}
            {hasSubMenu && (
              <Icon
                sx={{
                  fontSize: "1rem",
                  mr: 2,
                  transition: "transform 0.25s ease",
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  opacity: 0.7,
                }}
              >
                chevron_right
              </Icon>
            )}
          </MDBox>

          {/* ===== SUB MENU ===== */}
          {hasSubMenu && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List sx={{ pl: level === 0 ? 4 : 6 }}>{renderRoutes(collapse, level + 1)}</List>
            </Collapse>
          )}
        </MDBox>
      );
    });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      {/* LOGO */}
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox component={NavLink} to="/">
          <img src={newLogo} alt="Logo" style={{ width: 120 }} />
        </MDBox>
      </MDBox>

      <Divider />

      {/* MENU */}
      <List>{renderRoutes(routes)}</List>
    </SidenavRoot>
  );
}

Sidenav.propTypes = {
  routes: PropTypes.array.isRequired,
};

export default Sidenav;
