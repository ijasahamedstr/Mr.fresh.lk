// Prettified version of the login component
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import BasicLayout from "layouts/authentication/components/BasicLayout";

import bgImage from "assets/images/bg-sign-in-basic.jpeg";

import Swal from "sweetalert2";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const newLogo = "https://i.ibb.co/JRPnDfqQ/cmh6a26eo000h04jmaveg5yzp-removebg-preview.png";

export default function BasicLoginUpdated() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe((s) => !s);
  const toggleShowPassword = () => setShowPassword((s) => !s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");

      Swal.fire({
        title: "Error",
        text: "Please fill in both fields.",
        icon: "error",
        confirmButtonText: "Try Again",
      });

      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_HOST}/Adminlogin`, {
        email,
        password,
      });

      if (response?.data?.token) {
        if (rememberMe) {
          localStorage.setItem("authToken", response.data.token);
        } else {
          sessionStorage.setItem("authToken", response.data.token);
        }

        await Swal.fire({
          title: "Success!",
          text: "You have logged in successfully.",
          icon: "success",
          confirmButtonText: "Continue",
        });

        navigate("/dashboard");
      } else {
        throw new Error("No token returned");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");

      Swal.fire({
        title: "Error",
        text: "Invalid credentials. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card sx={{ maxWidth: 420, width: "100%", mx: 2, px: 1 }}>
        <MDBox
          variant="gradient"
          bgColor="dark"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <MDBox
            sx={{
              width: "140px",
              height: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={newLogo} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%" }} />
          </MDBox>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDTypography variant="caption" color="text">
                Email
              </MDTypography>

              <MDInput
                type="email"
                placeholder="name@example.com"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mt: 1 }}
              />
            </MDBox>

            <MDBox mb={1}>
              <MDTypography variant="caption" color="text">
                Password
              </MDTypography>

              <MDInput
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleShowPassword}
                        edge="end"
                        aria-label="toggle password"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mt: 1 }}
              />
            </MDBox>

            {error && (
              <MDBox mt={1} mb={1}>
                <MDTypography variant="body2" color="error">
                  {error}
                </MDTypography>
              </MDBox>
            )}

            <MDBox display="flex" alignItems="center" justifyContent="space-between" mt={2}>
              <MDBox display="flex" alignItems="center">
                <Switch checked={rememberMe} onChange={handleSetRememberMe} />

                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color="text"
                  onClick={handleSetRememberMe}
                  sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                >
                  &nbsp;&nbsp;Remember me
                </MDTypography>
              </MDBox>

              <MDTypography
                variant="button"
                fontWeight="regular"
                color="info"
                sx={{ cursor: "pointer", userSelect: "none" }}
                onClick={() =>
                  Swal.fire({
                    title: "Reset Password",
                    text: "Please contact admin to reset your password.",
                    icon: "info",
                  })
                }
              >
                Forgot password?
              </MDTypography>
            </MDBox>

            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="dark"
                fullWidth
                type="submit"
                sx={{ py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : "Sign in"}
              </MDButton>
            </MDBox>

            <MDBox mt={2} textAlign="center">
              <MDTypography variant="caption" color="text">
                {"Don't have an account?"}&nbsp;
                <MDTypography
                  component="span"
                  variant="caption"
                  color="info"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/register")}
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}
