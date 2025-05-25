import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
// slices
import appReducer from "./slices/app";
import audioCallReducer from "./slices/audioCall";
import videoCallReducer from "./slices/videoCall";
import authReducer from "./slices/auth";
import conversationReducer from "./slices/conversation";

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: "root",
  storage,
  keyPrefix: "redux-",
  //   whitelist: [],
  //   blacklist: [],
};

const mainReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  conversation: conversationReducer,
  audioCall: audioCallReducer,
  videoCall: videoCallReducer,
});

//Reset toàn bộ Redux state khi logout
const rootReducer = (state, action) => {
  if (action.type === "auth/signOut") {
    storage.removeItem("persist:root"); // Xóa localStorage (nếu dùng redux-persist)
    state = undefined;
  }
  return mainReducer(state, action);
};

export { rootPersistConfig, rootReducer };
