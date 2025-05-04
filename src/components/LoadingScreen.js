import React from "react";
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useResponsive from "../hooks/useResponsive";

const LoadingScreen = () => {
  const theme = useTheme();
  const isDesktop = useResponsive("up", "md");
  const isMobile = useResponsive("between", "md", "xs", "sm");

  return (
    <Stack direction="row" sx={{ width: "100%", height: "100vh" }}>
      {/* Left Sidebar giả lập Chats */}
      <Box
        sx={{
          width: isDesktop ? 320 : "100vw",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#fff"
              : theme.palette.background.default,
          borderRight: "1px solid rgba(145, 158, 171, 0.24)",
          px: 2,
          py: 8,
        }}
      >
        <Skeleton
          variant="rectangular"
          width="100%"
          height={50}
          sx={{ borderRadius: 4 }}
        />
        <Stack spacing={2} pt={8}>
          {[...Array(5)].map((_, i) => (
            <Stack direction="row" spacing={2} alignItems="center" key={i}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width="80%" height={80} />
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Nội dung chính */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#fff"
              : theme.palette.background.default,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        width={isMobile ? "100vw" : "auto"}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography variant="subtitle1">Loading...</Typography>
        </Stack>
      </Box>

      {/* SideBar giả lập (nếu có) */}
      {/* <Box
        sx={{
          width: "320px", // hoặc tuỳ theo bạn cấu hình sidebar
          backgroundColor:
            theme.palette.mode === "light"
              ? "#fff"
              : theme.palette.background.default,
          borderLeft: "1px solid rgba(145, 158, 171, 0.24)",
        }}
      /> */}
    </Stack>
  );
};

export default LoadingScreen;
