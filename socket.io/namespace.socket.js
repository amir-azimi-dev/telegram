const namespaceModel = require("../app/models/chat");

const initiateConnection = io => {
    io.on("connection", async client => {
        const namespaces = await namespaceModel.find().sort({ createdAt: -1 });
        client.emit("namespaces", namespaces);
    });
};

const getNamespaceRooms = async io => {
    const namespaces = await namespaceModel.find().sort({ createdAt: -1 });
    namespaces.forEach(namespace => {
        io.of(namespace.href).on("connection", client => {
            client.emit("namespaceRooms", namespace.rooms);
        });
    });
};

module.exports = {
    initiateConnection,
    getNamespaceRooms
};