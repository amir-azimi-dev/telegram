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
      <li class="sidebar__contact-item">
        <a class="sidebar__contact-link" href="#">
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
              class="sidebar__contact-counter sidebar__counter sidebar__counter-active"
              >66</span
            >
          </div>
        </a>
      </li>
    `
  );

  const roomTemplates = roomTemplateArray.join("");
  roomsContainer.insertAdjacentHTML("beforeend", roomTemplates);
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

export {
  defineSocket,
  showNamespaces
};