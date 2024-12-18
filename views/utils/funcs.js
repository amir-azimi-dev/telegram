let user = null;
let socket = null;
let namespaceSocket = null;
let activeRoomTitle = null;

export const authorizeUser = userInfo => {
  user = userInfo;
}

export const showNamespaces = (namespaces, socketIO) => {
  socket = socketIO;

  const chatCategories = document.querySelector(".sidebar__categories-list");
  chatCategories.innerHTML = "";

  namespaces.forEach((namespace, index) => {
    chatCategories.insertAdjacentHTML(
      "beforeend",
      `
              <li data-title="${namespace.title
      }" class="sidebar__categories-item ${index === 0 && "sidebar__categories-item--active"
      }" data-category-name="all">
                <span class="sidebar__categories-text">${namespace.title}</span>
                <!-- <span class="sidebar__categories-counter sidebar__counter">3</span> -->
            </li>
          `
    );
  });
};

export const showActiveNamespace = (namespaces) => {
  getNamespaceChats(namespaces[0].href);

  let sidebarCategoriesItem = document.querySelectorAll(
    ".sidebar__categories-item"
  );
  sidebarCategoriesItem.forEach((item) => {
    item.addEventListener("click", function (e) {
      const namespaceTitle = item.dataset.title;
      const mainNamespace = namespaces.find(
        (namespace) => namespace.title === namespaceTitle
      );
      getNamespaceChats(mainNamespace.href);

      let activeSidebarCategoriesItem = document.querySelector(
        ".sidebar__categories-item.sidebar__categories-item--active"
      );

      activeSidebarCategoriesItem.classList.remove(
        "sidebar__categories-item--active"
      );

      e.currentTarget.classList.add("sidebar__categories-item--active");

      let categoryName = e.currentTarget.dataset.categoryName;
      let selectedCategory = document.querySelector(
        `.data-category-${categoryName}`
      );
      let selectedCategoryActive = document.querySelector(
        `.sidebar__contact.sidebar__contact--active`
      );
      selectedCategoryActive.classList.remove("sidebar__contact--active");
      selectedCategory.classList.add("sidebar__contact--active");

      const chatHeader = document.querySelector(".chat__header");
      chatHeader.classList.remove("chat__header--active");

      const chatContent = document.querySelector(".chat__content");
      chatContent.classList.remove("chat__content--active");
    });
  });
};

export const getNamespaceChats = (namespaceHref) => {
  namespaceSocket && namespaceSocket.close();
  namespaceSocket = io(`http://localhost:3000${namespaceHref}`);

  namespaceSocket.on("connect", () => {
    namespaceSocket.on("namespaceRooms", (rooms) => {
      showNamespaceChats(rooms);
    });
  });
};

export const showNamespaceChats = (rooms) => {
  const chats = document.querySelector(".sidebar__contact-list");
  chats.innerHTML = "";

  rooms.forEach((room) => {
    chats.insertAdjacentHTML(
      "beforeend",
      `
          <li class="sidebar__contact-item" data-room="${room.title}">
            <a class="sidebar__contact-link" href="#">
              <div class="sidebar__contact-left">
                <div class="sidebar__contact-left-left">
                  <img class="sidebar__contact-avatar" src="http://localhost:3000/uploads/${room.image || "/rooms/default.png"}">
                </div>
                <div class="sidebar__contact-left-right">
                  <span class="sidebar__contact-title">${room.title}</span>
                  <div class="sidebar__contact-sender">
                    <span class="sidebar__contact-sender-name">Qadir Yolme :
                    </span>
                    <span class="sidebar__contact-sender-text">سلام داداش خوبی؟</span>
                  </div>
                </div>
              </div>
              <div class="sidebar__contact-right">
                <span class="sidebar__contact-clock">15.53</span>
                <span class="sidebar__contact-counter sidebar__counter sidebar__counter-active">66</span>
              </div>
            </a>
          </li>
      `
    );
  });

  setClickOnChats();
};

