import React, { useEffect, useState } from "react";
import {
  Box,
  Badge,
  Stack,
  Avatar,
  Typography,
  AvatarGroup,
} from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SelectConversation } from "../redux/slices/app";
import {
  SetCurrentConversation,
  getCurrentMessagesFromServer,
} from "../redux/slices/conversation";
import GroupAvatar from "../contexts/GroupAvatar";

const truncateText = (string, n) => {
  return string?.length > n ? `${string?.slice(0, n)}...` : string;
};

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

const ChatElement = ({ img, name, time, unread, online, id, isGroup }) => {
  const dispatch = useDispatch();
  const [relativeTime, setRelativeTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      if (time) {
        setRelativeTime(formatTime(time));
      }
    };

    updateTime(); // lần đầu render

    const interval = setInterval(updateTime, 30000); // cập nhật mỗi 30 giây

    return () => clearInterval(interval); // dọn dẹp khi unmount
  }, [time]);
  const formatTime = (isoTime) => {
    if (!isoTime) return "";

    const now = new Date();
    const time = new Date(isoTime);

    const diffInSeconds = Math.floor((now - time) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return "Vài giây";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ`;
    } else if (diffInDays === 1) {
      return "Hôm qua";
    } else if (diffInDays <= 7) {
      return `${diffInDays} ngày`;
    } else {
      const sameYear = now.getFullYear() === time.getFullYear();
      return time.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        ...(sameYear ? {} : { year: "2-digit" }),
      });
    }
  };

  const { room_id } = useSelector((state) => state.app);
  const selectedChatId = room_id?.toString();

  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );

  const conversation = conversations.find((conv) => conv.id === id);

  let isSelected = selectedChatId === id;

  if (!selectedChatId) {
    isSelected = false;
  }

  const theme = useTheme();

  return (
    <StyledChatBox
      onClick={() => {
        dispatch(SelectConversation({ room_id: id }));
        dispatch(SetCurrentConversation({ conversation }));
        // dispatch(getCurrentMessagesFromServer(id));
        // localStorage.setItem("current_conversation_id", id);
        // console.log("chatid", id);
        // console.log("room", room_id);
        // console.log(conversation);
      }}
      sx={{
        width: "100%",

        borderRadius: 1,

        backgroundColor: isSelected
          ? theme.palette.mode === "light"
            ? alpha(theme.palette.primary.main, 0.5)
            : theme.palette.primary.main
          : theme.palette.mode === "light"
          ? "#fff"
          : theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          {isGroup ? (
            <GroupAvatar members={conversation.user_id} />
          ) : online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar alt={name} src={img} sx={{ width: 42, height: 42 }} />
            </StyledBadge>
          ) : (
            <Avatar alt={name} src={img} sx={{ width: 42, height: 42 }} />
          )}

          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            {/* Dòng 1: Tên và thời gian nằm cùng 1 hàng */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: "100%", minWidth: 0 }}
            >
              <Typography
                noWrap
                variant="subtitle2"
                sx={{
                  maxWidth: "calc(100% - 50px)", // dành chỗ cho thời gian
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                {name}
              </Typography>

              <Typography
                variant="caption"
                sx={{ whiteSpace: "nowrap", fontWeight: 600, flexShrink: 0 }}
              >
                {relativeTime}
              </Typography>
            </Stack>

            {/* Dòng 2: Tin nhắn cuối và badge nằm cùng 1 hàng */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: "100%", minWidth: 0 }}
            >
              <Typography
                noWrap
                variant="caption"
                sx={{
                  maxWidth: "calc(100% - 30px)", // dành chỗ cho badge
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "text.secondary",
                }}
              >
                {(() => {
                  const latestMsg = conversation?.latestMessage;
                  if (!latestMsg) return "";

                  const isRecall = latestMsg?.isRecalled;
                  const isEdited = latestMsg?.isEdited;
                  const isGroupChat = isGroup;
                  const sender = latestMsg?.sender;
                  const content = latestMsg?.content || "";
                  const userId = localStorage.getItem("user_id");
                  const isMine = sender?._id === userId;

                  if (isRecall) {
                    return truncateText(
                      `${isMine ? "Bạn: " : ""}[Đã thu hồi tin nhắn]`,
                      20
                    );
                  }

                  let displayContent = content;
                  if (isEdited) {
                    displayContent += " (đã sửa)";
                  }

                  let prefix = "";

                  if (isGroupChat) {
                    prefix = isMine ? "Bạn" : sender?.fullName || "";
                  } else {
                    // Chat đơn (1-1)
                    if (isMine) {
                      prefix = "Bạn";
                    } else {
                      prefix = ""; // không hiện tên người gửi nếu là người khác
                    }
                  }

                  const finalText = prefix
                    ? `${prefix}: ${displayContent}`
                    : displayContent;

                  return truncateText(finalText, 20);
                })()}
              </Typography>

              {unread > 0 && (
                <Badge
                  color="primary"
                  badgeContent={unread}
                  sx={{ flexShrink: 0 }}
                />
              )}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

export default ChatElement;
