const express =
  require("express");

const router =
  express.Router();

const categoriaController =
  require(
    "../controllers/categoriaController"
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
// ROTAS PÚBLICAS
// ============================================

// Cliente precisa consultar
// categorias no cardápio.

router.get(
  "/",
  categoriaController.listar
);

// ============================================
// ROTAS ADMINISTRATIVAS
// ============================================

// Criar categoria

router.post(
  "/",
  autenticar,
  somenteAdmin,
  categoriaController.criar
);

// Editar categoria

router.put(
  "/:id",
  autenticar,
  somenteAdmin,
  categoriaController.editar
);

// Desativar categoria

router.delete(
  "/:id",
  autenticar,
  somenteAdmin,
  categoriaController.deletar
);

module.exports =
  router;