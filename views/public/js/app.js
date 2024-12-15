import { showActiveNamespace, showNamespaces } from "../../utils/funcs.js";

window.addEventListener("load", () => {
  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
    socket.on("namespaces", namespaces => {
      showNamespaces(namespaces, socket);
      showActiveNamespace(namespaces);
    });
  });
});
