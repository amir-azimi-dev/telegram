const namespaceModel = require("../models/chat");

exports.getAll = async (req, res, next) => {
    try {
        const namespaces = await namespaceModel.find({}, { room: 0 });
        return res.json(namespaces);

    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { title, href } = req.body;

        if (!title || !href) {
            return res.status(400).json({ message: "Title and href are required." });
        }

        const namespace = await namespaceModel.findOne({ $or: [{ title }, { href }] });
        if (namespace) {
            return res.status(409).json({ message: "Namespace already exists." });
        }

        const namespaceData = {
            title,
            href
        };
        await namespaceModel.create(namespaceData);
        return res.status(201).json({ success: true, message: "Namespace created successfully." });

    } catch (error) {
        next(error);
    }
};