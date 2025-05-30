import {
  Box,
  Fab,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Camera,
  File,
  Image,
  LinkSimple,
  PaperPlaneTilt,
  Smiley,
  Sticker,
  User,
  Trash,
} from "phosphor-react";
import { useTheme, styled } from "@mui/material/styles";
import React, { useRef, useState } from "react";
import useResponsive from "../../hooks/useResponsive";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { socket } from "../../socket";
import { useSelector, useDispatch } from "react-redux";
import { sendDirectMessage } from "../../redux/slices/conversation";

const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    paddingTop: "12px !important",
    paddingBottom: "12px !important",
  },
}));

const Actions = [
  // {
  //   color: "#4da5fe",
  //   icon: <Image size={24} />,
  //   y: 102+70
  //   title: "Photo/Video",
  // },
  {
    color: "#1b8cfe",
    icon: <Sticker size={24} />,
    y: 102,
    title: "Stickers",
  },
  {
    color: "#0172e4",
    icon: <Camera size={24} />,
    y: 172,
    title: "Image",
  },
  {
    color: "#0159b2",
    icon: <File size={24} />,
    y: 242,
    title: "Document",
  },
  {
    color: "#013f7f",
    icon: <User size={24} />,
    y: 312,
    title: "Contact",
  },
];

const ChatInput = ({
  openPicker,
  setOpenPicker,
  setValue,
  value,
  inputRef,
  onActionClick,
  onKeyDown,
}) => {
  const [openActions, setOpenActions] = React.useState(false);

  return (
    <StyledInput
      inputRef={inputRef}
      value={value}
      onKeyDown={onKeyDown}
      onChange={(event) => {
        setValue(event.target.value);
      }}
      fullWidth
      placeholder="Write a message..."
      variant="filled"
      InputProps={{
        disableUnderline: true,
        startAdornment: (
          <Stack sx={{ width: "max-content" }}>
            <Stack
              sx={{
                position: "relative",
                display: openActions ? "inline-block" : "none",
              }}
            >
              {Actions.map((el) => (
                <Tooltip placement="right" title={el.title}>
                  <Fab
                    onClick={() => {
                      onActionClick?.(el.title);
                      setOpenActions(false);
                    }}
                    sx={{
                      position: "absolute",
                      top: -el.y,
                      backgroundColor: el.color,
                    }}
                    aria-label="add"
                  >
                    {el.icon}
                  </Fab>
                </Tooltip>
              ))}
            </Stack>

            <InputAdornment>
              <IconButton
                onClick={() => {
                  setOpenActions(!openActions);
                }}
              >
                <LinkSimple />
              </IconButton>
            </InputAdornment>
          </Stack>
        ),
        endAdornment: (
          <Stack sx={{ position: "relative" }}>
            <InputAdornment>
              <IconButton
                onClick={() => {
                  setOpenPicker(!openPicker);
                }}
              >
                <Smiley />
              </IconButton>
            </InputAdornment>
          </Stack>
        ),
      }}
    />
  );
};

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
}

function containsUrl(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
}

const Footer = () => {
  const theme = useTheme();

  const { current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );

  const user_id = window.localStorage.getItem("user_id");

  const isMobile = useResponsive("between", "md", "xs", "sm");

  const { sideBar, room_id } = useSelector((state) => state.app);

  const [openPicker, setOpenPicker] = React.useState(false);

  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const inputRef = useRef(null);
  const imageInputRef = useRef();
  const fileInputRef = useRef();
  function handleEmojiClick(emoji) {
    const input = inputRef.current;

    if (input) {
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;

      setValue(
        value.substring(0, selectionStart) +
          emoji +
          value.substring(selectionEnd)
      );

      // Move the cursor to the end of the inserted emoji
      input.selectionStart = input.selectionEnd = selectionStart + 1;
    }
  }
  const dispatch = useDispatch();

  const handleSendMessage = () => {
    if (!value.trim() && !selectedFile) return;
    dispatch(sendDirectMessage(value, selectedFile));
    setValue("");
    setSelectedFile(null);
  };

  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: "transparent !important",
      }}
    >
      <Box
        p={isMobile ? 1 : 2}
        width={"100%"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack direction="row" alignItems={"center"} spacing={isMobile ? 1 : 3}>
          <Stack sx={{ width: "100%" }}>
            <Box
              style={{
                zIndex: 10,
                position: "fixed",
                display: openPicker ? "inline" : "none",
                bottom: 81,
                right: isMobile ? 20 : sideBar.open ? 420 : 100,
              }}
            >
              <Picker
                theme={theme.palette.mode}
                data={data}
                onEmojiSelect={(emoji) => {
                  handleEmojiClick(emoji.native);
                }}
              />
            </Box>
            {/* Chat Input */}
            <ChatInput
              inputRef={inputRef}
              value={value}
              setValue={setValue}
              openPicker={openPicker}
              setOpenPicker={setOpenPicker}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              onActionClick={(title) => {
                if (title === "Image") {
                  imageInputRef.current?.click();
                } else if (title === "Document") {
                  fileInputRef.current?.click();
                } else {
                  console.log("Other action clicked:", title);
                }
              }}
            />
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              style={{ display: "none" }}
              ref={imageInputRef}
              onChange={(e) => {
                setSelectedFile(e.target.files[0]);
                e.target.value = ""; // Cho phép chọn lại cùng một file
              }}
            />

            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={(e) => {
                setSelectedFile(e.target.files[0]);
                e.target.value = ""; // Cho phép chọn lại cùng một file
              }}
            />
          </Stack>
          <Box
            sx={{
              height: 48,
              width: 48,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1.5,
              cursor: "pointer",
            }}
            onClick={handleSendMessage}
          >
            <Stack
              sx={{ height: "100%" }}
              alignItems={"center"}
              justifyContent="center"
            >
              <IconButton>
                <PaperPlaneTilt color="#ffffff" />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
        {selectedFile && (
          <Box
            sx={{
              padding: 2,
              borderWidth: 1,
              borderRadius: "8px",
              backgroundColor: "gray.100",
              maxWidth: "100px",
              borderColor: "gray.300",
              position: "relative",
            }}
          >
            {/* Nút "Xóa" nằm ở góc trên bên phải */}
            <IconButton
              onClick={() => setSelectedFile(null)}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 1,
              }}
              variant="ghost"
              size="small"
            >
              <Trash />
            </IconButton>

            {/* Hiển thị ảnh nếu là file ảnh */}
            {selectedFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                style={{
                  maxHeight: "100px",
                  borderRadius: "8px",
                  objectFit: "cover", // Đảm bảo ảnh không bị kéo dài
                }}
              />
            ) : selectedFile.type.startsWith("video/") ? (
              <Box sx={{ textAlign: "center" }}>
                <video
                  controls
                  // src={URL.createObjectURL(selectedFile)}
                  style={{
                    maxHeight: "100px",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />

                {/* Hiển thị tên file video */}
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    mt: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  ▶{selectedFile.name}
                </Typography>
              </Box>
            ) : selectedFile.type.startsWith("audio/") ? (
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    mt: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  🎵{selectedFile.name}
                </Typography>
              </Box>
            ) : (
              <Typography
                sx={{
                  fontSize: "1rem",
                  mt: 1,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                🔗{selectedFile.name}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Footer;
