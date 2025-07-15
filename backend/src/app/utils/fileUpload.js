import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

/* ES module dirname fix */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Base upload dir */
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/* Ensure base dir exists */
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* Storage */
const storage = multer.diskStorage({
    destination(req, file, cb) {
        let fieldFolder = file.fieldname; // separate by field name (default)

        // 📝 Custom logic for Essay module
        if (req.originalUrl.includes("/generate-essay")) {
            fieldFolder = "essays";
        }

        const uploadPath = path.join(UPLOAD_DIR, fieldFolder);

        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },

    filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${crypto.randomUUID()}${ext}`;
        cb(null, filename);
    },
});

/* Allow ALL files */
const fileFilter = (req, file, cb) => {
    cb(null, true);
};

/* Multer instance */
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
