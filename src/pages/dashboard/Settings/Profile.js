import React, { useEffect, useState } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { CaretLeft } from "phosphor-react";
import ProfileForm from "../../../sections/dashboard/Settings/ProfileForm";
import UpdateProfileForm from "../../../sections/dashboard/Settings/UpdateProfileForm";
import { useDispatch } from "react-redux";
import { FetchUserProfile } from "../../../redux/slices/app";

const Profile = () => {
  const dispatch = useDispatch();
  const [showRightPane, setShowRightPane] = useState(false);

  useEffect(() => {
    dispatch(FetchUserProfile());
  }, []);

  return (
    <>
      <Stack direction="row" sx={{ width: "100%" }}>
        {/* Left Pane */}
        <Box
          sx={{
            overflowY: "scroll",

            height: "100vh",
            width: 320,
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background,

            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack p={3} spacing={3}>
            {/* Header */}
            <Stack direction="row" alignItems={"center"} spacing={1}>
              <IconButton>
                <CaretLeft size={24} color={"#4B4B4B"} />
              </IconButton>

              <Typography variant="h5">Profile</Typography>
            </Stack>

            {/* Profile Edit Form */}
            <ProfileForm
              showRightPane={showRightPane}
              setShowRightPane={setShowRightPane}
            />
          </Stack>
        </Box>

        {/* Right Pane */}
        <Box
          sx={{
            height: "100%",
            width: "calc(100vw - 420px )",
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? "#FFF"
                : theme.palette.background.paper,
            borderBottom: "0px solid #0162C4",
          }}
        >
          {showRightPane && (
            <Stack p={3} spacing={10} alignItems={"center"}>
              {/* Header */}
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Typography variant="h5">Update Profile</Typography>
              </Stack>

              {/* Profile Edit Form */}
              <UpdateProfileForm setShowRightPane={setShowRightPane} />
            </Stack>
          )}
        </Box>
      </Stack>
    </>
  );
};

export default Profile;
