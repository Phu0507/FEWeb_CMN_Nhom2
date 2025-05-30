import React, { useEffect, useState } from "react";
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
import {
  Chat,
  UserMinus,
  UserCircleMinus,
  CheckCircle,
  X,
  VideoCamera,
} from "phosphor-react";
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
  SetRoomUrl,
} from "../redux/slices/app";
import { accessChat } from "../redux/slices/conversation";
import axios from "../utils/axios";
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
  //   socket.on("friendRequestRejected", ({ senderId, receiverId }) => {
  //     dispatch(
  //       showSnackbar({
  //         severity: "error",
  //         message: `${fullName} đã từ chối lời mời kết bạn của bạn.`,
  //       })
  //     );
  //     dispatch(RemoveSendRequest(receiverId));
  //   });

  //   return () => {
  //     socket.off("friendRequestRejected");
  //   };
  // }, [dispatch]);

  const { friends } = useSelector((state) => state.app);
  const { friendRequests, sendRequests } = useSelector((state) => state.app);
  const { user_id } = useSelector((state) => state.auth);
  const isFriend =
    Array.isArray(friends) && friends.some((friend) => friend._id === _id);
  const isFriendRequests =
    Array.isArray(friendRequests) &&
    friendRequests?.some((friendRequests) => friendRequests._id === _id);
  const isSendRequests =
    Array.isArray(sendRequests) &&
    sendRequests?.some((friendRequests) => friendRequests._id === _id);
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
              color="inherit"
              onClick={() => {
                dispatch(RemoveFriends(_id));
              }}
            >
              Unfriend
            </Button>
          ) : isFriendRequests ? (
            <Button
              onClick={() => {
                dispatch(AcceptRequest(_id, user_id));
                // dispatch(
                //   AddFriend({
                //     _id,
                //     fullName,
                //     avatar,
                //   })
                // );
              }}
              variant="contained"
            >
              Accept
            </Button>
          ) : isSendRequests ? (
            <Button
              variant="contained"
              color="error"
              onClick={() => cancelFriendRequest(_id)}
            >
              Cancel Request
            </Button>
          ) : (
            <Button onClick={() => sendFriendRequest(_id)} variant="contained">
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
          <IconButton
            onClick={handleRejectFriendRequest}
            variant="contained"
            color="error"
          >
            <X />
          </IconButton>
          <IconButton
            color="success"
            onClick={() => {
              dispatch(AcceptRequest(_id, user_id));
              // dispatch(
              //   AddFriend({
              //     _id,
              //     fullName,
              //     avatar,
              //   })
              // );
            }}
            variant="contained"
          >
            <CheckCircle />
          </IconButton>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

// FriendElement

const FriendElement = ({
  avatar,
  fullName,
  incoming,
  missed,
  online,
  _id,
  onCloseDialog,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user, roomUrl } = useSelector((state) => state.app);
  // const [roomUrl, setRoomUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  // useEffect(() => {
  //   if (!socket) return;

  //   socket.on("incomingVideoCall", ({ from, roomUrl }) => {
  //     const accept = window.confirm(
  //       `${from.fullName} đang gọi cho bạn. Trả lời?`
  //     );
  //     if (accept) {
  //       const fullUrl = `${roomUrl}?userName=${encodeURIComponent(
  //         user.fullName || "Guest"
  //       )}`;
  //       setRoomUrl(fullUrl);
  //     }
  //   });

  //   return () => socket.off("incomingVideoCall");
  // }, [user]);

  const handleCall = async (friendId) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/daily/create-room",
        {
          conversationId: friendId,
          toUserId: friendId,
          fromUser: {
            _id: user._id,
            fullName: user.fullName,
            avatar: user.avatar || "",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { url } = res.data;
      if (!url) return alert("Không nhận được URL phòng");

      const fullUrl = `${url}?userName=${encodeURIComponent(
        user.fullName || "Guest"
      )}`;
      dispatch(SetRoomUrl(fullUrl));
    } catch (err) {
      console.error("Không thể tạo phòng:", err);
      alert("Không thể bắt đầu cuộc gọi");
    } finally {
      setLoading(false);
    }
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
          <IconButton
            onClick={() => {
              dispatch(accessChat(_id));
              if (onCloseDialog) onCloseDialog();
            }}
            color="secondary"
            variant="contained"
          >
            <Chat />
          </IconButton>
          <IconButton
            color="success"
            variant="contained"
            onClick={() => handleCall(_id)}
          >
            <VideoCamera />
          </IconButton>
          <IconButton
            onClick={() => {
              dispatch(RemoveFriends(_id));
            }}
            color="error"
            variant="contained"
          >
            <UserMinus />
          </IconButton>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

export { UserElement, FriendRequestElement, FriendElement };