const setClickOnChats = () => {
  const chats = document.querySelectorAll(".sidebar__contact-item");

  chats.forEach((chat) => {
    chat.addEventListener("click", () => {
      const roomName = chat.dataset.room;
      activeRoomTitle = roomName;
      namespaceSocket.emit("join", roomName);

      namespaceSocket.on("room-info", roomInfo => {
        const chatHeader = document.querySelector(".chat__header");
        chatHeader.classList.add("chat__header--active");

        const chatContent = document.querySelector(".chat__content");
        chatContent.classList.add("chat__content--active");

        const chatName = document.querySelector(".chat__header-name");
        chatName.innerHTML = roomInfo.title;

        const chatAvatar = document.querySelector(".chat__header-avatar");
        chatAvatar.src = `http://localhost:3000/uploads/${roomInfo.image || "rooms/default.png"}`;

        const chatsContainer = document.querySelector(".chat__content-main");
        chatsContainer.innerHTML = "";

        roomInfo.messages?.forEach(message => {
          let messageTemplate = null;
          if (message.sender === user._id) {
            messageTemplate = `
                <div class="chat__content-receiver-wrapper chat__content-wrapper">
                  <div class="chat__content-receiver">
                    <span class="chat__content-receiver-text">${message.message}</span>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
            `
          } else {
            messageTemplate = `
                <div class="chat__content-sender-wrapper chat__content-wrapper">
                  <div class="chat__content-sender">
                    <span class="chat__content-receiver-text">${message.message}</span>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
            `
          }
          chatsContainer.insertAdjacentHTML("beforeend", messageTemplate)
        });
      });

      getAndShowRoomOnlineUsers();
    });
  });
};

const getAndShowRoomOnlineUsers = () => {
  namespaceSocket.on("online-user-count", count => {
    const chatOnlineUsersCount = document.querySelector(".chat__header-status");
    chatOnlineUsersCount.innerHTML = `${count} Users are online`;
  });
};

export const sendMessageHandler = () => {
  const msgInput = document.querySelector(".chat__content-bottom-bar-input");

  msgInput.addEventListener("keyup", event => {
    if (event.key === "Enter") {
      const message = event.target.value.trim();
      if (!message) {
        return;
      }

      namespaceSocket.emit("send-message", { message, roomTitle: activeRoomTitle, senderId: user._id });
      event.target.value = "";
    }
  });
};

export const getMessage = () => {
  namespaceSocket.on("room-message", message => {
    const chatsContainer = document.querySelector(".chat__content-main");
    const chatsContent = document.querySelector(".chat__content--active");

    let messageTemplate = null;
    if (message.sender === user._id) {
      messageTemplate = `
                <div class="chat__content-receiver-wrapper chat__content-wrapper">
                  <div class="chat__content-receiver">
                    <span class="chat__content-receiver-text">${message.message}</span>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
            `
    } else {
      messageTemplate = `
                <div class="chat__content-sender-wrapper chat__content-wrapper">
                  <div class="chat__content-sender">
                    <span class="chat__content-receiver-text">${message.message}</span>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
            `
    }
    chatsContainer.insertAdjacentHTML("beforeend", messageTemplate);
    chatsContent.scrollTo(0, chatsContent.scrollHeight);
  });
}

export const detectIsTyping = () => {
  const chatInput = document.querySelector(".chat__content-bottom-bar-input");
  const chatStatusElement = document.querySelector(".chat__header-status");

  chatInput.addEventListener("keydown", event => {
    if (!event.currentTarget.value) {
      return;
    }

    namespaceSocket.emit("typing", { roomTitle: activeRoomTitle, user, isTyping: true });

    setTimeout(() => {
      namespaceSocket.emit("typing", { roomTitle: activeRoomTitle, user, isTyping: false });

    }, 2000);
  });

  namespaceSocket.on("typing-status", data => {
    if (data.user._id === user._id || !data.isTyping) {
      return;
    }

    chatStatusElement.innerHTML = `${data.user.name} is typing ...`;
  })
}

export const sendLocation = () => {
  const sendLocationElem = document.querySelector(".location-icon");
  sendLocationElem.addEventListener("click", () => {
    namespaceSocket.emit("send-location", {
      location: { longitude: 35.538931360333486, latitude: 50.811767578125 },
      roomTitle: activeRoomTitle,
      senderId: user._id,
    });
  });
};

export const getLocation = () => {
  namespaceSocket.on("room-location", (data) => {
    alert("Hasn't been handled yet.");
  });
};

