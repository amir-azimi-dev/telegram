const userModel = require("../models/user");
const jwt = require("jsonwebtoken");

exports.getUserInfo = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        const token = authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized!!!" });
        }

        const payload = jwt.decode(token, process.env.JWT_SECRET_KEY);
        if (!payload?.id) {
            return res.status(403).json({ message: "Forbidden!!!" });
        }
        const user = await userModel.findById(payload.id);

        return res.json({ success: true, message: "user authorized successfully.", payload: user });

    } catch (error) {
        next(error);
    }
};

exports.authenticate = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ message: "Name and phone are required." });
        }

        const targetUser = await userModel.findOne({ phone });
        if (targetUser) {
            const token = getUserToken(targetUser._id);
            return res.json({ success: true, message: "You logged in successfully.", token });
        }

        const userData = { name, phone };
        const user = await userModel.create(userData);
        const token = getUserToken(user._id);

        return res.status(201).json({ success: true, message: "User created successfully.", token });

    } catch (error) {
        next(error);
    }
};

const getUserToken = userId => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: "10d" });
    return token;
};