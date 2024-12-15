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
                userLastRoom && client.leave(userLastRoom);
                const targetRooms = namespace.rooms;
                const targetRoomData = targetRooms.find(room => room.title === roomTitle);

                client.join(roomTitle);
                client.emit("room-info", targetRoomData);
            });
        });
    });
};

module.exports = {
    initiateConnection,
    getNamespaceRooms
};