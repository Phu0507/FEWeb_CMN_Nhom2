import { createSlice } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
// ----------------------------------------------------------------------

const initialState = {
  user: {},
  sideBar: {
    open: false,
    type: "CONTACT", // can be CONTACT, STARRED, SHARED
  },
  isLoggedIn: true,
  tab: 0, // [0, 1, 2, 3]
  snackbar: {
    open: null,
    severity: null,
    message: null,
  },
  users: [], // all users of app who are not friends and not requested yet
  all_users: [],
  friends: [], // all friends
  friendRequests: [], // all friend requests
  sendRequests: [],
  chat_type: null,
  room_id: null,
  call_logs: [],
  isLoading: false,
  keyWord: "",
  recentSearches: [], // Thêm dòng này
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchCallLogs(state, action) {
      state.call_logs = action.payload.call_logs;
    },
    fetchUser(state, action) {
      state.user = action.payload.user;
    },
    updateUser(state, action) {
      state.user = action.payload.user;
    },
    // Toggle Sidebar
    toggleSideBar(state) {
      state.sideBar.open = !state.sideBar.open;
    },
    updateSideBarType(state, action) {
      state.sideBar.type = action.payload.type;
    },
    updateTab(state, action) {
      state.tab = action.payload.tab;
    },

    openSnackBar(state, action) {
      console.log(action.payload);
      state.snackbar.open = true;
      state.snackbar.severity = action.payload.severity;
      state.snackbar.message = action.payload.message;
    },
    closeSnackBar(state) {
      console.log("This is getting executed");
      state.snackbar.open = false;
      state.snackbar.message = null;
    },
    updateUsers(state, action) {
      state.users = action.payload.users;
    },
    updateAllUsers(state, action) {
      state.all_users = action.payload.users;
    },
    updateFriends(state, action) {
      state.friends = action.payload.friends;
    },
    updateFriendRequests(state, action) {
      state.friendRequests = action.payload.requests;
    },
    removeFriendRequest: (state, action) => {
      const { senderId } = action.payload;
      state.friendRequests = state.friendRequests.filter(
        (req) => req._id !== senderId
      );
    },
    updateSendRequests(state, action) {
      state.sendRequests = action.payload.requests;
    },
    addSendRequest(state, action) {
      state.sendRequests.push(action.payload.receiver);
    },
    removeSendRequest(state, action) {
      state.sendRequests = state.sendRequests.filter(
        (request) => request._id !== action.payload
      );
    },
    selectConversation(state, action) {
      state.chat_type = "individual";
      state.room_id = action.payload.room_id;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload.isLoading;
    },
    addRecentSearch: (state, action) => {
      const { keyWord, userss } = action.payload;
      console.log("userss", userss);
      console.log("keyWord", keyWord);
      console.log("state at addRecentSearch:", state);
      // Tránh trùng từ khóa
      state.recentSearches = state.recentSearches.filter(
        (item) => item.keyWord !== keyWord
      );

      // Giới hạn 5 từ khóa gần nhất
      state.recentSearches.unshift({ keyWord, userss });
      if (state.recentSearches.length > 5) {
        state.recentSearches.pop();
      }
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const closeSnackBar = () => async (dispatch, getState) => {
  dispatch(slice.actions.closeSnackBar());
};

export const showSnackbar =
  ({ severity, message }) =>
  async (dispatch, getState) => {
    dispatch(
      slice.actions.openSnackBar({
        message,
        severity,
      })
    );

    setTimeout(() => {
      dispatch(slice.actions.closeSnackBar());
    }, 4000);
  };

export function ToggleSidebar() {
  return async (dispatch, getState) => {
    dispatch(slice.actions.toggleSideBar());
  };
}
export function UpdateSidebarType(type) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateSideBarType({ type }));
  };
}
export function UpdateTab(tab) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateTab(tab));
  };
}

export function AddSendRequest(receiver) {
  return (dispatch) => {
    dispatch(slice.actions.addSendRequest({ receiver }));
  };
}

export function RemoveSendRequest(receiverId) {
  return (dispatch) => {
    dispatch(slice.actions.removeSendRequest(receiverId));
  };
}

export function RemoveFriendRequest(senderId) {
  return (dispatch) => {
    dispatch(slice.actions.removeFriendRequest(senderId));
  };
}

