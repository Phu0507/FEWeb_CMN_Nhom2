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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchFriendRequests,
  FetchFriends,
  FetchUsers,
  FetchSendRequests,
  SetRoomUrl,
} from "../../redux/slices/app";
import {
  FriendElement,
  FriendRequestElement,
  UserElement,
} from "../../components/UserElement";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const UsersList = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isWaitingDebounce, setIsWaitingDebounce] = useState(false);

  useEffect(() => {
    dispatch(FetchSendRequests());
  }, [dispatch]);

  useEffect(() => {
    if (search.trim()) {
      setIsWaitingDebounce(true);
    } else {
      setIsWaitingDebounce(false);
    }

    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setIsWaitingDebounce(false);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    if (!debouncedSearch.trim()) return;
    dispatch(FetchUsers(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  const recentUsers = React.useMemo(() => {
    if (!users || users.length === 0) return [];
    return users.slice(0, 5);
  }, [users]);
  return (
    <Stack spacing={2}>
      <TextField
        label="Tìm kiếm người dùng"
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Hiển thị spinner khi đang chờ debounce hoặc đang load dữ liệu */}
      {(isWaitingDebounce || isLoading) && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100px",
          }}
        >
          <CircularProgress />
        </div>
      )}

      {!isWaitingDebounce && !isLoading && (
        <>
          {search.trim() ? (
            users.length > 0 ? (
              users.map((el, idx) => <UserElement key={el.id || idx} {...el} />)
            ) : (
              <p>Không có người dùng</p>
            )
          ) : recentUsers.length > 0 ? (
            <Stack spacing={1}>
              <p>Kết quả tìm kiếm gần đây:</p>
              {recentUsers.map((user, idx) => (
                <UserElement key={user.id || idx} {...user} />
              ))}
            </Stack>
          ) : (
            <p>Không có kết quả tìm kiếm gần đây</p>
          )}
        </>
      )}
    </Stack>
  );
};

const FriendsList = () => {
  const dispatch = useDispatch();

  const { friends } = useSelector((state) => state.app);
  const { user, roomUrl } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(FetchFriends());
  }, [dispatch]);
  if (roomUrl) {
    return (
      <div>
        <h2>Đang gọi video...</h2>
        <iframe
          src={roomUrl}
          title="Daily Video Call"
          allow="camera; microphone; fullscreen; autoplay"
          style={{ width: "100%", height: "600px", border: "none" }}
        />
        <button
          onClick={() => dispatch(SetRoomUrl(null))}
          style={{ marginTop: 10 }}
        >
          Kết thúc cuộc gọi
        </button>
      </div>
    );
  }
  return (
    <>
      {friends?.length > 0 ? (
        friends.map((el, idx) => <FriendElement key={idx} {...el} />)
      ) : (
        <div>Bạn chưa có bạn bè nào.</div>
      )}
    </>
  );
};

const RequestsList = () => {
  const dispatch = useDispatch();

  const { friendRequests } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(FetchFriendRequests());
  }, [dispatch]);

  return (
    <>
      {friendRequests.map((el, idx) => {
        return <FriendRequestElement key={idx} {...el} />;
      })}
    </>
  );
};

const Friends = ({ open, handleClose }) => {
  const [value, setValue] = React.useState(0);
  const { friendRequests, friends } = useSelector((state) => state.app);
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
          <Tab label="Explore" />
          <Tab label={`Friends (${friends.length || 0})`} />
          <Tab
            label={
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  overflow: "visible",
                }}
              >
                Requests
                <Badge
                  badgeContent={friendRequests.length}
                  color="error"
                  sx={{
                    position: "absolute",
                    top: -5,
                    right: 30,
                    "& .MuiBadge-badge": {
                      fontSize: 10,
                      height: 16,
                      minWidth: 16,
                    },
                  }}
                />
              </Box>
            }
          />
        </Tabs>
      </Stack>
      <DialogContent>
        <Stack sx={{ height: "100%" }}>
          <Stack spacing={2.4}>
            {(() => {
              switch (value) {
                case 0: // display all users in this list
                  return <UsersList />;

                case 1: // display friends in this list
                  return <FriendsList />;

                case 2: // display request in this list
                  return <RequestsList />;

                default:
                  break;
              }
            })()}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default Friends;