export const initMap = (id, x, y) => {
  let map = L.map(id).setView([x, y], 13);

  let icon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjciIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNyA0OCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InBpbi1hIiB4MT0iNTAlIiB4Mj0iNTAlIiB5MT0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0E2MjYyNiIgc3RvcC1vcGFjaXR5PSIuMzIiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQTYyNjI2Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPHBhdGggaWQ9InBpbi1jIiBkPSJNMTguNzk0MzMzMywxNC40NjA0IEMxOC43OTQzMzMzLDE3LjQwNTQ1OTkgMTYuNDA3NDQ5NiwxOS43OTM3MzMzIDEzLjQ2MDEwNDcsMTkuNzkzNzMzMyBDMTAuNTE0NTUwNCwxOS43OTM3MzMzIDguMTI3NjY2NjcsMTcuNDA1NDU5OSA4LjEyNzY2NjY3LDE0LjQ2MDQgQzguMTI3NjY2NjcsMTEuNTE1MzQwMSAxMC41MTQ1NTA0LDkuMTI3MDY2NjcgMTMuNDYwMTA0Nyw5LjEyNzA2NjY3IEMxNi40MDc0NDk2LDkuMTI3MDY2NjcgMTguNzk0MzMzMywxMS41MTUzNDAxIDE4Ljc5NDMzMzMsMTQuNDYwNCIvPgogICAgPGZpbHRlciBpZD0icGluLWIiIHdpZHRoPSIyMzEuMiUiIGhlaWdodD0iMjMxLjIlIiB4PSItNjUuNiUiIHk9Ii00Ni45JSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij4KICAgICAgPGZlT2Zmc2V0IGR5PSIyIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIi8+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd0JsdXJPdXRlcjEiIHN0ZERldmlhdGlvbj0iMiIvPgogICAgICA8ZmVDb2xvck1hdHJpeCBpbj0ic2hhZG93Qmx1ck91dGVyMSIgdmFsdWVzPSIwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuMjQgMCIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICA8cGF0aCBmaWxsPSJ1cmwoI3Bpbi1hKSIgZD0iTTEzLjA3MzcsMS4wMDUxIEM1LjgwMzIsMS4yMTUxIC0wLjEzOTgsNy40Njg2IDAuMDAyNywxNC43MzkxIEMwLjEwOTIsMjAuMTkwMSAzLjQ1NTcsMjQuODQ2MSA4LjE5NTcsMjYuODYzNiBDMTAuNDUzMiwyNy44MjUxIDExLjk3MTIsMjkuOTc0NiAxMS45NzEyLDMyLjQyODYgTDExLjk3MTIsMzkuNDExNTUxNCBDMTEuOTcxMiw0MC4yMzk1NTE0IDEyLjY0MTcsNDAuOTExNTUxNCAxMy40NzEyLDQwLjkxMTU1MTQgQzE0LjI5OTIsNDAuOTExNTUxNCAxNC45NzEyLDQwLjIzOTU1MTQgMTQuOTcxMiwzOS40MTE1NTE0IEwxNC45NzEyLDMyLjQyNTYgQzE0Ljk3MTIsMzAuMDEyMSAxNi40MTcyLDI3LjgzNDEgMTguNjQ0NywyNi45MDU2IEMyMy41MTY3LDI0Ljg3NzYgMjYuOTQxMiwyMC4wNzYxIDI2Ljk0MTIsMTQuNDcwNiBDMjYuOTQxMiw2Ljg5ODYgMjAuNjkzNywwLjc4NjEgMTMuMDczNywxLjAwNTEgWiIvPgogICAgPHBhdGggZmlsbD0iI0E2MjYyNiIgZmlsbC1ydWxlPSJub256ZXJvIiBkPSJNMTMuNDcwNiw0Ny44MTIgQzEyLjU1NTYsNDcuODEyIDExLjgxNDYsNDcuMDcxIDExLjgxNDYsNDYuMTU2IEMxMS44MTQ2LDQ1LjI0MSAxMi41NTU2LDQ0LjUgMTMuNDcwNiw0NC41IEMxNC4zODU2LDQ0LjUgMTUuMTI2Niw0NS4yNDEgMTUuMTI2Niw0Ni4xNTYgQzE1LjEyNjYsNDcuMDcxIDE0LjM4NTYsNDcuODEyIDEzLjQ3MDYsNDcuODEyIFoiLz4KICAgIDx1c2UgZmlsbD0iIzAwMCIgZmlsdGVyPSJ1cmwoI3Bpbi1iKSIgeGxpbms6aHJlZj0iI3Bpbi1jIi8+CiAgICA8dXNlIGZpbGw9IiNGRkYiIHhsaW5rOmhyZWY9IiNwaW4tYyIvPgogIDwvZz4KPC9zdmc+Cg==",
    iconSize: [45, 45],
  });

  L.marker([x, y], { icon: icon }).addTo(map);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">33</a>',
  }).addTo(map);
};

export const sendFile = () => {
  const fileIcon = document.querySelector("#file-input");

  fileIcon.addEventListener("change", event => {
    const fileData = event.target.files[0];
    if (!fileData) {
      return;
    }
    
    namespaceSocket.emit("send-media", {
      file: fileData,
      filename: fileData.name,
      senderId: user._id,
      roomTitle: activeRoomTitle,
    });
  });
};

export const getFile = () => {
  namespaceSocket.on("room-media", (data) => {
    console.log("New Media ->", data);
  });
};
