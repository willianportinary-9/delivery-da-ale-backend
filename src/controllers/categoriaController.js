const Categoria = require("../models/Categoria");

// LISTAR CATEGORIAS
exports.listar = async (req, res) => {
  try {
    const categorias = await Categoria.find({
      ativo: true
    }).sort({
      nome: 1
    });

    return res.json(categorias);

  } catch (error) {

    console.error(
      "Erro ao listar categorias:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao listar categorias"
    });
  }
};

// CRIAR CATEGORIA
exports.criar = async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome da categoria é obrigatório"
      });
    }

    const categoriaExistente =
      await Categoria.findOne({
        nome: {
          $regex: `^${nome.trim()}$`,
          $options: "i"
        },
        ativo: true
      });

    if (categoriaExistente) {
      return res.status(400).json({
        erro: "Esta categoria já existe"
      });
    }

    const categoria =
      await Categoria.create({
        nome: nome.trim()
      });

    return res.status(201).json({
      mensagem:
        "Categoria criada com sucesso",
      categoria
    });

  } catch (error) {

    console.error(
      "Erro ao criar categoria:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao criar categoria"
    });
  }
};

// EDITAR CATEGORIA
exports.editar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome da categoria é obrigatório"
      });
    }

    const categoria =
      await Categoria.findById(id);

    if (!categoria) {
      return res.status(404).json({
        erro: "Categoria não encontrada"
      });
    }

    const categoriaExistente =
      await Categoria.findOne({
        _id: {
          $ne: id
        },
        nome: {
          $regex: `^${nome.trim()}$`,
          $options: "i"
        },
        ativo: true
      });

    if (categoriaExistente) {
      return res.status(400).json({
        erro:
          "Já existe outra categoria com este nome"
      });
    }

    categoria.nome =
      nome.trim();

    await categoria.save();

    return res.status(200).json({
      mensagem:
        "Categoria atualizada com sucesso",
      categoria
    });

  } catch (error) {

    console.error(
      "Erro ao editar categoria:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao editar categoria"
    });
  }
};

// DESATIVAR CATEGORIA
exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria =
      await Categoria.findByIdAndUpdate(
        id,
        {
          ativo: false
        },
        {
          new: true
        }
      );

    if (!categoria) {
      return res.status(404).json({
        erro: "Categoria não encontrada"
      });
    }

    return res.status(200).json({
      mensagem:
        "Categoria desativada com sucesso"
    });

  } catch (error) {

    console.error(
      "Erro ao desativar categoria:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao desativar categoria"
    });
  }
};