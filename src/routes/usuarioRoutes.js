const express = require("express");

const autenticar =
  require("../middlewares/auth");

const {
  cadastrarUsuario,
  loginUsuario,
  atualizarTelefone,
  buscarContaAdmin,
  atualizarContaAdmin,
} = require("../controllers/usuarioController");

const router = express.Router();

router.post(
  "/cadastro",
  cadastrarUsuario
);

router.post(
  "/login",
  loginUsuario
);

router.get(
  "/perfil",
  autenticar,
  (req, res) => {
    res.json({
      mensagem:
        "Usuário autenticado com sucesso.",
      usuario: req.usuario,
    });
  }
);

router.put(
  "/perfil",
  autenticar,
  atualizarTelefone
);

// CONTA DO ADMINISTRADOR

router.get(
  "/admin/conta",
  autenticar,
  buscarContaAdmin
);

router.put(
  "/admin/conta",
  autenticar,
  atualizarContaAdmin
);

module.exports = router;