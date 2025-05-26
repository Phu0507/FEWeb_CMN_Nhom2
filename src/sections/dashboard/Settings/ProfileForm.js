import React, { useCallback, useState } from "react";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider from "../../../components/hook-form/FormProvider";
import { RHFTextField, RHFUploadAvatar } from "../../../components/hook-form";
import { Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useDispatch, useSelector } from "react-redux";
import { UpdateUserProfile } from "../../../redux/slices/app";

const ProfileForm = () => {
  const dispatch = useDispatch();
  const [file, setFile] = useState();
  const { user } = useSelector((state) => state.app);
  const [initialAvatar, setInitialAvatar] = useState(user?.avatar); // avatar gốc

  const ProfileSchema = Yup.object().shape({
    avatar: Yup.string().required("Avatar is required").nullable(true),
  });

  const defaultValues = {
    fullName: user?.fullName,
    avatar: user?.avatar,
    email: user?.email,
    gender: user?.gender,
    dateOfBirth: new Date(user.dateOfBirth).toLocaleDateString("vi-VN"),
    phoneNumber: user?.phoneNumber || "Chưa cập nhật",
  };

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful, isValid },
  } = methods;

  const values = watch();

  const onSubmit = async (data) => {
    try {
      //   Send API request
      console.log("DATA", data);
      dispatch(
        UpdateUserProfile({
          avatar: file,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setValue("avatar", newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleCancel = () => {
    setFile(undefined); // xóa ảnh mới
    setValue("avatar", initialAvatar); // gán lại avatar gốc
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <RHFUploadAvatar name="avatar" maxSize={3145728} onDrop={handleDrop} />

        <RHFTextField
          name="fullName"
          label="Full Name"
          InputProps={{ readOnly: true }}
        />
        <RHFTextField
          name="email"
          label="Email"
          InputProps={{ readOnly: true }}
        />
        <RHFTextField
          name="gender"
          label="Gender"
          InputProps={{ readOnly: true }}
        />
        <RHFTextField
          name="dateOfBirth"
          label="Date Of Birth"
          InputProps={{ readOnly: true }}
        />
        <RHFTextField
          name="phoneNumber"
          label="Phone Number"
          InputProps={{ readOnly: true }}
          sx={{
            "& .MuiInputBase-input": {
              color:
                !user?.phoneNumber || user.phoneNumber.trim() === ""
                  ? "error.main"
                  : "text.primary",
            },
          }}
        />

        {file && (
          <Stack direction={"row"} justifyContent="end" spacing={2}>
            <LoadingButton
              color="error"
              size="large"
              variant="contained"
              onClick={handleCancel}
            >
              Hủy
            </LoadingButton>
            <LoadingButton
              color="primary"
              size="large"
              type="submit"
              variant="contained"
              disabled={!isValid}
            >
              Save
            </LoadingButton>
          </Stack>
        )}
      </Stack>
    </FormProvider>
  );
};

export default ProfileForm;
