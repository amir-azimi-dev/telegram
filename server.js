require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");
const http = require("http");
const connectIo = require("./utils/socket");
const executeSocketIo = require("./socket.io");
const { MONGO_URI, PORT } = process.env;

const connectToDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("----------------------------\n");
        console.log("Connected to MongoDB.");

    } catch (error) {
        console.error("db connection Error:\n", error);
        process.exit(1);
    }
};

const startServer = async () => {
    const httpServer = http.createServer(app);
    const io = connectIo(httpServer);
    await executeSocketIo(io);

    const port = PORT || 3000;
    httpServer.listen(port, () => {
        console.log(`Server is running on port ${port} ...`);
    });
};

const run = async () => {
    await connectToDB();
    startServer();
};

run();