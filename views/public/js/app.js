import {
  authorizeUser,
  showActiveNamespace,
  showNamespaces,
  sendMessageHandler,
  getMessage
} from "../../utils/funcs.js";

window.addEventListener("load", async () => {
  const userInfo = await getUserInfo();
  if (!userInfo) {
    return location.replace("./auth.html");
  }

  authorizeUser(userInfo);

  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
    socket.on("namespaces", namespaces => {
      showNamespaces(namespaces, socket);
      showActiveNamespace(namespaces);
      sendMessageHandler();
      getMessage();
    });

  });
});

const getUserInfo = async () => {
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

  const data = await response.json();
  return data.payload;
};