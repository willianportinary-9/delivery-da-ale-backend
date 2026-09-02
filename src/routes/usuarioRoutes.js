const express = require("express");
const autenticar = require("../middlewares/auth");

const {
  cadastrarUsuario,
  loginUsuario,
} = require("../controllers/usuarioController");

const router = express.Router();

router.post("/cadastro", cadastrarUsuario);
router.post("/login", loginUsuario);
router.get("/perfil", autenticar, (req, res) => {
  res.json({
    mensagem: "Usuário autenticado com sucesso.",
    usuario: req.usuario,
  });
});
module.exports = router;