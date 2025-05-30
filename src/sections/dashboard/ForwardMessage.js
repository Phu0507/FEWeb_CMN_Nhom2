import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Slide,
  Stack,
  Tab,
  Tabs,
  TextField,
  CircularProgress,
  Badge,
  Box,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import {
  ChatElement,
  GroupChatElement,
  FriendElement,
} from "../../components/ForwardMessageElement";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ChatList = ({ message }) => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );

  // Lọc các đoạn chat dựa theo search
  const filteredConversations = conversations.filter((conversation) =>
    conversation.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Stack spacing={2}>
      <TextField
        label="Tìm kiếm đoạn chat"
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Stack spacing={1}>
        <p>Đoạn chat gần đây:</p>
        {filteredConversations.length > 0 ? (
          filteredConversations.map((user, idx) => (
            <ChatElement key={idx} {...user} message={message} />
          ))
        ) : (
          <p></p>
        )}
      </Stack>
    </Stack>
  );
};

const FriendsList = ({ message }) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const { friends } = useSelector((state) => state.app);

  // Lọc bạn bè theo tên (giả sử mỗi friend có trường `name`)
  const filteredFriends = friends?.filter((friend) =>
    friend.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Stack spacing={2}>
      <TextField
        label="Tìm kiếm bạn bè"
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Stack spacing={1}>
        {filteredFriends?.length > 0 ? (
          filteredFriends.map((el, idx) => (
            <FriendElement key={idx} {...el} message={message} />
          ))
        ) : (
          <div>Không tìm thấy bạn bè nào phù hợp.</div>
        )}
      </Stack>
    </Stack>
  );
};

const GroupsList = ({ message }) => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );

  // Lọc nhóm chat theo search
  const filteredGroups = conversations
    .filter((conver) => conver.isGroup)
    .filter((group) => group.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Stack spacing={2}>
      <TextField
        label="Tìm kiếm nhóm chat"
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Stack spacing={1}>
        <p>Nhóm chat:</p>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((user, idx) => (
            <GroupChatElement key={idx} {...user} message={message} />
          ))
        ) : (
          <p></p>
        )}
      </Stack>
    </Stack>
  );
};

const ForwardMessage = ({ open, handleClose, message }) => {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      sx={{ p: 4 }}
    >
      {/* <DialogTitle>{"Friends"}</DialogTitle> */}
      <Stack p={2} sx={{ width: "100%" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Recent Chat" />
          <Tab label="Group Chat" />
          <Tab label="Friends" />
        </Tabs>
      </Stack>
      <DialogContent>
        <Stack sx={{ height: "100%" }}>
          <Stack spacing={2.4}>
            {(() => {
              switch (value) {
                case 0: // display all users in this list
                  return <ChatList message={message} />;

                case 1: // display request in this list
                  return <GroupsList message={message} />;
                case 2: // display friends in this list
                  return <FriendsList message={message} />;

                default:
                  break;
              }
            })()}
          </Stack>
        </Stack>
      </DialogContent>
      {message && (
        <Box
          m={2}
          p={2}
          sx={{
            borderRadius: 5,
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
          }}
        >
          {renderMessageContent(message)}
        </Box>
      )}
    </Dialog>
  );
};
const renderMessageContent = (msg) => {
  if (msg.type === "image") {
    return (
      <img
        src={msg.fileUrl}
        alt="Forwarded"
        style={{ maxWidth: "100px", height: "100px", borderRadius: 5 }}
      />
    );
  }
  if (msg.type === "video") {
    return (
      <video
        controls
        style={{
          maxWidth: "100px",
          width: "100%",
          height: "100px",
          objectFit: "cover",
          borderRadius: 5,
        }}
      >
        <source src={msg.fileUrl} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    );
  }
  if (msg.type === "audio") {
    return (
      <audio controls src={msg.fileUrl}>
        Trình duyệt không hỗ trợ phát âm thanh.
      </audio>
    );
  }
  if (msg.type === "file") {
    const fileName = decodeURIComponent(msg.fileUrl.split("/").pop());
    return (
      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
        {fileName}
      </a>
    );
  }
  return <Typography>{msg.content}</Typography>; // fallback là văn bản
};

export default ForwardMessage;
