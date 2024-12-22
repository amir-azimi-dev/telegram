let user = null;
let socket = null;
let activeNamespaceSocket = null;
let activeRoomTitle = null;

const querySelector = query => document.querySelector(query);
const querySelectorAll = query => document.querySelectorAll(query);

const authorizeUser = userInfo => {
  user = userInfo;
};

const defineSocket = socketIO => {
  socket = socketIO
};

const showNamespaces = namespaces => {
  if (!namespaces?.length) {
    return alert("There aren't any namespaces yet!!!");
  }

  const namespaceContainer = querySelector(".sidebar__categories-list");
  namespaceContainer.innerHTML = "";

  const namespaceTemplateArray = namespaces.map((namespace, index) => `
        <li 
          class="sidebar__categories-item ${index === 0 ? "sidebar__categories-item--active" : ""}"
          data-category-name="${namespace.href}"
        >
            <span class="sidebar__categories-text">${namespace.title}</span>
            <!-- class="sidebar__categories-counter sidebar__counter">3</span> -->
        </li>
    `
  );

  const namespaceTemplates = namespaceTemplateArray.join("");
  namespaceContainer.insertAdjacentHTML("beforeend", namespaceTemplates);

  getNamespaceRooms(namespaces[0]?.href);
  setOnClickOnNamespaces();
};

const getNamespaceRooms = namespaceHref => {
  activeNamespaceSocket && activeNamespaceSocket.close();
  activeNamespaceSocket = io(`http://localhost:3000${namespaceHref}`);
  activeNamespaceSocket.on("connect", () => console.log("namespace socket connected ..."))
  activeNamespaceSocket.on("namespaceRooms", rooms => showActiveNamespaceRooms(rooms))
};

