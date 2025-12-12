import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ComplexStatisticsCard({ color, title, count, icon }) {
  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" pt={1} px={2}>
        <MDBox
          variant="gradient"
          bgColor={color}
          color={color === "light" ? "dark" : "white"}
          coloredShadow={color}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
          mt={-3}
        >
          {/* Update: Added sx prop to set the Icon's size */}
          <Icon fontSize="small" sx={{ width: "2em", height: "2em" }}>
            {icon}
          </Icon>
        </MDBox>
        <MDBox textAlign="right" lineHeight={1.25}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {title}
          </MDTypography>
          <MDTypography variant="h4">{count}</MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Default color is set to 'info' if not provided by the parent component
ComplexStatisticsCard.defaultProps = {
  color: "info",
};

// PropTypes validation for the component props
ComplexStatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
    "LightCoral",
    "DarkRed",
    "Crimson",
    "coral",
    "red",
    "green",
    "blue",
    "yellow",
    "purple",
    "orange",
    "pink",
    "brown",
    "gray",
    "white",
    "black",
    "navy",
    "teal",
    "indigo",
    "violet",
    "gold",
    "silver",
    "peach",
    "mint",
    "salmon",
    "beige",
    "turquoise",
    "chartreuse",
    "azure",
    "lavender",
    "fuchsia",
    "cyan",
    "maroon",
    "olive",
    "khaki",
    "plum",
    "orchid",
    "tan",
    "lavenderBlush",
    "seashell",
    "snow",
    "antiquewhite",
    "linen",
    "lightgreen",
    "mediumvioletred",
    "mediumseagreen",
    "midnightblue",
    "dodgerblue",
    "slateblue",
    "mediumslateblue",
    "crimson",
  ]),
  title: PropTypes.string.isRequired, // Title is a required string
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Count can be a string or number
  icon: PropTypes.node.isRequired, // Icon is required to be a React node (JSX element)
};

export default ComplexStatisticsCard;
