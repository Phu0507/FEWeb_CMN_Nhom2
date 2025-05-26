import { Stack, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import React from "react";
import { CaretLeft } from "phosphor-react";
import AuthResetPasswordForm from "../../sections/auth/ResetPasswordForm";

const LoginWithOTP = () => {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h3" paragraph>
          Login with OTP
        </Typography>

        <Typography sx={{ color: "text.secondary", mb: 5 }}>
          Please enter the email address associated with your account. We will
          send you a One-Time Password (OTP) to verify your login.
        </Typography>
      </Stack>

      <AuthResetPasswordForm mode="login-otp" />

      <Link
        component={RouterLink}
        to={"/auth/login"}
        color="inherit"
        variant="subtitle2"
        sx={{
          mt: 3,
          mx: "auto",
          alignItems: "center",
          display: "inline-flex",
        }}
      >
        <CaretLeft size={24} />
        Return to login with password
      </Link>
    </>
  );
};

export default LoginWithOTP;
