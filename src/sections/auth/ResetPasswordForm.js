import * as Yup from "yup";
// form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
// components
import FormProvider, { RHFTextField } from "../../components/hook-form";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { ForgotPassword, LoginWithOTP } from "../../redux/slices/auth";
import { LoadingButton } from "@mui/lab";
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------

export default function AuthResetPasswordForm({ mode }) {
  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
  });

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { email: "" },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data) => {
    try {
      if (mode === "login-otp") {
        dispatch(LoginWithOTP(data, navigate));
      } else if (mode === "reset-password") {
        dispatch(ForgotPassword(data, navigate));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <RHFTextField name="email" label="Email address" />

      <LoadingButton
        loading={isLoading}
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        sx={{
          mt: 3,
          bgcolor: "text.primary",
          color: (theme) =>
            theme.palette.mode === "light" ? "common.white" : "grey.800",
          "&:hover": {
            bgcolor: "text.primary",
            color: (theme) =>
              theme.palette.mode === "light" ? "common.white" : "grey.800",
          },
        }}
      >
        Send Request
      </LoadingButton>
    </FormProvider>
  );
}
