const fs = require("fs");
const multer = require("multer");
const path = require("path");

const multerStorage = (destination, allowedTypes = /jpg|jpeg|png/) => {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination);
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            const randomName = Date.now() + '-' + crypto.randomUUID();
            const fileExtension = path.extname(file.originalname);
            const filename = randomName + fileExtension;
            cb(null, filename);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (!allowedTypes.test(file.mimetype)) {
            return cb(new Error("Invalid file type: " + file.mimetype + "!!!"));
        }

        return cb(null, true);
    };

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 5 // 5MB
        },
        fileFilter
    });

    return upload;

};

module.exports = multerStorage;