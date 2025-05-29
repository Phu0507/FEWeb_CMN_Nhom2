import { createSlice } from "@reduxjs/toolkit";
import { faker } from "@faker-js/faker";
import axios from "../../utils/axios";
import { socket } from "../../socket";
import { SelectConversation } from "./app";
import { showSnackbar } from "./app";

// const user_id = localStorage.getItem("user_id");
// console.log("id", user_id);

const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: null,
    current_messages: [],
    fetchAgain: false, // thêm dòng này
  },
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const user_id = localStorage.getItem("user_id");

      const list = action.payload.conversations.map((el) => {
        const isGroup = el.isGroupChat;
        const latestMessage = el.latestMessage;
        const msgTime = latestMessage?.createdAt || "";

        if (isGroup) {
          return {
            id: el._id,
            user_id: el.users,
            name: el.chatName,
            time: msgTime,
            unread: 0,
            isGroup: el.isGroupChat,
            groupAdmin: el.groupAdmin?._id,
            latestMessage: el.latestMessage,
          };
        } else {
          const otherUser = el.users.find((u) => u._id.toString() !== user_id);
          return {
            id: el._id,
            user_id: otherUser?._id,
            name: otherUser?.fullName,
            online: otherUser?.status === "online",
            img: otherUser?.avatar,
            time: msgTime,
            unread: 0,
            latestMessage: el.latestMessage,
            email: otherUser?.email,
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
    recallDirectMessage(state, action) {
      const messageId = action.payload.messageId;
      state.direct_chat.current_messages =
        state.direct_chat.current_messages.map((msg) =>
          msg._id === messageId ? { ...msg, isRecalled: true } : msg
        );
    },
    deleteMessageForMe(state, action) {
      const messageId = action.payload;
      state.direct_chat.current_messages =
        state.direct_chat.current_messages.filter(
          (msg) => msg._id !== messageId
        );
    },
    editDirectMessage(state, action) {
      const { messageId, newContent } = action.payload;
      state.direct_chat.current_messages =
        state.direct_chat.current_messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, content: newContent, isEdited: true }
            : msg
        );
    },

    //new
    toggleFetchAgain(state) {
      state.direct_chat.fetchAgain = !state.direct_chat.fetchAgain;
    },

    groupChatUpdated(state, action) {
      const updatedChat = transformChatToConversation(
        action.payload.updatedChat
      );
      // console.log("update", updatedChat);
      // console.log(
      //   "update2",
      //   JSON.parse(JSON.stringify(state.direct_chat.conversations))
      // );

      const alreadyExists = state.direct_chat.conversations.some(
        (chat) => chat.id === updatedChat.id
      );

      state.direct_chat.conversations = alreadyExists
        ? state.direct_chat.conversations.map((chat) =>
            chat.id === updatedChat.id ? updatedChat : chat
          )
        : [updatedChat, ...state.direct_chat.conversations];

      if (
        state.direct_chat.current_conversation &&
        state.direct_chat.current_conversation.id === updatedChat.id
      ) {
        state.direct_chat.current_conversation = updatedChat;
      }
    },
    updateGroupAdmin: (state, action) => {
      const chatId = action.payload.chatId;
      const newAdminId = action.payload.newAdminId;
      // console.log("chattttt", chatId);
      // console.log("chattttt minnnn", newAdminId);
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (chat) =>
          chat.id === chatId ? { ...chat, groupAdmin: newAdminId } : chat
      );

      if (
        state.direct_chat.current_conversation &&
        state.direct_chat.current_conversation.id === chatId
      ) {
        state.direct_chat.current_conversation.groupAdmin = newAdminId;
      }
    },
    removeConversation: (state, action) => {
      const chatId = action.payload.chatId;
      // console.log("hiiii", chatId);
      // Xoá cuộc trò chuyện ra khỏi danh sách
      state.direct_chat.conversations = state.direct_chat.conversations.filter(
        (chat) => chat.id !== chatId
      );

      // Nếu cuộc trò chuyện hiện tại đang là cái bị xoá thì reset về null
      if (
        state.direct_chat.current_conversation &&
        state.direct_chat.current_conversation.id === chatId
      ) {
        state.direct_chat.current_conversation = null;
      }
    },
    addNewGroupChat(state, action) {
      const newGroup = transformChatToConversation(action.payload.newGroup);
      state.direct_chat.conversations.unshift(newGroup);
    },
    updateConversationLastMessage(state, action) {
      const { messageId, newContent } = action.payload;

      const conversation = state.direct_chat.conversations.find(
        (conv) => conv.latestMessage?._id === messageId
      );
      console.log("tin nhắn cuối", conversation.latestMessage.content);
      if (conversation) {
        conversation.latestMessage.content = newContent;
        conversation.latestMessage.isEdited = true;
      }
    },
    updateConversationRecall(state, action) {
      const { messageId } = action.payload;

      const conversation = state.direct_chat.conversations.find(
        (conv) => conv.latestMessage?._id === messageId
      );

      if (conversation && conversation.latestMessage) {
        conversation.latestMessage.isRecalled = true;
      }
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
// new export
export const RecallDirectMessage = (messageId) => {
  return (dispatch) => {
    dispatch(slice.actions.recallDirectMessage({ messageId }));
  };
};

export const EditDirectMessage = (messageId, newContent) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.editDirectMessage({ messageId, newContent }));
  };
};

