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