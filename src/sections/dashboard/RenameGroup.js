import React from "react";
import * as Yup from "yup";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Typography,
} from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import { renameGroup } from "../../redux/slices/conversation";
import { useDispatch, useSelector } from "react-redux";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const RenameGroupForm = ({ handleClose, groupName, onRename, chatId }) => {
  const RenameGroupSchema = Yup.object().shape({
    newName: Yup.string()
      .trim("Không được chứa khoảng trắng đầu hoặc cuối")
      .strict(true)
      .required("Tên nhóm không được để trống"),
  });

  const defaultValues = {
    newName: groupName || "",
  };

  const methods = useForm({
    resolver: yupResolver(RenameGroupSchema),
    defaultValues,
    mode: "onBlur", // Kích hoạt kiểm tra khi blur
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
    trigger,
  } = methods;

  const onSubmit = async (data) => {
    try {
      onRename(data.newName.trim(), chatId); // Cẩn thận vẫn trim lại
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Typography variant="body2">
          Bạn có chắc chắn muốn đổi tên nhóm, khi xác nhận tên nhóm mới sẽ hiển
          thị với tất cả thành viên.
        </Typography>
        <RHFTextField
          name="newName"
          label="New Group Name"
          onBlur={() => trigger("newName")} // Kiểm tra ngay khi rời trường
        />
        <Stack
          spacing={2}
          direction={"row"}
          alignItems="center"
          justifyContent={"end"}
        >
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !isValid}
          >
            Confirm
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const RenameGroup = ({ open, handleClose, groupName, chatId }) => {
  const dispatch = useDispatch();
  const handleRename = (newName) => {
    console.log("Tên nhóm mới:", newName);
    dispatch(renameGroup(newName, chatId));
    // Gọi API hoặc cập nhật state tại đây
    // Ví dụ: updateGroupNameAPI(newName).then(...)

    handleClose(); // Đóng dialog sau khi đổi tên
  };
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
      <DialogTitle>{"Rename Group"}</DialogTitle>
      <DialogContent sx={{ mt: 4 }}>
        <RenameGroupForm
          handleClose={handleClose}
          groupName={groupName}
          chatId={chatId}
          onRename={handleRename}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RenameGroup;
