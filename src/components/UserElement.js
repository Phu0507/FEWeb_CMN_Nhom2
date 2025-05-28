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
import { Chat, UserMinus, UserCircleMinus } from "phosphor-react";
import { socket } from "../socket";
import { useDispatch, useSelector } from "react-redux";
import {
  showSnackbar,
  AcceptRequest,
  FetchSendRequests,
  RemoveSendRequest,
  FetchFriendRequests,
  RemoveFriendRequest,
  AddSendRequest,
  RemoveFriends,
  AddFriend,
} from "../redux/slices/app";
import { accessChat } from "../redux/slices/conversation";
const user_id = window.localStorage.getItem("user_id");

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

const UserElement = ({ avatar, fullName, online, _id }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  // useEffect(() => {
  //   dispatch(FetchSendRequests());
  //   dispatch(FetchFriendRequests());
  // }, [dispatch]);

  useEffect(() => {
    socket.on("friendRequestRejected", ({ senderId, receiverId }) => {
      dispatch(
        showSnackbar({
          severity: "error",
          message: `${fullName} đã từ chối lời mời kết bạn của bạn.`,
        })
      );
      dispatch(RemoveSendRequest(receiverId));
    });

    return () => {
      socket.off("friendRequestRejected");
    };
  }, [dispatch]);

  const { friends } = useSelector((state) => state.app);
  const { friendRequests, sendRequests } = useSelector((state) => state.app);
  const { user_id } = useSelector((state) => state.auth);
  const isFriend = friends?.some((friend) => friend._id === _id);
  const isFriendRequests = friendRequests?.some(
    (friendRequests) => friendRequests._id === _id
  );
  const isSendRequests = sendRequests?.some(
    (friendRequests) => friendRequests._id === _id
  );
  const sendFriendRequest = (receiverId) => {
    socket.emit("sendFriendRequest", {
      senderId: user_id,
      receiverId,
    });

    dispatch(
      showSnackbar({
        severity: "success",
        message: `You just sent a new friend request to ${fullName}.`,
      })
    );
    dispatch(AddSendRequest({ _id: receiverId, fullName, avatar }));
  };

  const cancelFriendRequest = (receiverId) => {
    socket.emit("cancelFriendRequest", {
      senderId: user_id,
      receiverId,
    });

    dispatch(
      showSnackbar({
        severity: "info",
        message: `You have canceled the friend request to ${fullName}.`,
      })
    );
    dispatch(RemoveSendRequest(receiverId));
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
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar alt={fullName} src={avatar} />
            </StyledBadge>
          ) : (
            <Avatar alt={fullName} src={avatar} />
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{fullName}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          {isFriend ? (
            <Button
              variant="contained"
              onClick={() => {
                dispatch(RemoveFriends(_id));
              }}
            >
              Unfriend
            </Button>
          ) : isFriendRequests ? (
            <Button variant="contained">Accept</Button>
          ) : isSendRequests ? (
            <Button
              variant="contained"
              color="error"
              onClick={() => cancelFriendRequest(_id)}
            >
              Cancel Request
            </Button>
          ) : (
            <Button
              color="inherit"
              onClick={() => sendFriendRequest(_id)}
              variant="contained"
            >
              Add Friend
            </Button>
          )}
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

const FriendRequestElement = ({
  avatar,
  fullName,
  incoming,
  missed,
  online,
  _id,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  // useEffect(() => {
  //   socket.on("friendRequestCancelled", (senderId) => {
  //     dispatch(RemoveFriendRequest({ senderId }));
  //   });

  //   return () => {
  //     socket.off("friendRequestCancelled");
  //   };
  // }, [dispatch]);

  const handleRejectFriendRequest = () => {
    socket.emit("rejectFriendRequest", {
      senderId: _id, // người gửi lời mời
      receiverId: user_id, // người từ chối
    });

    dispatch(
      showSnackbar({
        severity: "info",
        message: `Bạn đã từ chối lời mời kết bạn từ ${fullName}.`,
      })
    );

    dispatch(RemoveFriendRequest({ senderId: _id }));
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
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar alt={fullName} src={avatar} />
            </StyledBadge>
          ) : (
            <Avatar alt={fullName} src={avatar} />
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{fullName}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Button
            onClick={handleRejectFriendRequest}
            variant="contained"
            color="error"
          >
            Reject
          </Button>
          <Button
            onClick={() => {
              dispatch(AcceptRequest(_id, user_id));
              dispatch(
                AddFriend({
                  _id,
                  fullName,
                  avatar,
                })
              );
            }}
            variant="contained"
          >
            Accept
          </Button>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

// FriendElement

const FriendElement = ({ avatar, fullName, incoming, missed, online, _id }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
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
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar alt={fullName} src={avatar} />
            </StyledBadge>
          ) : (
            <Avatar alt={fullName} src={avatar} />
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{fullName}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <IconButton
            onClick={() => {
              dispatch(accessChat(_id));
            }}
          >
            <Chat />
          </IconButton>
          <IconButton
            onClick={() => {
              dispatch(RemoveFriends(_id));
            }}
          >
            <UserMinus />
          </IconButton>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

export { UserElement, FriendRequestElement, FriendElement };