const showActiveNamespaceRooms = activeNamespaceRooms => {
  const roomsContainer = querySelector(".sidebar__contact.data-category-all > .sidebar__contact-list");
  roomsContainer.innerHTML = "";

  const roomTemplateArray = activeNamespaceRooms.map(room => `
      <li class="sidebar__contact-item" data-room-title="${room.title}">
        <a class="sidebar__contact-link" href="/">
          <div class="sidebar__contact-left">
            <div class="sidebar__contact-left-left">
              <img
                class="sidebar__contact-avatar"
                src=${room.image ? `http://localhost:3000/uploads/${room.image}` : "../public/images/default.png"}
              />
            </div>
            <div class="sidebar__contact-left-right">
              <span class="sidebar__contact-title">${room.title}</span>
              <div class="sidebar__contact-sender">
                <span class="sidebar__contact-sender-name"
                  >Qadir Yolme :
                </span>
                <span class="sidebar__contact-sender-text"
                  >سلام داداش خوبی؟</span
                >
              </div>
            </div>
          </div>
          <div class="sidebar__contact-right">
            <span class="sidebar__contact-clock">15.53</span>
            <span
              class="sidebar__contact-counter sidebar__counter sidebar__counter-active">66</span>
          </div>
        </a>
      </li>
    `
  );

  const roomTemplates = roomTemplateArray.join("");
  roomsContainer.insertAdjacentHTML("beforeend", roomTemplates);

  selectRoomHandler();
};

const setOnClickOnNamespaces = () => {
  const allNamespaces = querySelectorAll(".sidebar__categories-item");

  allNamespaces.forEach(namespace => {
    namespace.addEventListener("click", () => {
      getNamespaceRooms(namespace.dataset.categoryName);

      const prevActiveNamespace = querySelector(".sidebar__categories-item--active");
      prevActiveNamespace.classList.remove("sidebar__categories-item--active");

      namespace.classList.add("sidebar__categories-item--active");
    })
  });
};

const selectRoomHandler = () => {
  const allRooms = querySelectorAll(".sidebar__contact-item");

  allRooms.forEach(room => {
    room.addEventListener("click", event => {
      event.preventDefault();

      activeRoomTitle = room.dataset.roomTitle;
      activeNamespaceSocket.emit("join", activeRoomTitle);

      const prevActiveRoom = querySelector(".sidebar__contact-link--selected");
      prevActiveRoom && prevActiveRoom.classList.remove("sidebar__contact-link--selected");
      event.currentTarget.classList.add("sidebar__contact-link--selected");

      activeNamespaceSocket.off("room-info");
      activeNamespaceSocket.on("room-info", roomInfo => showActiveRoomChats(roomInfo));

      activeNamespaceSocket.on("online-user-count", count => {
        const chatStatus = querySelector(".chat__header-status");
        chatStatus.innerHTML = `${count} online users`;
      });
    })
  });
};

const showActiveRoomChats = roomInfo => {
  const chatInput = querySelector(".chat__content-bottom-bar-input");
  chatInput.value = "";

  const chatHeader = document.querySelector(".chat__header");
  chatHeader.classList.add("chat__header--active");

  const roomTitle = document.querySelector(".chat__header-name");
  roomTitle.innerHTML = roomInfo.title;

  const roomAvatar = document.querySelector(".chat__header-avatar");
  roomAvatar.src = roomInfo.image ? `http://localhost:3000/uploads/${roomInfo.image}` : "../public/images/default.png";

  const chatContent = document.querySelector(".chat__content");
  chatContent.classList.add("chat__content--active");

  const chatContainer = document.querySelector(".chat__content-main");
  chatContainer.innerHTML = "";
  const messageTemplates = getMessageTemplates(roomInfo.messages);
  chatContainer.insertAdjacentHTML("beforeend", messageTemplates);

  renderMaps(roomInfo.locations);

  const activeChatContainer = document.querySelector(".chat__content--active");
  activeChatContainer.addEventListener("click", scrollToChatFloor);
};

const getMessageTemplates = messages => {
  const messageTemplateArray = messages.map(message => {
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

    return messageTemplate;
  });

  const messageTemplates = messageTemplateArray.join("\n");
  return messageTemplates;
};

const renderMaps = locations => {
  locations.forEach(locationData => {
    let locationTemplate = null;
    const locationId = Date.now() + "-" + crypto.randomUUID();

    if (locationData.sender === user._id) {
      locationTemplate = `
        <div class="chat__content-receiver-wrapper chat__content-wrapper">
          <div class="chat__content-receiver chat__content-map">
            <div id="${locationId}" class="map-receiver"></div>
            <span class="chat__content-chat-clock">17:55</span>
          </div>
        </div>
      `
    } else {
      locationTemplate = `
        <div class="chat__content-sender-wrapper chat__content-wrapper">
          <div class="chat__content-sender chat__content-map">
            <div id="${locationId}" class="map-sender"></div>
            <span class="chat__content-chat-clock">17:58</span>
          </div>
        </div>
      `
    }

    const chatContainer = document.querySelector(".chat__content-main");
    chatContainer.insertAdjacentHTML("beforeend", locationTemplate);

    initMap(locationId, locationData.longitude, locationData.latitude);
  });
};

const sendMessageHandler = () => {
  const chatInput = querySelector(".chat__content-bottom-bar-input");
  chatInput.addEventListener("keydown", sendMessage);
};

const sendMessage = event => {
  const chatInput = event.target;
  const message = chatInput.value?.trim();

  if (event.key !== "Enter" || !message) {
    return;
  }

  const messageData = {
    message,
    roomTitle: activeRoomTitle,
    senderId: user._id
  };

  activeNamespaceSocket.emit("send-message", messageData);
  chatInput.value = "";
};

const showMessageHandler = () => {
  activeNamespaceSocket.on("room-message", showMessage);
};

const showMessage = message => {
  const messageTemplate = getMessageTemplates([message]);
  const chatContainer = document.querySelector(".chat__content-main");
  chatContainer.insertAdjacentHTML("beforeend", messageTemplate);
  scrollToChatFloor();
};

const scrollToChatFloor = () => {
  const chatContainer = document.querySelector(".chat__content--active");

  chatContainer.scrollTo({
    behavior: "smooth",
    left: 0,
    top: chatContainer.scrollHeight
  });
};

const sendIsTypingStatusHandler = () => {
  const chatInput = querySelector(".chat__content-bottom-bar-input");
  chatInput.addEventListener("keydown", sendIsTypingStatus);
};

const sendIsTypingStatus = event => {
  const message = event.target.value;
  if (!message) {
    return;
  }

  const typingStatusData = {
    user,
    roomTitle: activeRoomTitle,
    isTyping: true
  };
  activeNamespaceSocket.emit("typing", typingStatusData);


  const isTypingTimeout = setTimeout(() => {
    const typingStatusData = {
      user,
      roomTitle: activeRoomTitle,
      isTyping: false
    };
    activeNamespaceSocket.emit("typing", typingStatusData);
    clearTimeout(isTypingTimeout);

  }, 2000);
};

const showTypingStatusHandler = () => {
  activeNamespaceSocket.on("typing-status", showTypingStatus);
};

const showTypingStatus = data => {
  const chatStatusContainer = querySelector(".chat__header-status");

  if (data.user._id === user._id) {
    return;
  }

  chatStatusContainer.innerHTML = `${user.name} is typing ...`;
};

const sendLocationHandler = () => {
  const sendLocationIcon = querySelector(".location-icon");
  sendLocationIcon.addEventListener("click", sendLocation);
};

const sendLocation = () => {
  const longitude = 35.734799;
  const latitude = 51.189626;

  const locationData = {
    location: {
      longitude,
      latitude
    },

    roomTitle: activeRoomTitle,
    senderId: user._id
  };

  activeNamespaceSocket.emit("send-location", locationData);
};

const showLocationHandler = () => {
  activeNamespaceSocket.on("room-location", showLocation);
};

const showLocation = locationData => {
  const manipulatedLocationData = {
    longitude: locationData.location.longitude,
    latitude: locationData.location.latitude,
    sender: locationData.sender,
  };

  renderMaps([manipulatedLocationData]);
  scrollToChatFloor();
};

const initMap = (id, x, y) => {
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

const sendMediaHandler = () => {
  const mediaInput = querySelector("#file-input");
  mediaInput.addEventListener("change", sendMedia);
};

const sendMedia = event => {
  const fileInfo = event.target.files[0];
  if (!fileInfo) {
    return;
  }

  const fileData = {
    senderId: user._id,
    file: fileInfo,
    filename: fileInfo.name,
    roomTitle: activeRoomTitle
  };

  activeNamespaceSocket.emit("send-media", fileData);
};

const showMediaHandler = fileData => {
  activeNamespaceSocket.on("room-media", showMedia);
};

const showMedia = mediaData => {
  console.log(mediaData);
};

export {
  authorizeUser,
  defineSocket,
  showNamespaces,
  sendMessageHandler,
  showMessageHandler,
  sendIsTypingStatusHandler,
  showTypingStatusHandler,
  sendLocationHandler,
  showLocationHandler,
  sendMediaHandler,
  showMediaHandler
};