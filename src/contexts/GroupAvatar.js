import React from "react";
import { Avatar, Box } from "@mui/material";

const avatarSize = 42;
const miniAvatarSize = 24;

const GroupAvatar = ({ members }) => {
  const maxDisplay = 4;
  const isOverflow = members.length >= maxDisplay;
  const displayed = isOverflow ? members.slice(0, 3) : members;

  const totalAvatars = isOverflow ? 4 : displayed.length;
  const radius = 12;

  const rotationAngle = 45; // Góc xoay toàn bộ vòng tròn (độ)

  const getPosition = (angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const top =
      avatarSize / 2 - miniAvatarSize / 2 + radius * Math.sin(angleRad);
    const left =
      avatarSize / 2 - miniAvatarSize / 2 + radius * Math.cos(angleRad);
    return { top, left };
  };

  return (
    <Box
      sx={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: "50%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isOverflow &&
        (() => {
          const plusIndex = totalAvatars; // vị trí thứ 4
          const plusAngle =
            ((360 / totalAvatars) * plusIndex + rotationAngle) % 360;
          const { top, left } = getPosition(plusAngle);
          const remaining = members.length - 3;

          return (
            <Avatar
              key="more"
              sx={{
                width: miniAvatarSize,
                height: miniAvatarSize,
                position: "absolute",
                top,
                left,
                bgcolor: "#ccc",
                fontSize: "0.7rem",
                color: "#000",
                border: "1.5px solid white",
                zIndex: 99,
              }}
            >
              +{remaining}
            </Avatar>
          );
        })()}

      {displayed.map((member, index) => {
        // Tính góc cho mỗi avatar, cộng thêm rotationAngle để xoay cả cụm
        const baseAngle = (360 / totalAvatars) * (index + 1);
        const angle = (baseAngle + rotationAngle) % 360;
        const { top, left } = getPosition(angle);

        return (
          <Avatar
            key={index}
            src={member.avatar}
            alt={member.fullName}
            sx={{
              width: miniAvatarSize,
              height: miniAvatarSize,
              position: "absolute",
              top,
              left,
              border: "1.5px solid white",
              zIndex: index,
            }}
          />
        );
      })}
    </Box>
  );
};

export default GroupAvatar;
