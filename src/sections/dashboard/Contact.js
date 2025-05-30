import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
  Slide,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { faker } from "@faker-js/faker";
import { Camera } from "phosphor-react";
import {
  Bell,
  CaretRight,
  Phone,
  Prohibit,
  Star,
  Trash,
  VideoCamera,
  X,
  Users,
} from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import AntSwitch from "../../components/AntSwitch";
import { useDispatch, useSelector } from "react-redux";
import { ToggleSidebar, UpdateSidebarType } from "../../redux/slices/app";
import { updateGroupAvatar } from "../../redux/slices/conversation";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BlockDialog = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Block this contact</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Are you sure you want to block this Contact?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteChatDialog = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Delete this chat</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Are you sure you want to delete this chat?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
};

const Contact = () => {
  const dispatch = useDispatch();

  const { current_conversation, current_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );
  console.log("hoi", current_conversation);
  const theme = useTheme();

  const isDesktop = useResponsive("up", "md");

  const [openBlock, setOpenBlock] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleCloseBlock = () => {
    setOpenBlock(false);
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const latest3Media = [];
  for (let i = current_messages.length - 1; i >= 0; i--) {
    const msg = current_messages[i];
    if (
      ["image", "video"].includes(msg.type) &&
      msg.fileUrl &&
      !msg.isRecalled
    ) {
      latest3Media.push(msg);
      if (latest3Media.length === 3) break;
    }
  }
  const handleChangeAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    dispatch(updateGroupAvatar(current_conversation.id, file));
  };

  return (
    <Box sx={{ width: !isDesktop ? "100vw" : 320, maxHeight: "100vh" }}>
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            width: "100%",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background,
          }}
        >
          <Stack
            sx={{ height: "100%", p: 2 }}
            direction="row"
            alignItems={"center"}
            justifyContent="space-between"
            spacing={3}
          >
            <Typography variant="subtitle2">Contact Info</Typography>
            <IconButton
              onClick={() => {
                dispatch(ToggleSidebar());
              }}
            >
              <X />
            </IconButton>
          </Stack>
        </Box>
        <Stack
          sx={{
            height: "100%",
            position: "relative",
            flexGrow: 1,
            overflow: "scroll",
          }}
          p={3}
          spacing={3}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            <Box position="relative">
              <Avatar
                src={
                  current_conversation?.isGroup
                    ? current_conversation?.groupAvatar
                    : current_conversation?.img
                }
                alt={current_conversation?.name}
                sx={{ height: 64, width: 64 }}
              />
              {current_conversation?.isGroup && (
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "background.paper",
                    border: "1px solid #ccc",
                  }}
                  onClick={() => {
                    // Gọi hàm mở modal hoặc input để đổi ảnh
                    document.getElementById("upload-group-avatar").click();
                  }}
                >
                  <Camera fontSize="small" />
                </IconButton>
              )}
              {/* Hidden file input */}
              <input
                id="upload-group-avatar"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleChangeAvatar}
              />
            </Box>

            <Stack spacing={0.5}>
              <Typography variant="article" fontWeight={600}>
                {current_conversation?.name}
              </Typography>
              {!current_conversation?.isGroup && (
                <Typography variant="body2" fontWeight={500}>
                  {current_conversation?.email}
                </Typography>
              )}
            </Stack>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-evenly"}
          >
            <Stack alignItems={"center"} spacing={1}>
              <IconButton>
                <Phone />
              </IconButton>

              <Typography variant="overline">Voice</Typography>
            </Stack>
            <Stack alignItems={"center"} spacing={1}>
              <IconButton>
                <VideoCamera />
              </IconButton>
              <Typography variant="overline">Video</Typography>
            </Stack>
          </Stack>
          <Divider />
          {current_conversation?.isGroup && (
            <>
              <Stack spacing={0.2}>
                <Typography variant="article" fontWeight={600}>
                  Members
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                    width: "120px",
                  }}
                  onClick={() => {
                    dispatch(UpdateSidebarType("MEMBERS"));
                  }}
                >
                  <Users size={20} />
                  <Typography variant="body2" fontWeight={500}>
                    {current_conversation?.user_id?.length || 0} members
                  </Typography>
                </Stack>
              </Stack>
              <Divider />
            </>
          )}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
          >
            <Typography variant="subtitle2">Media, Links & Docs</Typography>
            <Button
              onClick={() => {
                dispatch(UpdateSidebarType("SHARED"));
              }}
              endIcon={<CaretRight />}
            >
              All
            </Button>
          </Stack>
          <Stack direction={"row"} alignItems="center" spacing={1}>
            {latest3Media.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {msg.type === "image" && (
                  <img
                    src={msg.fileUrl}
                    alt={`Image ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                )}
                {msg.type === "video" && (
                  <video
                    src={msg.fileUrl}
                    controls
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                )}
              </Box>
            ))}
          </Stack>
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Star size={21} />
              <Typography variant="subtitle2">Starred Messages</Typography>
            </Stack>

            <IconButton
              onClick={() => {
                dispatch(UpdateSidebarType("STARRED"));
              }}
            >
              <CaretRight />
            </IconButton>
          </Stack>
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Bell size={21} />
              <Typography variant="subtitle2">Mute Notifications</Typography>
            </Stack>

            <AntSwitch />
          </Stack>
          <Divider />
          <Typography variant="body2">1 group in common</Typography>
          <Stack direction="row" alignItems={"center"} spacing={2}>
            <Avatar src={faker.image.imageUrl()} alt={faker.name.fullName()} />
            <Stack direction="column" spacing={0.5}>
              <Typography variant="subtitle2">Camel’s Gang</Typography>
              <Typography variant="caption">
                Owl, Parrot, Rabbit , You
              </Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack direction="row" alignItems={"center"} spacing={2}>
            <Button
              onClick={() => {
                setOpenBlock(true);
              }}
              fullWidth
              startIcon={<Prohibit />}
              variant="outlined"
            >
              Block
            </Button>
            <Button
              onClick={() => {
                setOpenDelete(true);
              }}
              fullWidth
              startIcon={<Trash />}
              variant="outlined"
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Stack>
      {openBlock && (
        <BlockDialog open={openBlock} handleClose={handleCloseBlock} />
      )}
      {openDelete && (
        <DeleteChatDialog open={openDelete} handleClose={handleCloseDelete} />
      )}
    </Box>
  );
};

export default Contact;
