import React, { useState } from "react";
import { Avatar, Box, Fade, Menu, MenuItem, Stack } from "@mui/material";
import { Profile_Menu } from "../../data";
import { useDispatch, useSelector } from "react-redux";
import { LogoutUser } from "../../redux/slices/auth";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
import ChangePassword from "../../sections/dashboard/ChangePassword";

const ProfileMenu = () => {
  const { user } = useSelector((state) => state.app);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const user_id = window.localStorage.getItem("user_id");

  const user_name = user?.fullName;
  const user_img = user?.avatar;

  const [openDialog, setOpenDialog] = useState(false);
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Avatar
        id="profile-positioned-button"
        aria-controls={openMenu ? "profile-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={openMenu ? "true" : undefined}
        alt={user_name}
        src={user_img}
        onClick={handleClick}
        sx={{ cursor: "pointer" }}
      />
      <Menu
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        TransitionComponent={Fade}
        id="profile-positioned-menu"
        aria-labelledby="profile-positioned-button"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box p={1}>
          <Stack spacing={1}>
            {Profile_Menu.map((el, idx) => (
              <MenuItem onClick={handleClose}>
                <Stack
                  onClick={() => {
                    if (idx === 0) {
                      navigate("/profile");
                    } else if (idx === 1) {
                      handleOpenDialog();
                    } else if (idx === 2) {
                      navigate("/settings");
                    } else {
                      dispatch(LogoutUser());
                      socket.emit("end", { user_id });
                    }
                  }}
                  sx={{ width: 150 }}
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                >
                  <span>{el.title}</span>
                  {el.icon}
                </Stack>{" "}
              </MenuItem>
            ))}
          </Stack>
        </Box>
      </Menu>
      {openDialog && (
        <ChangePassword open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default ProfileMenu;
