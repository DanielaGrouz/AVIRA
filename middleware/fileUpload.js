const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const storage = multer.diskStorage({
    // Define the specific folder to save the image
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    // Define the filename (preventing naming conflicts)
    filename: function (req, file, cb) {
        // Example: image-1634567890123.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
})

// 4. Initialize Multer with the storage and filter configurations
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});



module.exports = {upload, uploadDir};