import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArchiveBox,
  CircleDashed,
  MagnifyingGlass,
  Users,
} from "phosphor-react";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { useTheme } from "@mui/material/styles";
import useResponsive from "../../hooks/useResponsive";
import BottomNav from "../../layouts/dashboard/BottomNav";
import { ChatList } from "../../data";
import ChatElement from "../../components/ChatElement";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import Friends from "../../sections/dashboard/Friends";
import { socket } from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import {
  getConversationsFromServer,
  GroupChatUpdated,
  UpdateGroupAdmin,
  RemoveConversation,
} from "../../redux/slices/conversation";

const user_id = window.localStorage.getItem("user_id");

const Chats = () => {
  const theme = useTheme();
  const isDesktop = useResponsive("up", "md");

  const dispatch = useDispatch();

  const { conversations, fetchAgain } = useSelector(
    (state) => state.conversation.direct_chat
  );
  // console.log("chat", conversations);

  useEffect(() => {
    dispatch(getConversationsFromServer());
  }, [fetchAgain, dispatch]);

  // useEffect(() => {
  //   const savedId = localStorage.getItem("current_conversation_id");

  //   if (savedId && conversations.length > 0) {
  //     const conv = conversations.find((c) => c.id.toString() === savedId);
  //     if (conv) {
  //       dispatch(SetCurrentConversation({ conversation: conv }));
  //     }
  //   }
  // }, [dispatch, conversations]);

  useEffect(() => {
    socket.emit("setup", user_id);

    const handleAdmin = (chatId, newAdminId) => {
      console.log("test socket 888");
      dispatch(UpdateGroupAdmin(chatId, newAdminId));
    };
    socket.on("admin:transferred", handleAdmin);
    return () => {
      socket.off("admin:transferred");
    };
  }, [dispatch]);

  useEffect(() => {
    const handleGroupUpdated = (updatedChat) => {
      // console.log("test socket");
      dispatch(GroupChatUpdated(updatedChat));
    };

    socket.on("group:updated", handleGroupUpdated);

    return () => {
      socket.off("group:updated", handleGroupUpdated);
    };
  }, [dispatch]);

  useEffect(() => {
    const handleRemove = (chatId) => {
      console.log("test socket xoa");
      dispatch(RemoveConversation(chatId));
    };
    socket.on("group:removed", handleRemove);
    return () => {
      socket.off("group:removed");
    };
  }, [dispatch]);

  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: isDesktop ? 320 : "100vw",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,

          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        {!isDesktop && (
          // Bottom Nav
          <BottomNav />
        )}

        <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
          <Stack
            alignItems={"center"}
            justifyContent="space-between"
            direction="row"
          >
            <Typography variant="h5">Chats</Typography>

            <Stack direction={"row"} alignItems="center" spacing={1}>
              <IconButton
                onClick={() => {
                  handleOpenDialog();
                }}
                sx={{ width: "max-content" }}
              >
                <Users />
              </IconButton>
              <IconButton sx={{ width: "max-content" }}>
                <CircleDashed />
              </IconButton>
            </Stack>
          </Stack>
          <Stack sx={{ width: "100%" }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          </Stack>
          <Stack spacing={1}>
            <Stack direction={"row"} spacing={1.5} alignItems="center">
              <ArchiveBox size={24} />
              <Button variant="text">Archive</Button>
            </Stack>
            <Divider />
          </Stack>
          <Stack sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}>
            <SimpleBarStyle timeout={500} clickOnTrack={false}>
              <Stack spacing={2.4}>
                {/* <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                  Pinned
                </Typography> */}
                {/* Chat List */}
                {/* {ChatList.filter((el) => el.pinned).map((el, idx) => {
                  return <ChatElement {...el} />;
                })} */}
                <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                  All Chats
                </Typography>
                {/* Chat List */}
                {conversations
                  .filter((el) => !el.pinned)
                  .map((el, idx) => {
                    return <ChatElement key={idx} {...el} />;
                  })}
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Stack>
      </Box>
      {openDialog && (
        <Friends open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Chats;
