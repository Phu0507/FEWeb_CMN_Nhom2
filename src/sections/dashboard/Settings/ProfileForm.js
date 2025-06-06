import React, { useCallback, useState, useEffect } from "react";
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

const ProfileForm = ({ showRightPane, setShowRightPane }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState();
  const { user } = useSelector((state) => state.app);
  const { myEmail } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [initialAvatar, setInitialAvatar] = useState(user?.avatar); // avatar gốc

  const ProfileSchema = Yup.object().shape({
    avatar: Yup.string().required("Avatar is required").nullable(true),
  });

  const defaultValues = {
    fullName: user?.fullName,
    avatar: user?.avatar,
    email: myEmail,
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
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || "",
        avatar: user.avatar || "",
        email: myEmail || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
          : "",
        phoneNumber: user.phoneNumber || "Chưa cập nhật",
      });
      setInitialAvatar(user.avatar);
    }
  }, [user, myEmail, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      //   Send API request
      console.log("DATA", data);
      await dispatch(
        UpdateUserProfile({
          avatar: file,
        })
      );
      setFile(undefined); // ẩn nút sau khi cập nhật thành công
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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
              Cancel
            </LoadingButton>
            <LoadingButton
              color="primary"
              size="large"
              type="submit"
              variant="contained"
              disabled={!isValid}
              loading={isLoading}
            >
              Save
            </LoadingButton>
          </Stack>
        )}
        {!file && !showRightPane && (
          <Stack direction={"row"} justifyContent="end" spacing={2}>
            <LoadingButton
              color={"secondary"}
              size="large"
              variant="contained"
              onClick={() => setShowRightPane(true)}
            >
              Update
            </LoadingButton>
          </Stack>
        )}
      </Stack>
    </FormProvider>
  );
};

export default ProfileForm;
