const path = require("path")
const fs = require("fs");

const uploadFile = (fileBuffer, filename, destination) => {
    try {
        const directoryPath = path.join(process.cwd(), "public", destination);

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }

        const fileExtension = path.extname(filename);
        const randomFileName = Date.now() + '-' + crypto.randomUUID() + fileExtension;
        const filePath = path.join(directoryPath, randomFileName);

        fs.writeFile(filePath, fileBuffer, error => {
            if (error) {
                throw new Error(`Error while uploading the file ${filename}`)
            }
        });
        return randomFileName;

    } catch (error) {
        console.log(error)
        return false;
    }
};

module.exports = {
    uploadFile
};