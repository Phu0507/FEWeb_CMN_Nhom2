import { Stack, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import React from "react";
import { CaretLeft } from "phosphor-react";
import AuthResetPasswordForm from "../../sections/auth/ResetPasswordForm";

const ResetPassword = () => {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h3" paragraph>
          Forgot your password?
        </Typography>

        <Typography sx={{ color: "text.secondary", mb: 5 }}>
          Please enter the email address associated with your account and we
          will send you an OTP code to authenticate your password reset.
        </Typography>
      </Stack>

      {/* Reset Password Form */}
      <AuthResetPasswordForm mode="reset-password" />

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
        Return to login
      </Link>
    </>
  );
};

export default ResetPassword;