export const ToggleFetchAgain = () => {
  return (dispatch) => {
    dispatch(slice.actions.toggleFetchAgain());
  };
};

export const GroupChatUpdated = (updatedChat) => {
  return (dispatch) => {
    dispatch(slice.actions.groupChatUpdated({ updatedChat }));
  };
};

export const UpdateGroupAdmin = (chatId, newAdminId) => {
  return (dispatch) => {
    dispatch(slice.actions.updateGroupAdmin(chatId, newAdminId));
  };
};

export const RemoveConversation = (chatId) => {
  return (dispatch) => {
    dispatch(slice.actions.removeConversation({ chatId }));
  };
};

export const AddNewGroupChat = (newGroup) => {
  return (dispatch) => {
    dispatch(slice.actions.addNewGroupChat({ newGroup }));
  };
};
export const UpdateConversationLastMessage = ({ messageId, newContent }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateConversationLastMessage({
        messageId,
        newContent,
      })
    );
  };
};
export const UpdateConversationRecall = ({ messageId }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateConversationRecall({
        messageId,
      })
    );
  };
};
//new api
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
      console.log("ý", conversations);
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

      const messages = response.data;
      console.log("message", response.data); // server trả về mảng messages
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

export const recallMessage = (messageId) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;
      const messages = state.conversation.direct_chat.current_messages;
      const message = messages.find((msg) => msg._id === messageId);

      if (!message) {
        dispatch(
          showSnackbar({
            severity: "error",
            message: "Không tìm thấy tin nhắn",
          })
        );
        return;
      }

      if (message.isRecalled) {
        dispatch(
          showSnackbar({
            severity: "error",
            message: "Tin nhắn này đã được thu hồi trước đó.",
          })
        );
        return;
      }

      const messageDate = new Date(message.createdAt);
      const today = new Date();

      const isSameDay =
        messageDate.getDate() === today.getDate() &&
        messageDate.getMonth() === today.getMonth() &&
        messageDate.getFullYear() === today.getFullYear();

      if (!isSameDay) {
        dispatch(
          showSnackbar({
            severity: "error",
            message: "Bạn chỉ có thể thu hồi tin nhắn trong ngày.",
          })
        );
        return;
      }

      await axios.put(
        `/api/message/recall/${messageId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(slice.actions.recallDirectMessage({ messageId }));

      socket.emit("recallMessage", { _id: messageId });
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi thu hồi tin nhắn";
      alert(msg);
      console.error("Error recalling message:", err);
    }
  };
};

export const deleteMessage = (messageId) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;
      await axios.put(
        `http://localhost:5000/api/message/delete-for-me/${messageId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(slice.actions.deleteMessageForMe(messageId));
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xóa tin nhắn");
    }
  };
};

export const deleteMessageOther = (messageId) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;
      await axios.put(
        `http://localhost:5000/api/message/delete-for-receiver/${messageId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(slice.actions.deleteMessageForMe(messageId));
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xóa tin nhắn");
    }
  };
};

export const editMessage = (messageId, newContent) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await axios.put(
        `http://localhost:5000/api/message/edit/${messageId}`,
        { content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log("Response from API:", response);

      if (response.status === 200) {
        dispatch(slice.actions.editDirectMessage({ messageId, newContent }));
      }
      socket.emit("messageEdited", response.data);
    } catch (error) {
      console.error("Lỗi khi cập nhật tin nhắn:", error);
    }
  };
};

