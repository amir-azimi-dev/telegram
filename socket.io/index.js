const { initiateConnection, getNamespaceRooms } = require("./namespace.socket");

const executeSocketIo = async io => {
    initiateConnection(io);
    await getNamespaceRooms(io);
};  

module.exports = executeSocketIo;