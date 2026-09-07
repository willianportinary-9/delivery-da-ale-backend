const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const Usuario = require("../models/Usuario");

// CADASTRAR USUÁRIO

const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Nome, email e senha são obrigatórios.",
      });
    }

    const usuarioExistente = await Usuario.findOne({ email });

    if (usuarioExistente) {
      return res.status(400).json({
        mensagem: "Já existe um usuário cadastrado com este email.",
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada,
      telefone,
      tipo: "cliente",
    });

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso.",
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        telefone: novoUsuario.telefone,
        tipo: novoUsuario.tipo,
      },
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar usuário.",
    });
  }
};

// LOGIN

const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Email e senha são obrigatórios.",
      });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({
        mensagem: "Email ou senha inválidos.",
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "Email ou senha inválidos.",
      });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        tipo: usuario.tipo,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso.",
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        tipo: usuario.tipo,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao realizar login.",
    });
  }
};

// ATUALIZAR TELEFONE DO PERFIL

const atualizarTelefone = async (req, res) => {
  try {
    const { telefone } = req.body;

    const usuarioId =
      req.usuario?._id ||
      req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const telefoneLimpo =
      String(telefone || "")
        .replace(/\D/g, "");

    if (
      telefoneLimpo.length < 10 ||
      telefoneLimpo.length > 11
    ) {
      return res.status(400).json({
        mensagem:
          "Informe um telefone válido com DDD.",
      });
    }

    const usuarioAtualizado =
      await Usuario.findByIdAndUpdate(
        usuarioId,
        {
          telefone: telefoneLimpo,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!usuarioAtualizado) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem:
        "Telefone atualizado com sucesso.",
      usuario: {
        id: usuarioAtualizado._id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        telefone: usuarioAtualizado.telefone,
        tipo: usuarioAtualizado.tipo,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar telefone:",
      error
    );

    return res.status(500).json({
      mensagem:
        "Erro interno ao atualizar telefone.",
    });
  }
};

module.exports = {
  cadastrarUsuario,
  loginUsuario,
  atualizarTelefone,
};