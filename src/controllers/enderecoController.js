const Endereco = require("../models/Endereco");

// CADASTRAR ENDEREÇO
const cadastrarEndereco = async (req, res) => {
  try {
    const {
      nome,
      rua,
      numero,
      bairro,
      cidade,
      complemento,
      referencia,
      latitude,
      longitude,
      principal,
    } = req.body;

    if (!rua || !numero || !bairro || !cidade) {
      return res.status(400).json({
        mensagem: "Rua, número, bairro e cidade são obrigatórios.",
      });
    }

    // ID vem do usuário autenticado pelo token
    const usuarioId = req.usuario.id;

    // Verifica se o usuário já possui algum endereço
    const quantidadeEnderecos = await Endereco.countDocuments({
      usuario: usuarioId,
    });

    // O primeiro endereço será principal automaticamente
    const deveSerPrincipal =
      quantidadeEnderecos === 0 || principal === true;

    // Se este endereço for principal,
    // tira o principal dos anteriores
    if (deveSerPrincipal) {
      await Endereco.updateMany(
        { usuario: usuarioId },
        { principal: false }
      );
    }

    // Monta o link do Google Maps
    let linkMaps = "";

    if (latitude != null && longitude != null) {
      linkMaps = `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    const endereco = await Endereco.create({
      usuario: usuarioId,
      nome,
      rua,
      numero,
      bairro,
      cidade,
      complemento,
      referencia,
      latitude,
      longitude,
      linkMaps,
      principal: deveSerPrincipal,
    });

    return res.status(201).json({
      mensagem: "Endereço cadastrado com sucesso.",
      endereco,
    });
  } catch (error) {
    console.error("Erro ao cadastrar endereço:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar endereço.",
    });
  }
};

// LISTAR ENDEREÇOS DO USUÁRIO LOGADO
const listarEnderecos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const enderecos = await Endereco.find({
      usuario: usuarioId,
    }).sort({
      principal: -1,
      createdAt: -1,
    });

    return res.status(200).json(enderecos);
  } catch (error) {
    console.error("Erro ao listar endereços:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar endereços.",
    });
  }
};

module.exports = {
  cadastrarEndereco,
  listarEnderecos,
};