export const forwardToFriend = (target, messageToForward) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;

      let chatIdToUse = target._id;

      // Nếu không phải group (chat cá nhân), tạo chat mới với bạn
      if (!target.isGroup) {
        const resChat = await axios.post(
          "/api/chat",
          { userId: target._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        chatIdToUse = resChat.data._id;
      }

      // Gửi tin nhắn đến chatId (nhóm hoặc chat cá nhân)
      const res = await axios.post(
        "/api/message/forward",
        {
          messageId: messageToForward._id,
          toChatId: chatIdToUse,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Nếu bạn có action hiển thị snackbar hoặc toggle fetch lại, gọi ở đây:
      dispatch(
        showSnackbar({ severity: "success", message: "Chuyển tiếp thành công" })
      );
    } catch (err) {
      console.error("Chuyển tiếp lỗi:", err.message);
      dispatch(
        showSnackbar({ severity: "error", message: "Chuyển tiếp thất bại" })
      );
    } finally {
    }
  };
};

export const renameGroup = (newName, chatId) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await axios.put(
        "http://localhost:5000/api/chat/rename",
        {
          chatId: chatId,
          chatName: newName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log("Response from API:", response.data);

      // dispatch(SetCurrentConversation(response.data));
      dispatch(ToggleFetchAgain());
      socket.emit("group:updated", response.data);
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message: "Trưởng nhóm mới có quyền đổi tên",
        })
      );
    }
  };
};

export const transferGroupAdmin = (chatId, newAdminId) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await axios.put(
        `http://localhost:5000/api/chat/transferAdmin/${chatId}`,
        {
          newAdminId: newAdminId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("Admin transferred:", response.data);

      dispatch(ToggleFetchAgain());
    } catch (error) {
      console.error("Lỗi khi chuyển quyền trưởng nhóm:", error);
    }
  };
};

export const removeGroupMember = (chatId, userId) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await axios.put(
        "http://localhost:5000/api/chat/groupremove",
        {
          chatId: chatId,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("Member removed:", response.data);
      socket.emit("group:updated", response.data);
      dispatch(ToggleFetchAgain());
    } catch (error) {
      console.error("Lỗi khi xóa thành viên:", error);
    }
  };
};

export const removeGroup = (chatId) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await axios.delete(
        `http://localhost:5000/api/chat/dissGroup/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(ToggleFetchAgain());
    } catch (error) {
      console.error("Lỗi khi giải tán nhóm:", error);
    }
  };
};

export const createGroup = (groupChatName, selectedUsers) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const payload = {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      };

      const response = await axios.post("/api/chat/group", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newGroup = response.data;
      socket.emit("group:new", newGroup);
      const group = transformChatToConversation(newGroup);
      dispatch(SelectConversation({ room_id: group.id }));
      dispatch(SetCurrentConversation({ conversation: group }));
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      throw error; // nếu muốn handle ở component
    }
  };
};

export const accessChat = (userId) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await axios.post(
        "/api/chat",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const chat = response.data;
      console.log("chat don", response.data);
      const singleChat = transformDirectChat(chat);
      dispatch(SelectConversation({ room_id: singleChat.id }));
      dispatch(SetCurrentConversation({ conversation: singleChat }));
      dispatch(ToggleFetchAgain());
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      throw error; // nếu muốn handle ở component
    }
  };
};

export const addUsersToGroup = (chatId, selectedUsers) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const payload = {
        chatId,
        userId: selectedUsers.map((u) => u._id),
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put("/api/chat/groupadd", payload, config);
      socket.emit("group:updated", data);
      dispatch(ToggleFetchAgain());
    } catch (err) {
      console.error("Lỗi khi thêm:", err);
      throw err; // Nếu muốn component xử lý lỗi tiếp
    }
  };
};

export const transformChatToConversation = (chat) => {
  const msgTime = chat.latestMessage?.createdAt || new Date().toISOString();

  return {
    id: chat._id,
    user_id: chat.users,
    name: chat.chatName,
    time: msgTime,
    unread: 0,
    isGroup: chat.isGroupChat,
    groupAdmin: chat.groupAdmin?._id,
    latestMessage: chat.latestMessage || null,
  };
};

export const transformDirectChat = (chat) => {
  const user_id = localStorage.getItem("user_id");
  const otherUser = chat.users.find((u) => u._id.toString() !== user_id);
  const msgTime = chat.latestMessage?.createdAt || "";

  return {
    id: chat._id,
    user_id: otherUser?._id,
    name: otherUser?.fullName || "Unknown",
    img: otherUser?.avatar,
    online: otherUser?.status === "online",
    time: msgTime,
    unread: 0,
    isGroup: false,
    email: otherUser?.email,
    latestMessage: chat.latestMessage || null,
  };
};
