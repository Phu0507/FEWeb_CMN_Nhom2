import io from "socket.io-client"; // Add this

// let socket;

const connectSocket = (user_id) => {
  // socket = io("http://localhost:5000/", {
  //   query: `user_id=${user_id}`,
  //   transports: ["websocket"],
  // });
}; // Add this -- our server will run on port 4000, so we connect to it from here

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

export { socket, connectSocket };
