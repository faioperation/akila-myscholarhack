import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/invoice";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `invoice-${Date.now()}${ext}`;
        cb(null, filename);
    },
});

export const uploadInvoice = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
