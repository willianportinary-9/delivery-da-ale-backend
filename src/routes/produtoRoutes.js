const express =
  require("express");

const router =
  express.Router();

const produtoController =
  require(
    "../controllers/produtoController"
  );

const upload =
  require(
    "../middlewares/upload"
  );

const autenticar =
  require(
    "../middlewares/auth"
  );

const somenteAdmin =
  require(
    "../middlewares/admin"
  );

// ============================================
// LISTAR PRODUTOS
// ============================================

// Pública.
// A Home precisa desta rota.

router.get(
  "/",
  produtoController.listar
);

// ============================================
// CRIAR PRODUTO
// ============================================

router.post(
  "/",
  autenticar,
  somenteAdmin,
  upload.single("imagem"),
  produtoController.criar
);

// ============================================
// EDITAR PRODUTO
// ============================================

router.put(
  "/:id",
  autenticar,
  somenteAdmin,
  upload.single("imagem"),
  produtoController.editar
);

// ============================================
// DESATIVAR PRODUTO
// ============================================

router.delete(
  "/:id",
  autenticar,
  somenteAdmin,
  produtoController.deletar
);

module.exports =
  router;