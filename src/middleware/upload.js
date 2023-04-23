const multer = require('multer');
const fs = require('fs');
const path = require('path');

const dir = './static/assets/uploads/';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${__dirname}/../../static/assets/uploads/`);
    },
    filename: (req, file, cb) => {
        const filePath = path.join(`${__dirname}/../../static/assets/uploads/`, file.originalname);
        if (fs.existsSync(filePath)) {
            cb(new Error('File with the same name already exists'), null);
        } else {
            cb(null, file.originalname);
        }
    },
});

// Function to check the accepted MIME types
const fileFilter = (req, file, cb) => {
    const mimeType = file.mimetype;
    if (
        mimeType.startsWith('audio/') ||
        mimeType.startsWith('video/') ||
        mimeType.startsWith('image/') ||
        mimeType === 'application/x-www-form-urlencoded'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

module.exports = store = multer({
    storage: storage,
    fileFilter: fileFilter,
    onFileSizeLimit: function (file) {
        fs.unlinkSync('./' + file.path);
    },
});
