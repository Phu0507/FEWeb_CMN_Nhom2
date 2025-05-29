import React, { useState, useEffect } from "react";
import {
  Stack,
  Box,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { DotsThreeVertical, DownloadSimple, Image } from "phosphor-react";
import { Message_options } from "../../data";
import { Link } from "react-router-dom";
import truncateString from "../../utils/truncate";
import { LinkPreview } from "@dhaiwat10/react-link-preview";
import Embed from "react-embed";
import Linkify from "linkify-react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
const user_id = localStorage.getItem("user_id");

const MessageOption = ({
  message,
  user_id,
  onRecall,
  onForward,
  onEdit,
  onDelete,
  onDeleteForOther,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isMyMessage = message.sender._id === user_id;

  const handleMenuClick = (action) => {
    switch (action) {
      case "Recall message":
        onRecall?.(message._id);
        break;
      case "Forward message":
        onForward?.(message);
        break;
      case "Edit message":
        onEdit?.(message);
        break;
      case "Delete message":
        if (isMyMessage) {
          onDelete?.(message._id); // của mình
        } else {
          onDeleteForOther?.(message._id); // của người khác
        }
        break;
      default:
        break;
    }
    handleClose();
  };

  return (
    <>
      <DotsThreeVertical
        size={30}
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        cursor={"pointer"}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "basic-button" }}
      >
        <Stack spacing={1} px={1}>
          {Message_options.map((el) => {
            if (
              isMyMessage ||
              el.title === "Forward message" ||
              el.title === "Delete message" // Cho phép hiển thị cho cả người khác
            ) {
              return (
                <MenuItem
                  key={el.title}
                  onClick={() => handleMenuClick(el.title)}
                >
                  {el.title}
                </MenuItem>
              );
            }
            return null;
          })}
        </Stack>
      </Menu>
    </>
  );
};

const TextMsg = ({ m, menu }) => {
  const theme = useTheme();

  return (
    <Stack direction="row">
      <Box>
        <Linkify
          options={{
            target: "_blank",
            rel: "noopener noreferrer",
            className: "link-style",
          }}
        >
          <Typography
            variant="body2"
            color={m.sender._id === user_id ? "#fff" : theme.palette.text}
          >
            {m.content}
          </Typography>
        </Linkify>
      </Box>
      {/* {menu && <MessageOption />} */}
    </Stack>
  );
};

const MediaMsg = ({ m, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction="row">
      <Box>
        <Stack spacing={1}>
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
        </Stack>
      </Box>
      {/* {menu && <MessageOption />} */}
    </Stack>
  );
};

const AudioMsg = ({ m, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction="row">
      <Box>
        <Stack spacing={1}>
          <audio controls src={m.fileUrl}>
            Trình duyệt không hỗ trợ phát âm thanh.
          </audio>
        </Stack>
      </Box>
      {/* {menu && <MessageOption />} */}
    </Stack>
  );
};
const ImageMsg = ({ m, menu, imageMessages }) => {
  const theme = useTheme();
  //new
  const [isOpen, setIsOpen] = useState(false); // Mở lightbox
  const [photoIndex, setPhotoIndex] = useState(0); // Chỉ số ảnh trong lightbox
  return (
    <Stack direction="row">
      <Box>
        <Stack spacing={1}>
          <img
            src={m.fileUrl}
            onClick={() => {
              const index = imageMessages.findIndex((img) => img._id === m._id);
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
              textAlign: m.sender._id === user_id ? "left" : "right",
            }}
          >
            <a
              href={m.fileUrl}
              download
              style={{
                color:
                  m.sender._id === user_id
                    ? "#fff"
                    : theme.palette.text.primary,
                textDecoration: "underline",
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              <DownloadSimple size={24} />
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
                photoIndex > 0 && setPhotoIndex(photoIndex - 1)
              }
              onMoveNextRequest={() =>
                photoIndex < imageMessages.length - 1 &&
                setPhotoIndex(photoIndex + 1)
              }
              imageTitle={`Ảnh từ nhóm: ${imageMessages[photoIndex].chat.chatName}`}
              imageCaption={`Gửi bởi: ${imageMessages[photoIndex].sender.fullName}`}
            />
          )}
        </Stack>
      </Box>
      {/* {menu && <MessageOption />} */}
    </Stack>
  );
};
const DocMsg = ({ m, menu }) => {
  const fileName = decodeURIComponent(m.fileUrl.split("/").pop());
  return (
    <Stack direction="row">
      <Box>
        <Stack spacing={2}>
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
            {fileName}
          </a>
        </Stack>
      </Box>
      {/* {menu && <MessageOption />} */}
    </Stack>
  );
};
const LinkMsg = ({ el, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: el.incoming
            ? alpha(theme.palette.background.default, 1)
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="column"
            spacing={3}
            alignItems="start"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <Stack direction={"column"} spacing={2}>
              <Embed
                width="300px"
                isDark
                url={`https://youtu.be/xoWxBR34qLE`}
              />
            </Stack>
          </Stack>
          <Typography
            variant="body2"
            color={el.incoming ? theme.palette.text : "#fff"}
          >
            <div dangerouslySetInnerHTML={{ __html: el.message }}></div>
          </Typography>
        </Stack>
      </Box>
      {/* {menu && <MessageOption />} */}
    </Stack>
  );
};
const ReplyMsg = ({ el, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: el.incoming
            ? alpha(theme.palette.background.paper, 1)
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="column"
            spacing={3}
            alignItems="center"
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 1),

              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color={theme.palette.text}>
              {el.message}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color={el.incoming ? theme.palette.text : "#fff"}
          >
            {el.reply}
          </Typography>
        </Stack>
      </Box>
      {/* {menu && <MessageOption />} */}
    </Stack>
  );
};
const Timeline = ({ el }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems={"center"} justifyContent="space-between">
      <Divider width="46%" />
      <Typography variant="caption" sx={{ color: theme.palette.text }}>
        {el.text}
      </Typography>
      <Divider width="46%" />
    </Stack>
  );
};

export {
  Timeline,
  ImageMsg,
  MediaMsg,
  AudioMsg,
  LinkMsg,
  DocMsg,
  TextMsg,
  ReplyMsg,
  MessageOption,
};
