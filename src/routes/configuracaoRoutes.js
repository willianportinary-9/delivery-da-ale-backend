const express =
  require("express");

const router =
  express.Router();

const autenticar =
  require(
    "../middlewares/auth"
  );

const somenteAdmin =
  require(
    "../middlewares/admin"
  );

const configuracaoController =
  require(
    "../controllers/configuracaoController"
  );

// ============================================
// CONFIGURAÇÕES PÚBLICAS
// ============================================

/*
  Home e Checkout precisam consultar:

  - loja aberta/fechada
  - horário
  - taxa
  - PIX
  - aviso
*/

router.get(
  "/",
  configuracaoController.buscar
);

// ============================================
// ALTERAR CONFIGURAÇÕES
// ============================================

router.put(
  "/",
  autenticar,
  somenteAdmin,
  configuracaoController.editar
);

module.exports =
  router;