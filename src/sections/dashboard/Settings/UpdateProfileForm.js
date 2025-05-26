import React, { useCallback, useState } from "react";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "../../../components/hook-form/FormProvider";
import { RHFTextField, RHFRadioGroup } from "../../../components/hook-form";
import { Stack, Alert } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useDispatch, useSelector } from "react-redux";
import { UpdateUserProfile } from "../../../redux/slices/app";
import ConfirmDialog from "./ConfirmDialog";

const UpdateProfileForm = ({ setShowRightPane }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.app);
  const [isLoading, setIsLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

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

    phoneNumber: Yup.string().required("Hãy cập nhật số điện thoại"),
  });

  const defaultValues = {
    fullName: user?.fullName || "",
    dateOfBirth: user?.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0] // format YYYY-MM-DD
      : "",
    gender: user?.gender || "",
    phoneNumber: user?.phoneNumber || "",
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
    formState: { errors, isValid, isDirty },
  } = methods;

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      //   Send API request
      console.log("DATA", data);
      await dispatch(
        UpdateUserProfile({
          fullName: data.fullName,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          phoneNumber: data.phoneNumber,
        })
      );
      setShowRightPane(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleConfirmCancel = () => {
    setOpenConfirm(false);
    setShowRightPane(false);
  };

  const handleCloseDialog = () => {
    setOpenConfirm(false);
  };

  const handleCancel = () => {
    if (isDirty) {
      setOpenConfirm(true);
    } else {
      setShowRightPane(false);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} mb={4}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}

        <RHFTextField name="fullName" label="Full name" />
        <RHFRadioGroup
          name="gender"
          label="Gender"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
        />
        <RHFTextField
          name="dateOfBirth"
          label="Date of Birth"
          type="date"
          InputLabelProps={{ shrink: true }}
          sx={{ width: { xs: "100%", sm: "500px" } }}
        />

        <RHFTextField name="phoneNumber" label="Phone Number" />
      </Stack>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <LoadingButton
          variant="contained"
          color="error"
          size="large"
          onClick={handleCancel}
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          disabled={!isValid || !isDirty}
          loading={isLoading}
        >
          Update
        </LoadingButton>
      </Stack>
      <ConfirmDialog
        open={openConfirm}
        title="Xác nhận hủy"
        content="Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn hủy?"
        onClose={handleCloseDialog}
        onConfirm={handleConfirmCancel}
      />
    </FormProvider>
  );
};

export default UpdateProfileForm;
