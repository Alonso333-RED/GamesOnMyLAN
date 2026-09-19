import multer from "multer";
import path from "path";

const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024;

const upload = multer({
    dest: "temp/",
    limits: {
        fileSize: MAX_UPLOAD_BYTES,
        files: 2,
        fields: 10,
        fieldSize: 10 * 1024
    },
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();

        if (file.fieldname === "gameFile" && ext === ".zip") return cb(null, true);
        if (file.fieldname === "thumbnail" && ext === ".png") return cb(null, true);

        const err = new Error("Tipo de archivo no permitido");
        err.status = 400;
        cb(err);
    }
});

export default upload;