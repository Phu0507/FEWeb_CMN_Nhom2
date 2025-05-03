import { Stack, Box, Typography, Avatar } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";

import { ChatHeader, ChatFooter } from "../../components/Chat";
import useResponsive from "../../hooks/useResponsive";
import { Chat_History } from "../../data";
import {
  DocMsg,
  LinkMsg,
  MediaMsg,
  ReplyMsg,
  TextMsg,
  Timeline,
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

  const { conversations, current_messages, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { room_id } = useSelector((state) => state.app);

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
    setEditingMessage(null);
    setNewContent("");
  };

  const imageMessages = current_messages.filter(
    (msg) => msg.type === "image" && msg.fileUrl && !msg.isRecalled
  );

  useEffect(() => {
    dispatch(getCurrentMessagesFromServer(room_id));
    socket.emit("joinChat", room_id);
    const handleMessage = (message) => {
      if (message.chat._id === current_conversation?.id) {
        dispatch(AddDirectMessage(message));
      }
    };

    const handleRecallMessage = (updatedMsg) => {
      dispatch(RecallDirectMessage(updatedMsg._id));
    };

    const handleEdit = (updatedMsg) => {
      dispatch(EditDirectMessage(updatedMsg._id, updatedMsg.content));
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
      {/* <Stack spacing={3}>
        {current_messages.map((el, idx) => {
          switch (el.type) {
            case "divider":
              return (
                // Timeline
                <Timeline el={el} />
              );

            case "msg":
              switch (el.subtype) {
                case "image":
                  return (
                    // Media Message
                    <MediaMsg el={el} menu={menu} />
                  );

                case "doc":
                  return (
                    // Doc Message
                    <DocMsg el={el} menu={menu} />
                  );
                case "Link":
                  return (
                    //  Link Message
                    <LinkMsg el={el} menu={menu} />
                  );

                case "reply":
                  return (
                    //  ReplyMessage
                    <ReplyMsg el={el} menu={menu} />
                  );

                default:
                  return (
                    // Text Message
                    <TextMsg el={el} menu={menu} />
                  );
              }

            default:
              return <></>;
          }
        })}
      </Stack> */}
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
                  }}
                  onMouseEnter={() => setHoveredMsgId(m._id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                >
                  {hoveredMsgId === m._id && m.sender._id === user_id && (
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginBottom: "6px",
                        marginRight: "4px",
                      }}
                    >
                      <button
                        onClick={() => handleRecall(m._id)}
                        style={{
                          fontSize: "12px",
                          padding: "4px 6px",
                          backgroundColor: "#a0aec0",
                          borderRadius: "5px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Thu hồi
                      </button>
                      <button
                        onClick={() => handDeleteMessageForMe(m._id)}
                        style={{
                          fontSize: "12px",
                          padding: "4px 6px",
                          backgroundColor: "#fc8181",
                          borderRadius: "5px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => handleEditMessage(m)}
                        style={{
                          fontSize: "12px",
                          padding: "4px 6px",
                          backgroundColor: "#90cdf4",
                          borderRadius: "5px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Chỉnh sửa
                      </button>
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
                              <Linkify
                                options={{
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  className: "link-style",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color={
                                    m.sender._id === user_id
                                      ? "#fff"
                                      : theme.palette.text
                                  }
                                >
                                  {m.content}
                                </Typography>
                                {/* <TextMsg m={m} menu={menu} /> */}
                              </Linkify>
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
                              <img
                                src={m.fileUrl}
                                onClick={() => {
                                  const index = imageMessages.findIndex(
                                    (img) => img._id === m._id
                                  );
                                  setPhotoIndex(index);
                                  setTimeout(() => {
                                    setIsOpen(true);
                                  }, 0);
                                }}
                                style={{
                                  maxWidth: "500px",
                                  width: "100%",
                                  height: "250px",
                                  objectFit: "cover",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                }}
                              />

                              {/* Nút tải ảnh */}
                              <div
                                style={{
                                  textAlign:
                                    m.sender._id === user_id ? "left" : "right",
                                }}
                              >
                                <a
                                  href={m.fileUrl}
                                  download
                                  style={{
                                    color: "#3182CE",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    display: "inline-block",
                                  }}
                                >
                                  {/* <RiDownload2Line size={20} /> */}
                                </a>
                              </div>

                              {/* Lightbox */}
                              {isOpen && (
                                <Lightbox
                                  mainSrc={imageMessages[photoIndex].fileUrl}
                                  nextSrc={
                                    photoIndex < imageMessages.length - 1
                                      ? imageMessages[photoIndex + 1].fileUrl
                                      : undefined
                                  }
                                  prevSrc={
                                    photoIndex > 0
                                      ? imageMessages[photoIndex - 1].fileUrl
                                      : undefined
                                  }
                                  onCloseRequest={() => setIsOpen(false)}
                                  onMovePrevRequest={() =>
                                    photoIndex > 0 &&
                                    setPhotoIndex(photoIndex - 1)
                                  }
                                  onMoveNextRequest={() =>
                                    photoIndex < imageMessages.length - 1 &&
                                    setPhotoIndex(photoIndex + 1)
                                  }
                                  imageTitle={`Ảnh từ nhóm: ${imageMessages[photoIndex].chat.chatName}`}
                                  imageCaption={`Gửi bởi: ${imageMessages[photoIndex].sender.fullName}`}
                                />
                              )}
                            </>
                          )}

                          {m.type === "video" && m.fileUrl && (
                            <video
                              controls
                              style={{
                                maxWidth: "400px",
                                width: "100%",
                                height: "500px",
                                objectFit: "cover",
                              }}
                            >
                              <source src={m.fileUrl} type="video/mp4" />
                              Trình duyệt của bạn không hỗ trợ video.
                            </video>
                          )}
                          {m.type === "audio" && m.fileUrl && (
                            <audio controls src={m.fileUrl}>
                              Trình duyệt không hỗ trợ phát âm thanh.
                            </audio>
                          )}
                          {/* File nếu là file đính kèm */}
                          {m.type === "file" &&
                            m.fileUrl &&
                            (() => {
                              const fileName = decodeURIComponent(
                                m.fileUrl.split("/").pop()
                              );
                              const extension = fileName
                                .split(".")
                                .pop()
                                .toLowerCase();
                              const fileIcons = {
                                pdf: "📄",
                                doc: "📄",
                                docx: "📄",
                                xls: "📊",
                                xlsx: "📊",
                                ppt: "📽️",
                                pptx: "📽️",
                                rar: "🗜️",
                                zip: "🗜️",
                                txt: "📄",
                                mp3: "🎵",
                                mp4: "🎞️",
                                default: "📎",
                              };
                              const icon =
                                fileIcons[extension] || fileIcons.default;

                              return (
                                <a
                                  href={m.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    color: "#3182CE",
                                    textDecoration: "underline",
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <span style={{ fontSize: "18px" }}>
                                    {icon}
                                  </span>
                                  {fileName}
                                </a>
                              );
                            })()}
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

  const messageListRef = useRef(null);

  const { current_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );

  useEffect(() => {
    // Scroll to the bottom of the message list when new messages are added
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [current_messages]);

  return (
    <Stack
      height={"100%"}
      maxHeight={"100vh"}
      width={isMobile ? "100vw" : "auto"}
    >
      {/*  */}
      <ChatHeader />
      <Box
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
  );
};

export default ChatComponent;

export { Conversation };
