import { Stack, Box, Typography, Avatar, Menu } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { keyframes } from "@mui/system";
import { ChatHeader, ChatFooter } from "../../components/Chat";
import useResponsive from "../../hooks/useResponsive";
import { Download, ArrowCircleDown, DownloadSimple } from "phosphor-react";
import {
  DocMsg,
  ImageMsg,
  TextMsg,
  MediaMsg,
  AudioMsg,
  MessageOption,
} from "../../sections/dashboard/Conversation";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchCurrentMessages,
  SetCurrentConversation,
  getCurrentMessagesFromServer,
  AddDirectMessage,
  recallMessage,
  RecallDirectMessage,
  deleteMessage,
  editMessage,
  EditDirectMessage,
  getConversationsFromServer,
  UpdateConversationLastMessage,
  UpdateConversationRecall,
  deleteMessageOther,
} from "../../redux/slices/conversation";
import { socket } from "../../socket";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
  shouldShowTimestamp,
  getDateLabel,
} from "../../contexts/ChatLogic";
import Linkify from "linkify-react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css"; // Nhớ import CSS để Lightbox hoạt động

const Conversation = ({ isMobile, menu }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const { conversations, current_messages, current_conversation, fetchAgain } =
    useSelector((state) => state.conversation.direct_chat);
  const { room_id } = useSelector((state) => state.app);
  // console.log("hientai", current_conversation);
  // useEffect(() => {
  //   const current = conversations.find((el) => el?.id === room_id);

  //   // socket.emit("get_messages", { conversation_id: current?.id }, (data) => {
  //   //   // data => list of messages
  //   //   console.log(data, "List of messages");
  //   //   dispatch(FetchCurrentMessages({ messages: data }));
  //   // });

  //   dispatch(SetCurrentConversation(current));
  // }, []);

  const handleRecall = (messageId) => {
    dispatch(recallMessage(messageId));
  };

  const handDeleteMessageForMe = (messageId) => {
    dispatch(deleteMessage(messageId));
  };

  const handDeleteMessageOther = (messageId) => {
    dispatch(deleteMessageOther(messageId));
  };

  //new
  const user_id = localStorage.getItem("user_id");
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Mở lightbox
  const [photoIndex, setPhotoIndex] = useState(0); // Chỉ số ảnh trong lightbox
  let shownDates = new Set();
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewContent(message.content);
  };

  const handleSaveEditedMessage = () => {
    if (newContent.trim() === "") return;
    dispatch(editMessage(editingMessage._id, newContent));
    dispatch(
      UpdateConversationLastMessage({
        messageId: editingMessage._id,
        newContent: newContent,
      })
    );
    setEditingMessage(null);
    setNewContent("");
  };

  const imageMessages = current_messages.filter(
    (msg) => msg.type === "image" && msg.fileUrl && !msg.isRecalled
  );

  useEffect(() => {
    dispatch(getCurrentMessagesFromServer(current_conversation?.id));
    socket.emit("joinChat", room_id);
    const handleMessage = (message) => {
      if (message.chat._id === current_conversation?.id) {
        dispatch(AddDirectMessage(message));
      }
    };

    const handleRecallMessage = (updatedMsg) => {
      dispatch(RecallDirectMessage(updatedMsg._id));
      dispatch(UpdateConversationRecall({ messageId: updatedMsg._id }));
    };

    const handleEdit = (updatedMsg) => {
      dispatch(EditDirectMessage(updatedMsg._id, updatedMsg.content));
      dispatch(
        UpdateConversationLastMessage({
          messageId: updatedMsg._id,
          newContent: updatedMsg.content,
        })
      );
    };

    socket.on("messageReceived", handleMessage);
    socket.on("messageRecalled", handleRecallMessage);
    socket.on("messageEdited", handleEdit);

    return () => {
      socket.off("messageReceived", handleMessage);
      socket.off("messageRecalled", handleRecallMessage);
      socket.off("messageEdited", handleEdit);
    };
  }, [dispatch, room_id, current_conversation?.id]);

  return (
    <Box p={isMobile ? 1 : 3}>
      {current_messages &&
        current_messages.map((m, i) => {
          const messageDate = new Date(m.createdAt);
          const label = getDateLabel(messageDate);

          const shouldShowDate = !shownDates.has(label); // chỉ hiển thị nếu chưa hiện label này

          if (shouldShowDate) shownDates.add(label);

          return (
            <React.Fragment key={m._id}>
              {shouldShowDate && (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-block",
                      margin: "20px 0",
                      fontSize: "14px",
                      color: "white",
                      backgroundColor: "gray",
                      padding: "4px 10px",
                      borderRadius: "20px",
                    }}
                  >
                    {label}
                  </div>
                </div>
              )}
              <Stack
                key={m._id}
                direction="row"
                spacing={0}
                alignItems="flex-end"
              >
                {(isSameSender(current_messages, m, i, user_id) ||
                  isLastMessage(current_messages, i, user_id)) && (
                  <Avatar
                    sx={{ cursor: "pointer", mr: 0.7 }}
                    alt={m.sender.fullName}
                    src={m.sender.avatar}
                  />
                )}

                {/* Bọc span + menu trong div để kiểm soát hover */}
                <div
                  style={{
                    maxWidth: "75%",
                    marginLeft: isSameSenderMargin(
                      current_messages,
                      m,
                      i,
                      user_id
                    ),
                    marginTop: isSameUser(current_messages, m, i, user_id)
                      ? 10
                      : 15,
                    // backgroundColor: "red",
                    display: "flex",
                    alignItems: "flex-end",
                    flexDirection:
                      m.sender._id === user_id ? "row" : "row-reverse", // thay đổi hướng sắp xếp
                  }}
                  onMouseEnter={() => setHoveredMsgId(m._id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                >
                  {hoveredMsgId === m._id && (
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginBottom: "6px",
                        marginRight: "4px",
                      }}
                    >
                      <MessageOption
                        message={m}
                        user_id={user_id}
                        onRecall={handleRecall}
                        onForward={(msg) => console.log("Forwarding:", msg)}
                        onEdit={handleEditMessage}
                        onDelete={handDeleteMessageForMe}
                        onDeleteForOther={handDeleteMessageOther}
                      />
                    </div>
                  )}

                  <Stack
                    direction="column"
                    spacing={0} // tương đương gap={0}
                    alignItems="flex-start" // tương đương align="flex-start"
                  >
                    <Box
                      sx={{
                        borderRadius: "5px",
                        px: "10px",
                        py: "5px",
                        display: "inline-block",
                        backgroundColor:
                          m.sender._id === user_id
                            ? theme.palette.primary.main
                            : alpha(theme.palette.background.default, 1),
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.isRecalled ? (
                        <em style={{ fontStyle: "italic", color: "#A0AEC0" }}>
                          Tin nhắn đã thu hồi
                        </em>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          {/* Text nếu có */}
                          {editingMessage?._id === m._id ? (
                            <>
                              <input
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  borderRadius: "8px",
                                  border: "1px solid #ccc",
                                  fontSize: "14px",
                                  backgroundColor: "white",
                                }}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: "8px",
                                  marginTop: "5px",
                                }}
                              >
                                <button
                                  onClick={handleSaveEditedMessage}
                                  style={{
                                    backgroundColor: "#3182CE",
                                    color: "white",
                                    padding: "6px 12px",
                                    borderRadius: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingMessage(null);
                                    setNewContent("");
                                  }}
                                  style={{
                                    backgroundColor: "#e53e3e",
                                    color: "white",
                                    padding: "6px 12px",
                                    borderRadius: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Hủy
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* {m.type === "text" && ( */}
                              <TextMsg m={m} menu={menu} />
                              {/* )} */}
                              <style>
                                {`
                                .link-style {
                                    color: #3182ce;
                                    text-decoration: underline;
                                  }
                              `}
                              </style>
                              {m.isEdited && (
                                <Typography
                                  variant="body2"
                                  fontSize="11px"
                                  color={
                                    m.sender._id === user_id
                                      ? "#fff"
                                      : theme.palette.text
                                  }
                                >
                                  (Đã chỉnh sửa)
                                </Typography>
                              )}
                            </>
                          )}

                          {/* Ảnh nếu là ảnh */}
                          {m.type === "image" && m.fileUrl && (
                            <>
                              <ImageMsg
                                m={m}
                                menu={menu}
                                imageMessages={imageMessages}
                              />
                            </>
                          )}

                          {m.type === "video" && m.fileUrl && (
                            <MediaMsg m={m} menu={menu} />
                          )}
                          {m.type === "audio" && m.fileUrl && (
                            <AudioMsg m={m} menu={menu} />
                          )}
                          {/* File nếu là file đính kèm */}
                          {m.type === "file" && m.fileUrl && (
                            <DocMsg m={m} menu={menu} />
                          )}
                        </div>
                      )}

                      {/* Timeline nếu là tin nhắn đang được chọn */}
                      {shouldShowTimestamp(current_messages, m, i) && (
                        <Typography
                          color={
                            m.sender._id === user_id
                              ? "#fff"
                              : theme.palette.text
                          }
                          marginTop="5px"
                          fontSize="12px"
                          textAlign={
                            m.sender._id === user_id ? "left" : "right"
                          }
                        >
                          {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      )}
                    </Box>
                    {(isSameSender(current_messages, m, i, user_id) ||
                      isLastMessage(current_messages, i, user_id)) && (
                      <div style={{ marginBottom: "-4px" }}>
                        {m.chat.isGroupChat && (
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {m.sender.fullName}
                          </span>
                        )}
                      </div>
                    )}
                  </Stack>
                </div>
              </Stack>
            </React.Fragment>
          );
        })}
    </Box>
  );
};

