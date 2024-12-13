const namespaceModel = require("../models/chat");

exports.create = async (req, res, next) => {
    try {
        const { title, namespace } = req.body;
        if (!title || !namespace) {
            return res.status(400).json({ message: "Title and namespace are required." });
        }

        const targetNamespace = await namespaceModel.findOne({ href: namespace });
        if (!targetNamespace) {
            return res.status(404).json({ message: "Namespace doesn't exist." });
        }

        const room = await namespaceModel.findOne({ "rooms.title": title });
        if (room) {
            return res.status(409).json({ message: "Room already exists." });
        }

        let roomData = { title };
        if (req.file?.filename) {
            const filename = `rooms/${req.file.filename}`;
            roomData = { ...roomData, image: filename };
        }

        await namespaceModel.updateOne({ href: namespace }, {
            $push: { rooms: roomData }
        });

        return res.status(201).json({ success: true, message: "Room created successfully." });

    } catch (error) {
        next(error);
    }
};