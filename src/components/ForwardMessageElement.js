import React, { useEffect } from "react";
import {
  Box,
  Badge,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { forwardToFriend } from "../redux/slices/conversation";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import GroupAvatar from "../contexts/GroupAvatar";

const StyledChatBox = styled(Box)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer",
  },
}));

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

const ChatElement = ({
  img,
  name,
  isGroup,
  id,
  user_id,
  message,
  groupAvatar,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const handleForward = () => {
    const target = {
      _id: id,
      isGroup,
    };
    console.log("gửi msss", message);
    if (!message) return;

    dispatch(forwardToFriend(target, message));
  };

  return (
    <StyledChatBox
      sx={{
        width: "100%",

        borderRadius: 1,

        backgroundColor: theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems={"center"} spacing={2}>
          {" "}
          {isGroup ? (
            groupAvatar && groupAvatar !== "" ? (
              <Avatar
                alt={name}
                src={groupAvatar}
                sx={{ width: 42, height: 42 }}
              />
            ) : (
              <GroupAvatar members={user_id} />
            )
          ) : (
            <Avatar alt={name} src={img} sx={{ width: 42, height: 42 }} />
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{name}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Button variant="contained" onClick={handleForward}>
            Send
          </Button>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

const GroupChatElement = ({
  img,
  name,
  isGroup,
  id,
  user_id,
  message,
  groupAvatar,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const handleForward = () => {
    const target = {
      _id: id,
      isGroup,
    };
    console.log("gửi msss", message);
    if (!message) return;

    dispatch(forwardToFriend(target, message));
  };

  return (
    <StyledChatBox
      sx={{
        width: "100%",

        borderRadius: 1,

        backgroundColor: theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems={"center"} spacing={2}>
          {" "}
          {isGroup ? (
            groupAvatar?.trim() ? (
              <Avatar
                alt={name}
                src={groupAvatar}
                sx={{ width: 42, height: 42 }}
              />
            ) : (
              <GroupAvatar members={user_id} />
            )
          ) : (
            <Avatar alt={name} src={img} sx={{ width: 42, height: 42 }} />
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{name}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Button variant="contained" onClick={handleForward}>
            Send
          </Button>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

// FriendElement

const FriendElement = ({ avatar, fullName, online, _id, message, isGroup }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const handleForward = () => {
    const target = {
      _id: _id,
      isGroup,
    };
    console.log("gửi id", _id);
    if (!message) return;

    dispatch(forwardToFriend(target, message));
  };
  return (
    <StyledChatBox
      sx={{
        width: "100%",

        borderRadius: 1,

        backgroundColor: theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems={"center"} spacing={2}>
          <Avatar alt={fullName} src={avatar} />

          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{fullName}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Button variant="contained" onClick={handleForward}>
            Send
          </Button>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

export { ChatElement, GroupChatElement, FriendElement };
