const dotenv = require("dotenv");

// CARREGA O .ENV ANTES DE TODO O RESTO
dotenv.config();

const express = require("express");
const cors = require("cors");

const conectarBanco = require("./config/db");

const usuarioRoutes =
  require("./routes/usuarioRoutes");

const enderecoRoutes =
  require("./routes/enderecoRoutes");

const pedidoRoutes =
  require("./routes/pedidoRoutes");

const dashboardRoutes =
  require("./routes/dashboardRoutes");

const configuracaoRoutes =
  require("./routes/configuracaoRoutes");

const categoriaRoutes =
  require("./routes/categoriaRoutes");

const produtoRoutes =
  require("./routes/produtoRoutes");

const app = express();

// ============================================
// CORS
// ============================================

const origensPermitidas = [
  "http://localhost:5173",
];

if (process.env.FRONTEND_URL) {
  origensPermitidas.push(
    process.env.FRONTEND_URL
  );
}

app.use(
  cors({
    origin: (origin, callback) => {

      // Permite Postman, apps sem origin etc.
      if (!origin) {
        return callback(null, true);
      }

      if (
        origensPermitidas.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          "Origem não permitida pelo CORS."
        )
      );
    },

    credentials: true,
  })
);

// ============================================
// JSON
// ============================================

app.use(express.json());

// ============================================
// BANCO
// ============================================

conectarBanco();

// ============================================
// ROTAS
// ============================================

app.use(
  "/categorias",
  categoriaRoutes
);

app.use(
  "/produtos",
  produtoRoutes
);

app.use(
  "/dashboard",
  dashboardRoutes
);

app.use(
  "/usuarios",
  usuarioRoutes
);

app.use(
  "/enderecos",
  enderecoRoutes
);

app.use(
  "/pedidos",
  pedidoRoutes
);

app.use(
  "/configuracoes",
  configuracaoRoutes
);

// ============================================
// TESTE DA API
// ============================================

app.get("/", (req, res) => {

  res.json({
    mensagem:
      "API Delivery da Alê funcionando"
  });

});

// ============================================
// SERVIDOR
// ============================================

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  () => {

    console.log(
      `Servidor rodando na porta ${PORT}`
    );

  }
);