const express =
  require("express");

const {
  criarPedido,
  listarPedidos,
  listarMeusPedidos,
  atualizarStatus,
  arquivarPedido,
  restaurarPedido,
  excluirPedido
} = require(
  "../controllers/pedidoController"
);

const autenticar =
  require(
    "../middlewares/auth"
  );

const somenteAdmin =
  require(
    "../middlewares/admin"
  );

const router =
  express.Router();

// ============================================
// CLIENTE
// ============================================

// Criar pedido

router.post(
  "/",
  autenticar,
  criarPedido
);

// Próprios pedidos

router.get(
  "/meus",
  autenticar,
  listarMeusPedidos
);

// ============================================
// LISTAGEM
// ============================================

/*
  Esta continua somente autenticada
  porque o controller diferencia:

  admin -> todos
  cliente -> próprios
*/

router.get(
  "/",
  autenticar,
  listarPedidos
);

// ============================================
// ADMIN
// ============================================

// Alterar status

router.patch(
  "/:id/status",
  autenticar,
  somenteAdmin,
  atualizarStatus
);

// Arquivar

router.patch(
  "/:id/arquivar",
  autenticar,
  somenteAdmin,
  arquivarPedido
);

// Restaurar

router.patch(
  "/:id/restaurar",
  autenticar,
  somenteAdmin,
  restaurarPedido
);

// Excluir definitivamente

router.delete(
  "/:id",
  autenticar,
  somenteAdmin,
  excluirPedido
);

module.exports =
  router;