const ChatComponent = () => {
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const theme = useTheme();
  const { user_id } = useSelector((state) => state.auth);

  const messageListRef = useRef(null);

  const { current_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );
  console.log("hien tai", current_messages);
  const [showNewMessagePanel, setShowNewMessagePanel] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!current_messages || current_messages.length === 0) return;

    const el = messageListRef.current;

    if (initialLoad) {
      // Lần đầu mở, scroll xuống đáy luôn
      el.scrollTop = el.scrollHeight;
      setInitialLoad(false);
      return;
    }

    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    const lastMessage = current_messages[current_messages.length - 1];
    const isSentByMe = lastMessage.sender._id === user_id;

    if (isBottom || isSentByMe) {
      el.scrollTop = el.scrollHeight;
      setShowNewMessagePanel(false);
    } else {
      setShowNewMessagePanel(true);
    }
  }, [current_messages, user_id, initialLoad]);

  const { room_id } = useSelector((state) => state.app);
  useEffect(() => {
    setInitialLoad(true);
  }, [room_id]); // Hoặc roomid

  const floatUpDown = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
`;

  return (
    <>
      <Stack
        height={"100%"}
        maxHeight={"100vh"}
        width={isMobile ? "100vw" : "auto"}
      >
        {/*  */}
        <ChatHeader />
        <Box
          onScroll={() => {
            const el = messageListRef.current;
            const isBottom =
              el.scrollHeight - el.scrollTop - el.clientHeight < 100;
            setIsAtBottom(isBottom);
            if (isBottom) setShowNewMessagePanel(false);
          }}
          ref={messageListRef}
          width={"100%"}
          sx={{
            position: "relative",
            flexGrow: 1,
            overflow: "scroll",

            backgroundColor:
              theme.palette.mode === "light"
                ? "#F0F4FA"
                : theme.palette.background,

            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <SimpleBarStyle timeout={500} clickOnTrack={false}>
            <Conversation menu={true} isMobile={isMobile} />
          </SimpleBarStyle>
        </Box>

        {/*  */}
        <ChatFooter />
      </Stack>
      {showNewMessagePanel && (
        <Box
          onClick={() => {
            const el = messageListRef.current;
            el.scrollTop = el.scrollHeight;
            setShowNewMessagePanel(false);
          }}
          sx={{
            position: "absolute",
            bottom: 120,
            right: 40,
            backgroundColor: "#1976d2",
            color: "#fff",
            px: 2,
            py: 1,
            borderRadius: "20px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            cursor: "pointer",
            zIndex: 9999,
            animation: `${floatUpDown} 1.2s ease-in-out infinite`,
          }}
        >
          Tin nhắn mới
        </Box>
      )}
    </>
  );
};

export default ChatComponent;

export { Conversation };
