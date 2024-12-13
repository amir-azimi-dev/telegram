const socket = require("socket.io");

const connectIo = httpServer => {
    const io = socket(httpServer, {
        cors: {
            origin: "*",
            credential: true
        }
    });

    return io;
};

module.exports = connectIo;