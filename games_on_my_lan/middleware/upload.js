import multer from "multer";

const upload = multer({
    dest: "temp/"
});

export default upload;