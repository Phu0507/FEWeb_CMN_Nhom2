import React, { useEffect } from "react";
import { Stack } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import useResponsive from "../../hooks/useResponsive";
import SideNav from "./SideNav";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchUserProfile,
  SelectConversation,
  showSnackbar,
  RemoveFriendRequest,
  AddFriendRequests,
  AddFriend,
  RemoveFriend,
  RemoveSendRequest,
  FetchFriends,
  SetRoomUrl,
} from "../../redux/slices/app";
import { socket, connectSocket } from "../../socket";
import {
  UpdateDirectConversation,
  AddDirectConversation,
  AddDirectMessage,
  getConversationsFromServer,
  SetOnlineFriends,
  AddOnlineFriend,
  RemoveOnlineFriend,
} from "../../redux/slices/conversation";
import AudioCallNotification from "../../sections/dashboard/Audio/CallNotification";
import VideoCallNotification from "../../sections/dashboard/video/CallNotification";
import {
  PushToAudioCallQueue,
  UpdateAudioCallDialog,
} from "../../redux/slices/audioCall";
import AudioCallDialog from "../../sections/dashboard/Audio/CallDialog";
import VideoCallDialog from "../../sections/dashboard/video/CallDialog";
import {
  PushToVideoCallQueue,
  UpdateVideoCallDialog,
} from "../../redux/slices/videoCall";

const DashboardLayout = () => {
  const isDesktop = useResponsive("up", "md");
  const dispatch = useDispatch();
  const { user_id } = useSelector((state) => state.auth);
  const { open_audio_notification_dialog, open_audio_dialog } = useSelector(
    (state) => state.audioCall
  );
  const { open_video_notification_dialog, open_video_dialog } = useSelector(
    (state) => state.videoCall
  );
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { conversations, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { room_id } = useSelector((state) => state.app);
  const { user } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(FetchUserProfile());
    dispatch(FetchFriends());
  }, [dispatch]);

  const handleCloseAudioDialog = () => {
    dispatch(UpdateAudioCallDialog({ state: false }));
  };
  const handleCloseVideoDialog = () => {
    dispatch(UpdateVideoCallDialog({ state: false }));
  };

  useEffect(() => {
    if (isLoggedIn) {
      // window.onload = function () {
      //   if (!window.location.hash) {
      //     window.location = window.location + "#loaded";
      //     window.location.reload();
      //   }
      // };
      // window.onload();

      // if (!socket) {
      //   connectSocket(user_id);
      // }

      socket.emit("setup", user_id);

      socket.on("friendRequestReceived", (data) => {
        // Gọi lại API để lấy danh sách friendRequests mới
        console.log("hi", data);
        dispatch(
          AddFriendRequests({
            _id: data.sender._id,
            fullName: data.sender.fullName,
            avatar: data.sender.avatar,
          })
        );
        dispatch(
          showSnackbar({
            severity: "success",
            message: `${data.sender.fullName} gửi lời mời kết bạn.`,
          })
        );
      });
      socket.on("messageReceived", () => {
        dispatch(getConversationsFromServer());
      });
      socket.on("friendRequestCancelled", (senderId) => {
        dispatch(RemoveFriendRequest(senderId));
      });

      socket.on("friendRequestRejected", ({ senderId, receiverId }) => {
        dispatch(
          showSnackbar({
            severity: "error",
            message: "Lời mời kết bạn của bạn đã bị từ chối",
          })
        );
        dispatch(RemoveSendRequest(receiverId));
      });

      socket.on("friendRequestAccepted", ({ sender, receiver }) => {
        const friendToAdd = user_id === receiver._id ? sender : receiver;
        dispatch(RemoveSendRequest(receiver._id));
        dispatch(AddFriend(friendToAdd));
        dispatch(
          showSnackbar({
            severity: "success",
            message: `${receiver.fullName} đã chấp nhận lời mời kết bạn.`,
          })
        );
      });

      socket.on("youWereRemoved", ({ userId }) => {
        console.log("Bạn bè đã bị xoá (real-time):", userId);

        dispatch(RemoveFriend(userId));
      });

      socket.on("newMessageToUser", ({ chatId, message }) => {
        console.log("Tin nhắn mới đến:", message);
        dispatch(getConversationsFromServer());
        // dispatch(
        //   showSnackbar({
        //     severity: "success",
        //     message: `có tin nhắn mới là: ${message.content} từ ${message.sender.fullName}`,
        //   })
        // );
      });

      socket.on("incomingVideoCall", ({ from, roomUrl }) => {
        const accept = window.confirm(
          `${from.fullName} đang gọi cho bạn. Trả lời?`
        );
        if (accept) {
          const fullUrl = `${roomUrl}?userName=${encodeURIComponent(
            user.fullName || "Guest"
          )}`;
          dispatch(SetRoomUrl(fullUrl));
        }
      });
    }
    if (user_id) {
      socket.emit("getOnlineFriends", user_id);
    }

    socket.on("initialOnlineFriends", ({ userIds }) => {
      console.log("Danh sách bạn bè online ban đầu:", userIds);
      dispatch(SetOnlineFriends(userIds));
    });
    socket.on("friendOnline", ({ userId: friendId }) => {
      console.log("Bạn bè online:", friendId);
      dispatch(AddOnlineFriend(friendId)); // bạn sẽ tạo action này
    });
    socket.on("friendOffline", ({ userId: friendId }) => {
      console.log("Bạn bè offline:", friendId);
      dispatch(RemoveOnlineFriend(friendId)); // bạn sẽ tạo action này
    });

    // Remove event listener on component unmount
    return () => {
      socket?.off("friendRequestReceived");
      socket.off("friendRequestCancelled");
      socket.off("friendRequestAccepted");
      socket.off("youWereRemoved");
      socket.off("newMessageToUser");
      socket.off("friendRequestRejected");
      socket.off("messageReceived");
      socket.off("initialOnlineFriends");
      socket.off("friendOnline");
      socket.off("friendOffline");
      socket.off("incomingVideoCall");
    };
  }, [isLoggedIn, dispatch, user_id, user]);

  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }

  return (
    <>
      <Stack direction="row">
        {isDesktop && (
          // SideBar
          <SideNav />
        )}

        <Outlet />
      </Stack>
      {open_audio_notification_dialog && (
        <AudioCallNotification open={open_audio_notification_dialog} />
      )}
      {open_audio_dialog && (
        <AudioCallDialog
          open={open_audio_dialog}
          handleClose={handleCloseAudioDialog}
        />
      )}
      {open_video_notification_dialog && (
        <VideoCallNotification open={open_video_notification_dialog} />
      )}
      {open_video_dialog && (
        <VideoCallDialog
          open={open_video_dialog}
          handleClose={handleCloseVideoDialog}
        />
      )}
    </>
  );
};

export default DashboardLayout;
