import { createSlice } from "@reduxjs/toolkit";
import { faker } from "@faker-js/faker";
import axios from "../../utils/axios";
import { socket } from "../../socket";

// const user_id = localStorage.getItem("user_id");
// console.log("id", user_id);

const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: null,
    current_messages: [],
  },
  group_chat: {},
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const user_id = localStorage.getItem("user_id");
      console.log("id2", user_id);
      const list = action.payload.conversations.map((el) => {
        const isGroup = el.isGroupChat;

        if (isGroup) {
          // Nếu là nhóm, trả về thông tin nhóm
          const userIds = el.users
            .map((u) => u._id)
            .filter((id) => id !== user_id);
          return {
            id: el._id,
            user_id: userIds,
            name: el.chatName,
            time: "9:37",
            unread: 2,
            pinned: false,
            groupAdmin: el.groupAdmin?._id,
          };
        } else {
          // Nếu là cuộc trò chuyện cá nhân, trả về thông tin cuộc trò chuyện
          const otherUser = el.users.find((u) => u._id.toString() !== user_id);
          return {
            id: el._id,
            user_id: otherUser?._id,
            name: otherUser?.fullName,
            online: otherUser?.status === "online",
            img: otherUser?.avatar,
            time: "9:36",
            unread: 1,
            pinned: false,
          };
        }
      });
      state.direct_chat.conversations = list;
    },
    updateDirectConversation(state, action) {
      const user_id = localStorage.getItem("user_id");
      const this_conversation = action.payload.conversation;
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) => {
          if (el?.id !== this_conversation._id) {
            return el;
          } else {
            const user = this_conversation.participants.find(
              (elm) => elm._id.toString() !== user_id
            );
            return {
              id: this_conversation._id._id,
              user_id: user?._id,
              name: `${user?.firstName} ${user?.lastName}`,
              online: user?.status === "Online",
              img: faker.image.avatar(),
              msg: faker.music.songName(),
              time: "9:36",
              unread: 0,
              pinned: false,
            };
          }
        }
      );
    },
    addDirectConversation(state, action) {
      const user_id = localStorage.getItem("user_id");
      const this_conversation = action.payload.conversation;
      const user = this_conversation.participants.find(
        (elm) => elm._id.toString() !== user_id
      );
      state.direct_chat.conversations = state.direct_chat.conversations.filter(
        (el) => el?.id !== this_conversation._id
      );
      state.direct_chat.conversations.push({
        id: this_conversation._id._id,
        user_id: user?._id,
        name: `${user?.firstName} ${user?.lastName}`,
        online: user?.status === "Online",
        img: faker.image.avatar(),
        msg: faker.music.songName(),
        time: "9:36",
        unread: 0,
        pinned: false,
      });
    },
    setCurrentConversation(state, action) {
      state.direct_chat.current_conversation = action.payload.conversation;
    },
    fetchCurrentMessages(state, action) {
      const messages = action.payload.messages;
      console.log(messages);
      state.direct_chat.current_messages = messages;
      // const formatted_messages = messages.map((el) => ({
      //   id: el._id,
      //   type: "msg",
      //   subtype: el.type,
      //   message: el.content,
      //   incoming: el.to === user_id,
      //   outgoing: el.from !== user_id,
      //   fileUrl: el.fileUrl,
      // }));
      // state.direct_chat.current_messages = formatted_messages;
    },
    addDirectMessage(state, action) {
      state.direct_chat.current_messages.push(action.payload.message);
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const FetchDirectConversations = ({ conversations }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchDirectConversations({ conversations }));
  };
};
export const AddDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectConversation({ conversation }));
  };
};
export const UpdateDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateDirectConversation({ conversation }));
  };
};

export const SetCurrentConversation = (current_conversation) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.setCurrentConversation(current_conversation));
  };
};

export const FetchCurrentMessages = ({ messages }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchCurrentMessages({ messages }));
  };
};

export const AddDirectMessage = (message) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectMessage({ message }));
  };
};

//new
export const getConversationsFromServer = () => {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.token; // Lấy token từ redux

      const response = await axios.get("/api/chat", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const conversations = response.data; // server trả về mảng conversations
      // console.log(conversations);
      dispatch(FetchDirectConversations({ conversations }));
    } catch (error) {
      console.error("Lỗi khi fetch conversations:", error);
    }
  };
};

export const getCurrentMessagesFromServer = (conversationId) => {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.token;

      const response = await axios.get(`/api/message/${conversationId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const messages = response.data; // server trả về mảng messages
      dispatch(FetchCurrentMessages({ messages }));
    } catch (error) {
      console.error("Lỗi khi fetch current messages:", error);
    }
  };
};

export const sendDirectMessage = (message, selectedFile) => {
  return async (dispatch, getState) => {
    try {
      // Lấy token và ID cuộc trò chuyện từ Redux store
      const token = getState().auth.token; // Token từ Redux store
      const current = getState().conversation.direct_chat.current_conversation;

      // const room_id = getState().app.room_id;
      // const conversations = getState().conversation.direct_chat.conversations;
      // const current = conversations.find((el) => el?.id === room_id);

      const conversationId = current.id;

      const formData = new FormData();
      formData.append("chatId", conversationId);
      if (message.trim()) formData.append("content", message);
      if (selectedFile) {
        formData.append("file", selectedFile);
        const fileType = selectedFile.type;

        let type = "file";
        if (fileType.startsWith("image/")) {
          type = "image";
        } else if (fileType.startsWith("video/")) {
          type = "video";
        } else if (fileType.startsWith("audio/")) {
          type = "audio";
        }
        formData.append("type", type);
      }

      const response = await axios.post("/api/message", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // dispatch(AddDirectMessage(response.data));
      socket.emit("newMessage", response.data);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };
};
