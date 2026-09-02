const express = require("express");

const {
  cadastrarEndereco,
  listarEnderecos,
} = require("../controllers/enderecoController");

const autenticar = require("../middlewares/auth");

const router = express.Router();

router.post("/", autenticar, cadastrarEndereco);
router.get("/", autenticar, listarEnderecos);

module.exports = router;