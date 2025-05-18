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
import { addUsersToGroup } from "../../redux/slices/conversation";

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

const AddUserGroupForm = ({ handleClose }) => {
  const [options, setOptions] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const { conversations, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const conversation = conversations.find(
    (conv) => conv.id === current_conversation.id
  );
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
    members: Yup.array().min(1, "Phải có ít nhất 1 người"),
  });

  const defaultValues = {
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
    dispatch(addUsersToGroup(conversation.id, data.members));
    handleClose();
    reset();
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFAutocomplete
          name="members"
          label="Members"
          multiple
          freeSolo
          options={options}
          existingMembers={conversation?.user_id}
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
            Add
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const AddUserGroup = ({ open, handleClose }) => {
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
      <DialogTitle>{"Add New User"}</DialogTitle>

      <DialogContent sx={{ mt: 4 }}>
        {/* Create Group Form */}
        <AddUserGroupForm handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default AddUserGroup;
