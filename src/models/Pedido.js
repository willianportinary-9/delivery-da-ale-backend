const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    itens: [
      {
        produto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Produto",
          required: true,
        },

        nome: {
          type: String,
          required: true,
        },

        preco: {
          type: Number,
          required: true,
        },

        quantidade: {
          type: Number,
          required: true,
          min: 1,
        },

        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],

    tipoEntrega: {
      type: String,
      enum: ["entrega", "retirada"],
      required: true,
    },

    endereco: {
      nome: String,
      rua: String,
      numero: String,
      bairro: String,
      cidade: String,
      complemento: String,
      referencia: String,

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
    },

    pagamento: {
      type: String,
      enum: ["pix", "dinheiro"],
      required: true,
    },

    trocoPara: {
      type: Number,
      default: null,
    },

    observacoes: {
      type: String,
      default: "",
    },

    subtotal: {
      type: Number,
      required: true,
    },

    taxaEntrega: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Recebido",
        "Preparando",
        "Saiu para entrega",
        "Entregue",
      ],
      default: "Recebido",
    },

    historicoStatus: [
      {
        status: {
          type: String,
          enum: [
            "Recebido",
            "Preparando",
            "Saiu para entrega",
            "Entregue",
          ],
        },

        data: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    arquivado: {
  type: Boolean,
  default: false,
  index: true
},

arquivadoEm: {
  type: Date,
  default: null
},


  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pedido", PedidoSchema);