import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  CaretDown,
  MagnifyingGlass,
  Phone,
  VideoCamera,
  User,
  PencilLine,
  UserPlus,
} from "phosphor-react";
import GroupAvatar from "../../contexts/GroupAvatar";
import useResponsive from "../../hooks/useResponsive";
import { ToggleSidebar, UpdateSidebarType } from "../../redux/slices/app";
import { useDispatch, useSelector } from "react-redux";
import { StartAudioCall } from "../../redux/slices/audioCall";
import { StartVideoCall } from "../../redux/slices/videoCall";
import RenameGroup from "../../sections/dashboard/RenameGroup";
import {
  removeGroupMember,
  removeGroup,
} from "../../redux/slices/conversation";
import AddUserGroup from "../../sections/dashboard/AddUserGroup";
import ConfirmDialog from "../../sections/dashboard/Settings/ConfirmDialog";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const Conversation_Menu = [
  {
    title: "Contact info",
  },
  // {
  //   title: "Mute notifications",
  // },
  // {
  //   title: "Clear messages",
  // },
  // {
  //   title: "Delete chat",
  // },
  {
    title: "Remove Group",
  },
  {
    title: "Leave Group",
  },
];

const ChatHeader = () => {
  const dispatch = useDispatch();
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const theme = useTheme();

  const [hovered, setHovered] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogAddUser, setOpenDialogAddUser] = useState(false);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmContent, setConfirmContent] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  const showConfirmDialog = (title, content, onConfirmAction) => {
    setConfirmTitle(title);
    setConfirmContent(content);
    setConfirmAction(() => () => {
      onConfirmAction();
      setConfirmDialogOpen(false);
    });
    setConfirmDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialogAddUser = () => {
    setOpenDialogAddUser(false);
  };
  const handleOpenDialogAddUser = () => {
    setOpenDialogAddUser(true);
  };
  const { current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );

  const currentUserId = localStorage.getItem("user_id");

  const filteredMenu = Conversation_Menu.filter((el) => {
    if (el.title === "Delete chat") {
      return !current_conversation?.isGroup;
    }

    if (el.title === "Remove Group") {
      return (
        current_conversation?.isGroup &&
        current_conversation?.groupAdmin === currentUserId
      );
    }

    if (el.title === "Leave Group") {
      return (
        current_conversation?.isGroup &&
        current_conversation?.groupAdmin !== currentUserId
      );
    }

    // Các mục còn lại hiển thị mặc định
    return (
      el.title !== "Remove Group" &&
      el.title !== "Leave Group" &&
      el.title !== "Delete chat"
    );
  });

  const handleMenuItemClick = (title) => {
    handleCloseConversationMenu();

    if (title === "Contact info") {
      setTimeout(() => {
        dispatch(ToggleSidebar());
        dispatch(UpdateSidebarType("CONTACT"));
      }, 100);
    } else if (title === "Leave Group") {
      showConfirmDialog(
        "Rời nhóm",
        "Bạn có chắc chắn muốn rời khỏi nhóm này không?",
        () => {
          dispatch(removeGroupMember(current_conversation.id, currentUserId));
          console.log("Rời nhóm thành công");
        }
      );
    } else if (title === "Remove Group") {
      showConfirmDialog(
        "Xóa nhóm",
        "Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn tác.",
        () => {
          dispatch(removeGroup(current_conversation.id));
          console.log("Xóa nhóm thành công");
        }
      );
    }
  };

  const [conversationMenuAnchorEl, setConversationMenuAnchorEl] =
    React.useState(null);
  const openConversationMenu = Boolean(conversationMenuAnchorEl);
  const handleClickConversationMenu = (event) => {
    setConversationMenuAnchorEl(event.currentTarget);
  };
  const handleCloseConversationMenu = () => {
    setConversationMenuAnchorEl(null);
  };

  return (
    <>
      <Box
        p={2}
        width={"100%"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack
          alignItems={"center"}
          direction={"row"}
          sx={{ width: "100%", height: "100%" }}
          justifyContent="space-between"
        >
          <Stack spacing={2} direction="row">
            <Box
              onClick={() => {
                dispatch(ToggleSidebar());
                dispatch(UpdateSidebarType("CONTACT"));
              }}
              sx={{ cursor: "pointer" }}
            >
              {current_conversation?.isGroup ? (
                <GroupAvatar members={current_conversation?.user_id} />
              ) : current_conversation?.online ? (
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                >
                  <Avatar
                    alt={current_conversation?.name}
                    src={current_conversation?.img}
                    sx={{ width: 42, height: 42 }}
                  />
                </StyledBadge>
              ) : (
                <Avatar
                  alt={current_conversation?.name}
                  src={current_conversation?.img}
                  sx={{ width: 42, height: 42 }}
                />
              )}
            </Box>
            <Stack spacing={0.2}>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <Typography variant="subtitle2">
                  {current_conversation?.name}
                </Typography>
                {current_conversation?.isGroup && (
                  <>
                    {hovered && (
                      <IconButton
                        size="small"
                        onClick={handleOpenDialog}
                        sx={{
                          padding: "2px",
                          "&:hover": {
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        <PencilLine />
                      </IconButton>
                    )}
                  </>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: current_conversation?.isGroup ? "pointer" : "default",
                  "&:hover": {
                    color: (theme) =>
                      current_conversation?.isGroup
                        ? theme.palette.primary.main
                        : "theme.palette.text",
                  },
                }}
                onClick={() => {
                  if (current_conversation?.isGroup) {
                    dispatch(ToggleSidebar());
                    dispatch(UpdateSidebarType("MEMBERS"));
                  }
                }}
              >
                {current_conversation?.isGroup ? (
                  <>
                    <User size={14} style={{ marginRight: 4 }} />
                    <Typography variant="caption">
                      {current_conversation?.user_id?.length || 0} members
                    </Typography>
                  </>
                ) : (
                  <Typography variant="caption">Online</Typography>
                )}
              </Box>
            </Stack>
          </Stack>
          <Stack
            direction={"row"}
            alignItems="center"
            spacing={isMobile ? 1 : 3}
          >
            <IconButton
              onClick={() => {
                if (current_conversation.isGroup) {
                  handleOpenDialogAddUser();
                } else {
                  dispatch(StartAudioCall(current_conversation.user_id));
                }
              }}
            >
              {current_conversation.isGroup ? <UserPlus /> : <Phone />}
            </IconButton>
            <IconButton
              onClick={() => {
                dispatch(StartVideoCall(current_conversation.user_id));
              }}
            >
              <VideoCamera />
            </IconButton>
            {!isMobile && (
              <IconButton>
                <MagnifyingGlass />
              </IconButton>
            )}
            <Divider orientation="vertical" flexItem />
            <IconButton
              id="conversation-positioned-button"
              aria-controls={
                openConversationMenu
                  ? "conversation-positioned-menu"
                  : undefined
              }
              aria-haspopup="true"
              aria-expanded={openConversationMenu ? "true" : undefined}
              onClick={handleClickConversationMenu}
            >
              <CaretDown />
            </IconButton>
            <Menu
              MenuListProps={{
                "aria-labelledby": "fade-button",
              }}
              TransitionComponent={Fade}
              id="conversation-positioned-menu"
              aria-labelledby="conversation-positioned-button"
              anchorEl={conversationMenuAnchorEl}
              open={openConversationMenu}
              onClose={handleCloseConversationMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Box p={1}>
                <Stack spacing={1}>
                  {filteredMenu.map((el) => (
                    <MenuItem
                      key={el.title}
                      onClick={() => handleMenuItemClick(el.title)}
                    >
                      <Stack
                        sx={{ minWidth: 100 }}
                        direction="row"
                        alignItems={"center"}
                        justifyContent="space-between"
                      >
                        <span>{el.title}</span>
                      </Stack>{" "}
                    </MenuItem>
                  ))}
                </Stack>
              </Box>
            </Menu>
          </Stack>
        </Stack>
      </Box>
      {openDialog && (
        <RenameGroup
          open={openDialog}
          handleClose={handleCloseDialog}
          groupName={current_conversation?.name}
          chatId={current_conversation?.id}
        />
      )}

      {openDialogAddUser && (
        <AddUserGroup
          open={openDialogAddUser}
          handleClose={handleCloseDialogAddUser}
        />
      )}
      <ConfirmDialog
        open={confirmDialogOpen}
        title={confirmTitle}
        content={confirmContent}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmAction}
      />
    </>
  );
};

export default ChatHeader;
