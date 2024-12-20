let socket = null;
let activeNamespaceSocket = null;

const querySelector = query => document.querySelector(query);
const querySelectorAll = query => document.querySelectorAll(query);

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

      const roomTitle = room.dataset.roomTitle;
      activeNamespaceSocket.emit("join", roomTitle);

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

  const chatsContainer = document.querySelector(".chat__content-main");
  chatsContainer.innerHTML = "";
  const messageTemplates = getMessageTemplates(roomInfo.messages);
  chatsContainer.insertAdjacentHTML("beforeend", messageTemplates)
};

const getMessageTemplates = messages => {
  const messageTemplateArray = messages.map(message => {
    let messageTemplate = null;
    if (false && message.sender === user._id) {
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

export {
  defineSocket,
  showNamespaces
};