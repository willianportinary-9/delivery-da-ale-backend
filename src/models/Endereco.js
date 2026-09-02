const mongoose = require("mongoose");

const EnderecoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    nome: {
      type: String,
      default: "Meu endereço",
      trim: true,
    },

    rua: {
      type: String,
      required: true,
      trim: true,
    },

    numero: {
      type: String,
      required: true,
      trim: true,
    },

    bairro: {
      type: String,
      required: true,
      trim: true,
    },

    cidade: {
      type: String,
      required: true,
      trim: true,
    },

    complemento: {
      type: String,
      default: "",
      trim: true,
    },

    referencia: {
      type: String,
      default: "",
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    linkMaps: {
      type: String,
      default: "",
    },

    principal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Endereco", EnderecoSchema);