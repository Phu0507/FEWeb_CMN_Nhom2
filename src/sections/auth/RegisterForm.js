import { useState } from "react";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup.js";
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment } from "@mui/material";
import { LoadingButton } from "@mui/lab";
// components
import FormProvider, {
  RHFTextField,
  RHFRadioGroup,
} from "../../components/hook-form";
import { Eye, EyeSlash } from "phosphor-react";
import { useDispatch, useSelector } from "react-redux";
import { RegisterUser } from "../../redux/slices/auth";
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------

export default function AuthRegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    fullName: Yup.string()
      .required("Vui lòng nhập họ tên")
      .min(3, "Họ tên phải có ít nhất 3 ký tự")
      .matches(/^[A-Za-zÀ-ỹ0-9\s]+$/, "Họ tên không được chứa ký tự đặc biệt")
      .matches(
        /^\S.*\S$|^\S{1,2}$/,
        "Họ tên không được bắt đầu hoặc kết thúc bằng dấu cách"
      ),

    dateOfBirth: Yup.date()
      .required("Vui lòng chọn ngày sinh")
      .typeError("Ngày sinh không hợp lệ")
      .max(
        new Date(Date.now() - 86400000),
        "Ngày sinh phải trước ngày hiện tại"
      ),

    gender: Yup.string()
      .oneOf(["male", "female"], "Vui lòng chọn giới tính")
      .required("Vui lòng chọn giới tính"),

    email: Yup.string()
      .required("Vui lòng nhập địa chỉ email")
      .email("Email không hợp lệ"),

    password: Yup.string()
      .required("Vui lòng nhập mật khẩu")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .matches(/^\S*$/, "Mật khẩu không được chứa dấu cách"),

    confirmPassword: Yup.string()
      .required("Vui lòng xác nhận mật khẩu")
      .oneOf([Yup.ref("password")], "Mật khẩu xác nhận không khớp"),
  });

  const defaultValues = {
    fullName: "",
    dateOfBirth: "",
    gender: "male", // or "male"/"female" as default
    email: "",
    password: "",
    confirmPassword: "",
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      // submit data to backend
      dispatch(RegisterUser(data, navigate));
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} mb={4}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}
        <RHFTextField name="fullName" label="Full name" />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <RHFTextField
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            InputLabelProps={{ shrink: true }}
            sx={{ width: { xs: "100%", sm: "300px" } }}
          />
          <RHFRadioGroup
            name="gender"
            label="Gender"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
          />
        </Stack>

        <RHFTextField name="email" label="Email address" />

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <RHFTextField
          name="confirmPassword"
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isLoading}
        sx={{
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
        Create Account
      </LoadingButton>
    </FormProvider>
  );
}
