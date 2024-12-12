const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const roomSchema = new mongoose.Schema({        // telegram channel, group or PV model
    title: {
        type: String,
        required: true
    },
    title: String,
    messages: {
        type: [messageSchema],
        default: []
    }
}, {
    timestamps: true
});

const namespaceSchema = new mongoose.Schema({   // telegram folder model
    title: {
        type: String,
        required: true
    },
    href: {
        type: String,
        required: true
    },
    rooms: {
        type: [roomSchema],
        default: []
    }
}, {
    timestamps: true
});

const messageModel = new mongoose.model("Message", roomSchema);
const roomModel = new mongoose.model("Room", roomSchema);
const namespaceModel = new mongoose.model("Namespace", roomSchema);

module.exports = namespaceModel;