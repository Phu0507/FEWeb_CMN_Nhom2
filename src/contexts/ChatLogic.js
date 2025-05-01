export const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id
    ? users[1].fullName
    : users[0].fullName;
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 45;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

export const shouldShowTimestamp = (messages, m, i) => {
  const currentTime = new Date(m.createdAt);
  const nextMsg = messages[i + 1];

  // Nếu là tin nhắn cuối cùng thì luôn hiển thị
  if (i === messages.length - 1 || !nextMsg) return true;

  const nextTime = new Date(nextMsg.createdAt);

  const sameMinute =
    currentTime.getHours() === nextTime.getHours() &&
    currentTime.getMinutes() === nextTime.getMinutes();

  const sameSender = nextMsg.sender._id === m.sender._id;

  // Nếu cùng phút và cùng người gửi -> không hiển thị (ẩn)
  // Các trường hợp còn lại (khác phút hoặc khác người) -> hiển thị
  return !(sameMinute && sameSender);
};

export const getDateLabel = (messageDate) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const msgDate = new Date(messageDate);

  const isToday =
    msgDate.getDate() === today.getDate() &&
    msgDate.getMonth() === today.getMonth() &&
    msgDate.getFullYear() === today.getFullYear();

  const isYesterday =
    msgDate.getDate() === yesterday.getDate() &&
    msgDate.getMonth() === yesterday.getMonth() &&
    msgDate.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Hôm nay";
  if (isYesterday) return "Hôm qua";

  return msgDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
