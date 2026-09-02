const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
            trim: true
        },

        descricao: {
            type: String,
            default: ""
        },

        preco: {
            type: Number,
            required: true,
            min: 0
        },

        categoria: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Categoria",
            required: true
        },

        imagem: {
            type: String,
            default: null
        },

        imagemFileId: {
        type: String,
        default: null
       },

        ativo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Produto",
    produtoSchema
);