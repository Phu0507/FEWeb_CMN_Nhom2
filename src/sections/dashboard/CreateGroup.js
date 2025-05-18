import React, { useState } from "react";
import * as Yup from "yup";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import axios from "../../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { createGroup } from "../../redux/slices/conversation";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TAGS_OPTION = [
  "Toy Story 3",
  "Logan",
  "Full Metal Jacket",
  "Dangal",
  "The Sting",
  "2001: A Space Odyssey",
  "Singin' in the Rain",
  "Toy Story",
  "Bicycle Thieves",
  "The Kid",
  "Inglourious Basterds",
  "Snatch",
  "3 Idiots",
];

const CreateGroupForm = ({ handleClose }) => {
  const [options, setOptions] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const fetchMembers = async (keyword) => {
    try {
      const response = await axios.get(`/users?search=${keyword}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("data", response.data);
      setOptions(response.data || []);
    } catch (error) {
      console.error("Lỗi fetch members:", error);
      setOptions([]);
    }
  };
  const NewGroupSchema = Yup.object().shape({
    title: Yup.string()
      .trim("Không được chứa khoảng trắng đầu hoặc cuối")
      .strict(true)
      .required("Tên nhóm không được để trống"),

    members: Yup.array().min(2, "Phải có ít nhất 2 thành viên"),
  });

  const defaultValues = {
    title: "",

    members: [],
  };

  const methods = useForm({
    resolver: yupResolver(NewGroupSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const onSubmit = (data) => {
    dispatch(createGroup(data.title, data.members));
    console.log(data.title, data.members);
    handleClose();
    reset();
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="title" label="Title" />
        <RHFAutocomplete
          name="members"
          label="Members"
          multiple
          freeSolo
          options={options}
          onInputChange={(event, value, reason) => {
            if (reason === "input") {
              if (value.trim() === "") {
                setOptions([]); // Xóa kết quả gợi ý khi input rỗng
              } else {
                fetchMembers(value);
              }
            }
          }}
          ChipProps={{ size: "medium" }}
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
            Create
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const CreateGroup = ({ open, handleClose }) => {
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
      <DialogTitle>{"Create New Group"}</DialogTitle>

      <DialogContent sx={{ mt: 4 }}>
        {/* Create Group Form */}
        <CreateGroupForm handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
