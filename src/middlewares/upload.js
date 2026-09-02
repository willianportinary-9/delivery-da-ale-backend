const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        const extensoesPermitidas = [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        ];

        const extensao = path
            .extname(file.originalname)
            .toLowerCase();

        const mimeValido =
            tiposPermitidos.includes(file.mimetype);

        const octetStreamValido =
            file.mimetype === "application/octet-stream" &&
            extensoesPermitidas.includes(extensao);

        if (mimeValido || octetStreamValido) {
            return cb(null, true);
        }

        cb(
            new Error(
                "Formato de imagem não permitido"
            ),
            false
        );
    }
});

module.exports = upload;