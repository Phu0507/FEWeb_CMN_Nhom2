import React, { useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import { ArrowLeft, DotsThreeOutline } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import { useDispatch, useSelector } from "react-redux";
import { UpdateSidebarType } from "../../redux/slices/app";
import { faker } from "@faker-js/faker";
import { DocMsg, LinkMsg } from "./Conversation";
import { Shared_docs, Shared_links } from "../../data";
import {
  transferGroupAdmin,
  removeGroupMember,
} from "../../redux/slices/conversation";

const MembersGroup = () => {
  const dispatch = useDispatch();
  const user_id = localStorage.getItem("user_id");
  const { conversations, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );

  useEffect(() => {
    if (current_conversation && !current_conversation.isGroup) {
      dispatch(UpdateSidebarType("CONTACT"));
    }
  }, [current_conversation, dispatch]);

  let conversation = null;
  if (current_conversation && current_conversation.isGroup) {
    conversation = conversations.find(
      (conv) => conv.id === current_conversation.id
    );
  }

  const theme = useTheme();
  const isDesktop = useResponsive("up", "md");
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => setValue(newValue);

  const Members_Menu = [
    { id: 1, title: "Transfer group ownership" },
    { id: 2, title: "Remove member" },
  ];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [selectedChat, setSelectedChat] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event, user, chatId) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
    setSelectedChat(chatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
    setSelectedChat(null);
  };

  const handleMenuItemClick = (action) => {
    console.log(`Action "${action}" on user:`, selectedUser, selectedChat);
    if (action === 1) {
      dispatch(transferGroupAdmin(selectedChat, selectedUser));
      console.log("thanh cong");
    } else if (action === 2) {
      dispatch(removeGroupMember(selectedChat, selectedUser));
      console.log("xoa thanh công");
    }
    handleMenuClose();
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
            spacing={3}
          >
            <IconButton onClick={() => dispatch(UpdateSidebarType("CONTACT"))}>
              <ArrowLeft />
            </IconButton>
            <Typography variant="subtitle2">Members</Typography>
          </Stack>
        </Box>

        <Stack
          sx={{
            height: "100%",
            position: "relative",
            flexGrow: 1,
            overflow: "scroll",
          }}
          spacing={3}
          padding={value === 1 ? 1 : 3}
        >
          {conversation?.user_id
            ?.slice()
            .sort((a, b) => {
              if (a._id === conversation.groupAdmin) return -1;
              if (b._id === conversation.groupAdmin) return 1;
              return 0;
            })
            .map((user, index) => (
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "#f7f7f7"
                      : theme.palette.background.paper,
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 1,
                }}
                p={2}
                key={index}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar alt={user.fullName} src={user.avatar} />
                  <Stack spacing={0}>
                    <Typography
                      noWrap
                      sx={{
                        maxWidth: "130px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      variant="subtitle2"
                    >
                      {user.fullName}
                    </Typography>
                    {user._id === conversation.groupAdmin && (
                      <Badge
                        badgeContent={"Admin"}
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: 10,
                            height: 15,
                            minWidth: 30,
                            transform: "none",
                            position: "static",
                            backgroundColor: theme.palette.primary.main,
                            color: "#fff",
                          },
                        }}
                      />
                    )}
                  </Stack>
                </Stack>

                {user_id === conversation.groupAdmin &&
                  user._id !== user_id && (
                    <IconButton
                      onClick={(e) =>
                        handleMenuClick(e, user._id, conversation.id)
                      }
                    >
                      <DotsThreeOutline />
                    </IconButton>
                  )}
              </Stack>
            ))}

          {/* Menu hiển thị khi click icon */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {Members_Menu.map((option, index) => (
              <MenuItem
                key={index}
                onClick={() => handleMenuItemClick(option.id)}
              >
                {option.title}
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};

export default MembersGroup;
