import {
  authorizeUser,
  defineSocket,
  showNamespaces,
  sendMessageHandler,
  showMessageHandler
} from "../../utils/funcs.js";


window.addEventListener("load", async () => {
  const userInfo = await authenticate();
  if (!userInfo) {
    return location.replace("./auth.html");
  }

  authorizeUser(userInfo);

  const socket = io("http://localhost:3000");

  handleSocketIo(socket);
});

const handleSocketIo = socket => {
  defineSocket(socket);
  socket.on("connect", () => console.log("socket connected successfully ... "));
  socket.on("namespaces", namespaceData => {
    showNamespaces(namespaceData);
    sendMessageHandler();
    showMessageHandler();
  });
}

const authenticate = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  const response = await fetch("http://localhost:3000/api/v1/auth", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return false;
  }

  const userInfo = await response.json();
  return userInfo.payload;
};