import { createSlice } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import { showSnackbar } from "./app";

// ----------------------------------------------------------------------

const initialState = {
  isLoggedIn: false,
  token: "",
  isLoading: false,
  user: null,
  user_id: null,
  email: "",
  otpType: "",
  otpValue: "",
  error: false,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
    logIn(state, action) {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
      state.user_id = action.payload.user_id;
    },
    signOut(state, action) {
      state.isLoggedIn = false;
      state.token = "";
      state.user_id = null;
    },
    updateRegisterEmail(state, action) {
      state.email = action.payload.email;
      state.otpType = action.payload.otpType;
      state.otpValue = action.payload.otpValue;
    },
  },
});

// Reducer
export default slice.reducer;

export function NewPassword(formValues, navigate) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    await axios
      .post(
        "users/reset-password-forgot",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        dispatch(
          slice.actions.updateRegisterEmail({
            email: "",
            otpType: "",
            otpValue: "",
          })
        );
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.error || "OTP đã hết hạn",
          })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
      })
      .finally(() => {
        if (!getState().auth.error) {
          navigate("/auth/login");
        }
      });
  };
}

export function ForgotPassword(formValues, navigate) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    await axios
      .post(
        "/users/send-otp",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        dispatch(
          slice.actions.updateRegisterEmail({
            email: formValues.email,
            otpType: "forgot",
          })
        );
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.error || "Email này không tồn tại",
          })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
      })
      .finally(() => {
        if (!getState().auth.error) {
          navigate("/auth/verify");
        }
      });
  };
}

export function VerifyEmailForgotPassword(formValues, navigate) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    await axios
      .post(
        "/users/verify-otp",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        dispatch(
          slice.actions.updateRegisterEmail({
            email: formValues.email,
            otpType: "forgot",
            otpValue: formValues.otp,
          })
        );
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.error || "OTP không hợp lệ",
          })
        );
        dispatch(
          slice.actions.updateIsLoading({ error: true, isLoading: false })
        );
      })
      .finally(() => {
        if (!getState().auth.error) {
          navigate("/auth/new-password");
        }
      });
  };
}

export function LoginWithOTP(formValues, navigate) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    await axios
      .post(
        "/users/signin-otp",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        dispatch(
          slice.actions.updateRegisterEmail({
            email: formValues.email,
            otpType: "login",
          })
        );
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.error || "Email này không tồn tại",
          })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
      })
      .finally(() => {
        if (!getState().auth.error) {
          navigate("/auth/verify");
        }
      });
  };
}

export function VerifyEmailLoginWithOTP(formValues) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    await axios
      .post(
        "/users/verify-login-otp",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        dispatch(slice.actions.updateRegisterEmail({ email: "", otpType: "" }));
        window.localStorage.setItem("user_id", response.data.user._id);
        dispatch(
          slice.actions.logIn({
            isLoggedIn: true,
            token: response.data.user.token,
            user_id: response.data.user._id,
          })
        );

        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(showSnackbar({ severity: "error", message: error.error }));
        dispatch(
          slice.actions.updateIsLoading({ error: true, isLoading: false })
        );
      });
  };
}

// export function LoginUser(formValues) {
//   return async (dispatch, getState) => {
//     dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

//     try {
//       const response = await axios.post(
//         "/users/signin",
//         { ...formValues },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       dispatch(
//         slice.actions.logIn({
//           isLoggedIn: true,
//           token: response.data.token,
//           user_id: response.data._id,
//         })
//       );

//       localStorage.setItem("user_id", response.data._id);

//       dispatch(
//         showSnackbar({
//           severity: "success",
//           message: "Đăng nhập thành công",
//         })
//       );

//       dispatch(
//         slice.actions.updateIsLoading({ isLoading: false, error: false })
//       );
//     } catch (err) {
//       console.log("hii", err.error);
//       dispatch(
//         showSnackbar({
//           severity: "error",
//           message: err.error || "Đăng nhập thất bại",
//         })
//       );

//       dispatch(
//         slice.actions.updateIsLoading({ isLoading: false, error: true })
//       );
//     }
//   };
// }
export function LoginUser(formValues) {
  return async (dispatch, getState) => {
    // Make API call here

    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    await axios
      .post(
        "/users/signin",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        dispatch(
          slice.actions.logIn({
            isLoggedIn: true,
            token: response.data.user.token,
            user_id: response.data.user._id,
          })
        );
        window.localStorage.setItem("user_id", response.data.user._id);
        dispatch(
          showSnackbar({ severity: "success", message: "Đăng nhập thành công" })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(showSnackbar({ severity: "error", message: error.error }));
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
      });
  };
}

export function LogoutUser() {
  return async (dispatch, getState) => {
    localStorage.removeItem("user_id");
    dispatch(slice.actions.signOut());
  };
}

export function RegisterUser(formValues, navigate) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    await axios
      .post(
        "/users/signup",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        dispatch(
          slice.actions.updateRegisterEmail({
            email: formValues.email,
            otpType: "register",
          })
        );

        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(showSnackbar({ severity: "error", message: error.error }));
        dispatch(
          slice.actions.updateIsLoading({ error: true, isLoading: false })
        );
      })
      .finally(() => {
        if (!getState().auth.error) {
          navigate("/auth/verify");
        }
      });
  };
}

export function VerifyEmail(formValues) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    await axios
      .post(
        "/users/verify-register-otp",
        {
          ...formValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        dispatch(slice.actions.updateRegisterEmail({ email: "", otpType: "" }));
        window.localStorage.setItem("user_id", response.data.user._id);
        dispatch(
          slice.actions.logIn({
            isLoggedIn: true,
            token: response.data.user.token,
            user_id: response.data.user._id,
          })
        );

        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(
          showSnackbar({
            severity: "error",
            message: error.error || "OTP không chính xác",
          })
        );
        dispatch(
          slice.actions.updateIsLoading({ error: true, isLoading: false })
        );
      });
  };
}
