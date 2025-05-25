import { Link as RouterLink } from "react-router-dom";
// sections
import { Stack, Typography, Link } from "@mui/material";
import AuthSocial from "../../sections/auth/AuthSocial";
import Login from "../../sections/auth/LoginForm";
import VerifyForm from "../../sections/auth/VerifyForm";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------

export default function LoginPage() {
  const { email, otpType } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu otpType rỗng, không cho vào trang này
    if (!otpType) {
      navigate("/auth/login");
    }
  }, [otpType, navigate]);

  const getHeading = () => {
    switch (otpType) {
      case "register":
        return "Please Verify Your Email";
      case "login":
        return "Login via OTP";
      case "forgot":
        return "Reset Password - OTP Verification";
      default:
        return "Please Verify OTP";
    }
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 6) {
      return "***@" + domain;
    }
    const firstPart = localPart.slice(0, 3);
    const lastPart = localPart.slice(-3);
    const maskedLength = localPart.length - 6;
    const masked = "*".repeat(maskedLength);
    return `${firstPart}${masked}${lastPart}@${domain}`;
  };

  return (
    <>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h4">{getHeading()}</Typography>
        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2">
            Sent to email ({maskEmail(email)})
          </Typography>
        </Stack>
      </Stack>
      {/* Form */}
      <VerifyForm />
    </>
  );
}
