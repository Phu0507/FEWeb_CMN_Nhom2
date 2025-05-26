import React, { useState } from "react";
import * as Yup from "yup";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Typography,
  Link,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import { renameGroup } from "../../redux/slices/conversation";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeSlash } from "phosphor-react";
import { ChangePasswordAPI } from "../../redux/slices/app";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ChangePasswordForm = ({ handleClose }) => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const ChangePasswordSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Vui lòng nhập mật khẩu cũ"),

    newPassword: Yup.string()
      .required("Vui lòng nhập mật khẩu mới")
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),

    confirmNewPassword: Yup.string()
      .required("Vui lòng xác nhận mật khẩu mới")
      .oneOf([Yup.ref("newPassword")], "Mật khẩu xác nhận không khớp"),
  });

  const defaultValues = {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const methods = useForm({
    resolver: yupResolver(ChangePasswordSchema),
    defaultValues,
    mode: "onBlur", // Kích hoạt kiểm tra khi blur
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
    trigger,
  } = methods;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const success = await dispatch(
        ChangePasswordAPI(data.newPassword, data.oldPassword)
      );

      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error("Lỗi không xác định:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Typography variant="body2">
          Mật khẩu mới phải có 8 ký tự trở lên.
        </Typography>
        <RHFTextField
          name="oldPassword"
          label="Old Password"
          onBlur={() => trigger("oldPassword")} // Kiểm tra ngay khi rời trường
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
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
          name="newPassword"
          label="New Password"
          onBlur={() => trigger("newPassword")} // Kiểm tra ngay khi rời trường
          type={showNewPassword ? "text" : "password"}
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <RHFTextField
          name="confirmNewPassword"
          label="Confirm New Password"
          onBlur={() => trigger("confirmNewPassword")} // Kiểm tra ngay khi rời trường
          type={showNewPassword ? "text" : "password"}
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Stack
          spacing={2}
          direction={"row"}
          alignItems="center"
          justifyContent={"end"}
        >
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            disabled={!isValid}
          >
            Confirm
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const ChangePassword = ({ open, handleClose }) => {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      sx={{ p: 4 }}
    >
      <DialogTitle>{"Change Password"}</DialogTitle>
      <DialogContent sx={{ mt: 4 }}>
        <ChangePasswordForm handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassword;
