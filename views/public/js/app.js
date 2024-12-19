import {
  defineSocket,
  showNamespaces
} from "../../utils/funcs.js";


window.addEventListener("load", () => {
  const socket = io("http://localhost:3000");

  handleSocketIo(socket);
});

const handleSocketIo = socket => {
  defineSocket(socket);
  socket.on("connect", () => console.log("socket connected successfully ... "));
  socket.on("namespaces", showNamespaces);

}