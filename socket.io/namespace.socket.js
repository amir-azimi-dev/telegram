const namespaceModel = require("../app/models/chat");

const initiateConnection = io => {
    io.on("connection", async client => {
        const namespaces = await namespaceModel.find().sort({ createdAt: -1 });
        client.emit("namespaces", namespaces);
    });
};

const getNamespaceRooms = async io => {
    const namespaces = await namespaceModel.find().sort({ createdAt: -1 });
    namespaces.forEach(async namespace => {
        namespace = await namespaceModel.findById(namespace.id);

        io.of(namespace.href).on("connection", client => {
            client.emit("namespaceRooms", namespace.rooms);

            client.on("join", async roomTitle => {
                const userLastRoom = Array.from(client.rooms)[1];
                if (userLastRoom) {
                    const leftRoomNamespace = await getRoomNamespace(userLastRoom);
                    client.leave(userLastRoom);
                    await sendOnlineUserCountOfRoom(io, leftRoomNamespace.href, userLastRoom);
                }

                client.join(roomTitle);
                await sendOnlineUserCountOfRoom(io, namespace.href, roomTitle);

                const targetRooms = namespace.rooms;
                const targetRoomData = targetRooms.find(room => room.title === roomTitle);
                client.emit("room-info", targetRoomData);

                client.on("disconnect", async () => {
                    await sendOnlineUserCountOfRoom(io, namespace.href, roomTitle);
                });
            });

            client.on("send-message", async ({ message, roomTitle }) => {
                if (!message || !roomTitle) {
                    return;
                }

                await sendMessageHandler(message, roomTitle);
            });
        });
    });
};

const sendOnlineUserCountOfRoom = async (io, namespaceHref, roomTitle) => {
    const roomOnlineUserIds = await io
        .of(namespaceHref)
        .in(roomTitle)
        .allSockets();

    const onlineUserCount = roomOnlineUserIds.size;

    io
        .of(namespaceHref)
        .in(roomTitle)
        .emit("online-user-count", onlineUserCount);
};

const getRoomNamespace = async roomTitle => {
    const targetNamespace = await namespaceModel.findOne({ "rooms.title": roomTitle });
    return targetNamespace;
};

const sendMessageHandler = async (message, roomTitle) => {
    await namespaceModel.updateOne({ "rooms.title": roomTitle }, {
        $push: { "rooms.$.messages": { message } }
    });

    // console.log(targetRoomData)
};

module.exports = {
    initiateConnection,
    getNamespaceRooms
};