export function FetchUsers(keyWord) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.setLoading({ isLoading: true }));
    await axios
      .get(
        `/users?search=${keyWord}`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getState().auth.token}`,
          },
        }
      )
      .then((response) => {
        console.log("users", response.data);
        dispatch(slice.actions.updateUsers({ users: response.data }));
        // dispatch(
        //   slice.actions.addRecentSearch({
        //     keyWord: keyWord,
        //     userss: response.data,
        //   })
        // );
        dispatch(slice.actions.setLoading({ isLoading: false }));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.setLoading({ isLoading: false }));
      });
  };
}
export function FetchAllUsers() {
  return async (dispatch, getState) => {
    await axios
      .get(
        "/user/get-all-verified-users",

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getState().auth.token}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        dispatch(slice.actions.updateAllUsers({ users: response.data.data }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
}
export function FetchFriends() {
  return async (dispatch, getState) => {
    dispatch(slice.actions.setLoading({ isLoading: true }));
    await axios
      .get(
        "/users/listFriends",

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getState().auth.token}`,
          },
        }
      )
      .then((response) => {
        console.log("friends", response.data);
        dispatch(slice.actions.updateFriends({ friends: response.data }));
        dispatch(slice.actions.setLoading({ isLoading: false }));
      })
      .catch((err) => {
        console.log(err);
        dispatch(slice.actions.setLoading({ isLoading: false }));
      });
  };
}

export function AcceptRequest(senderId, receiverId) {
  return async (dispatch, getState) => {
    await axios
      .post(
        "/api/friendRequests/acceptFriend",
        { senderId, receiverId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getState().auth.token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data, "dữ liệu");
        dispatch(slice.actions.removeFriendRequest({ senderId }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
}
export function FetchFriendRequests() {
  return async (dispatch, getState) => {
    await axios
      .get(
        "/api/friendRequests/pending",

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getState().auth.token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        dispatch(
          slice.actions.updateFriendRequests({ requests: response.data })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

export function FetchSendRequests() {
  return async (dispatch, getState) => {
    await axios
      .get(
        "/api/friendRequests/sent",

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getState().auth.token}`,
          },
        }
      )
      .then((response) => {
        console.log("data có", response.data);
        const receivers = response.data.map((request) => request.receiver);
        dispatch(slice.actions.updateSendRequests({ requests: receivers }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

export const SelectConversation = ({ room_id }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.selectConversation({ room_id }));
  };
};

export const FetchCallLogs = () => {
  return async (dispatch, getState) => {
    axios
      .get("/user/get-call-logs", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getState().auth.token}`,
        },
      })
      .then((response) => {
        console.log(response);
        dispatch(
          slice.actions.fetchCallLogs({ call_logs: response.data.data })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
};
export const FetchUserProfile = () => {
  return async (dispatch, getState) => {
    axios
      .get("/users/get-me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getState().auth.token}`,
        },
      })
      .then((response) => {
        console.log(response);
        dispatch(slice.actions.fetchUser({ user: response.data.data }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
};

export const ChangePasswordAPI = (newPassword, oldPassword) => {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.token;

      const response = await axios.put(
        "/users/update-password",
        { oldPassword, newPassword },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(
        showSnackbar({
          severity: "success",
          message: "Đổi mật khẩu thành công",
        })
      );
      return true;
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message:
            error.response?.data?.message || "Mật khẩu cũ không chính xác",
        })
      );
      return false;
    }
  };
};

export const UpdateUserProfile = (formValues) => {
  return async (dispatch, getState) => {
    try {
      const data = new FormData();

      // Nếu có avatar là file thì append
      if (formValues.avatar) {
        data.append("avatar", formValues.avatar);
      }

      // Append các trường khác (ngoại trừ avatar)
      Object.entries(formValues).forEach(([key, value]) => {
        if (key !== "avatar" && value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      const response = await axios.put("users/updateprofile", data, {
        headers: {
          Authorization: `Bearer ${getState().auth.token}`,
          // Không cần set Content-Type vì axios tự set cho FormData
        },
      });

      console.log("user có data", response.data);
      dispatch(slice.actions.updateUser({ user: response.data }));
    } catch (err) {
      console.log(err);
    }
  };
};
