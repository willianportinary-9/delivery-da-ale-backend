const Produto = require("../models/Produto");

const imagekit = require("../config/imagekit");

const {
    toFile
} = require("@imagekit/nodejs");


exports.listar = async (req, res) => {
    try {
        const produtos = await Produto.find({
            ativo: true
        })
            .populate("categoria", "nome")
            .sort({
                createdAt: -1
            });

        res.json(produtos);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            erro: "Erro ao listar produtos"
        });
    }
};

exports.criar = async (req, res) => {
    try {
        const {
            nome,
            descricao,
            preco,
            categoria
        } = req.body;

        if (!nome || !preco || !categoria) {
            return res.status(400).json({
                erro: "Nome, preço e categoria são obrigatórios"
            });
        }

        let imagem = null;
let imagemFileId = null;

        if (req.file) {
    const nomeArquivo =
        `${Date.now()}-${req.file.originalname}`;

    const arquivo = await toFile(
        req.file.buffer,
        nomeArquivo
    );

    const resultadoUpload =
        await imagekit.files.upload({
            file: arquivo,
            fileName: nomeArquivo,
            folder: "/delivery-ale/produtos"
        });

    imagem = resultadoUpload.url;
    imagemFileId = resultadoUpload.fileId;
}

        const produto = await Produto.create({
            nome,
            descricao,
            preco,
            categoria,
            imagem,
            imagemFileId
        });

        res.status(201).json(produto);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            erro: "Erro ao criar produto"
        });
    }
};

exports.editar = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      descricao,
      preco,
      categoria
    } = req.body;

    // Busca o produto antes de editar
    const produto = await Produto.findById(id);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado"
      });
    }

    // Guarda o ID da imagem antiga
    const imagemAntigaFileId =
      produto.imagemFileId;

    let novaImagemFileId = null;

    // Se uma nova imagem foi enviada
    if (req.file) {

      const nomeArquivo =
        `${Date.now()}-${req.file.originalname}`;

      const arquivo = await toFile(
        req.file.buffer,
        nomeArquivo
      );

      const resultadoUpload =
        await imagekit.files.upload({
          file: arquivo,
          fileName: nomeArquivo,
          folder: "/delivery-ale/produtos"
        });

      // Atualiza imagem do produto
      produto.imagem =
        resultadoUpload.url;

      produto.imagemFileId =
        resultadoUpload.fileId;

      novaImagemFileId =
        resultadoUpload.fileId;
    }

    // Atualiza os outros dados
    produto.nome = nome;
    produto.descricao = descricao;
    produto.preco = preco;
    produto.categoria = categoria;

    await produto.save();

    // Se colocou imagem nova,
    // remove a imagem antiga do ImageKit
    if (
      req.file &&
      imagemAntigaFileId &&
      imagemAntigaFileId !== novaImagemFileId
    ) {
      try {

        await imagekit.files.delete(
          imagemAntigaFileId
        );

      } catch (erroImagem) {

        console.error(
          "Erro ao remover imagem antiga:",
          erroImagem
        );

      }
    }

    const produtoAtualizado =
      await Produto.findById(
        produto._id
      ).populate(
        "categoria",
        "nome"
      );

    return res.status(200).json({
      mensagem:
        "Produto atualizado com sucesso",
      produto: produtoAtualizado
    });

  } catch (error) {

    console.error(
      "Erro ao editar produto:",
      error
    );

    return res.status(500).json({
      erro: "Erro ao editar produto"
    });

  }
};

exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;

        const produto = await Produto.findByIdAndUpdate(
            id,
            {
                ativo: false
            },
            {
                new: true
            }
        );

        if (!produto) {
            return res.status(404).json({
                erro: "Produto não encontrado"
            });
        }

        res.json({
            mensagem: "Produto removido"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            erro: "Erro ao remover produto"
        });
    }
};