const mongoose = require("mongoose");

const ConfiguracaoSchema = new mongoose.Schema(
  {
    chave: {
      type: String,
      default: "principal",
      unique: true
    },

    nomeLoja: {
      type: String,
      default: "Delivery da Alê",
      trim: true
    },

    whatsapp: {
      type: String,
      default: "",
      trim: true
    },

    pixChave: {
      type: String,
      default: "",
      trim: true
    },

    pixNome: {
      type: String,
      default: "",
      trim: true
    },

    taxaEntrega: {
      type: Number,
      default: 3,
      min: 0
    },

    horarioAbertura: {
      type: String,
      default: "10:00"
    },

    horarioFechamento: {
      type: String,
      default: "14:00"
    },

    lojaAberta: {
      type: Boolean,
      default: true
    },

    avisoAtivo: {
  type: Boolean,
  default: true
},

    aviso: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.model(
    "Configuracao",
    ConfiguracaoSchema
  );