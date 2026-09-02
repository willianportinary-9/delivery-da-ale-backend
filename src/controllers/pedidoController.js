const mongoose = require("mongoose");

const Pedido = require("../models/Pedido");
const Produto = require("../models/Produto");
const Endereco = require("../models/Endereco");
const Configuracao = require("../models/Configuracao");

// =====================================================
// AUXILIARES
// =====================================================

const arredondar = (valor) => {
  return Math.round(
    (valor + Number.EPSILON) * 100
  ) / 100;
};

function usuarioEhAdmin(req) {
  return (
    req.usuario &&
    req.usuario.tipo === "admin"
  );
}

// =====================================================
// CRIAR PEDIDO
// =====================================================

const criarPedido = async (req, res) => {
  try {

    const usuarioId =
      req.usuario.id;

    const configuracao =
      await Configuracao.findOne({
        chave: "principal"
      });

    /*
      Segurança no backend.

      Mesmo que alguém tente chamar
      a API diretamente, não poderá
      criar pedido com a loja fechada.
    */

    if (
      configuracao &&
      configuracao.lojaAberta === false
    ) {

      return res.status(403).json({
        mensagem:
          "A loja está fechada no momento."
      });

    }

    const taxaEntregaConfigurada =
      Number(
        configuracao?.taxaEntrega ?? 3
      );

    const {
      itens,
      tipoEntrega,
      enderecoId,
      pagamento,
      trocoPara,
      observacoes,
      latitude,
      longitude
    } = req.body;

    // -------------------------------------------------
    // VALIDAÇÕES
    // -------------------------------------------------

    if (
      !Array.isArray(itens) ||
      itens.length === 0
    ) {

      return res.status(400).json({
        mensagem:
          "O pedido precisa possuir pelo menos um produto."
      });

    }

    if (
      ![
        "entrega",
        "retirada"
      ].includes(tipoEntrega)
    ) {

      return res.status(400).json({
        mensagem:
          "Tipo de entrega inválido."
      });

    }

    if (
      ![
        "pix",
        "dinheiro"
      ].includes(pagamento)
    ) {

      return res.status(400).json({
        mensagem:
          "Forma de pagamento inválida."
      });

    }

    for (const item of itens) {

      if (
        !item.produto ||
        !mongoose.isValidObjectId(
          item.produto
        ) ||
        !Number.isInteger(
          item.quantidade
        ) ||
        item.quantidade < 1
      ) {

        return res.status(400).json({
          mensagem:
            "Produto ou quantidade inválida."
        });

      }

    }

    // -------------------------------------------------
    // PRODUTOS
    // -------------------------------------------------

    const idsProdutos =
      itens.map(
        (item) =>
          item.produto
      );

    const produtos =
      await Produto.find({
        _id: {
          $in: idsProdutos
        },
        ativo: true
      });

    if (
      produtos.length !==
      new Set(idsProdutos).size
    ) {

      return res.status(400).json({
        mensagem:
          "Um ou mais produtos não existem ou estão indisponíveis."
      });

    }

    // -------------------------------------------------
    // ITENS
    // -------------------------------------------------

    const itensPedido = [];

    let subtotal = 0;

    for (const item of itens) {

      const produto =
        produtos.find(
          (produtoAtual) =>
            produtoAtual._id
              .toString() ===
            item.produto
        );

      const subtotalItem =
        arredondar(
          Number(produto.preco) *
          item.quantidade
        );

      subtotal +=
        subtotalItem;

      itensPedido.push({

        produto:
          produto._id,

        nome:
          produto.nome,

        preco:
          produto.preco,

        quantidade:
          item.quantidade,

        subtotal:
          subtotalItem

      });

    }

    subtotal =
      arredondar(subtotal);

    // -------------------------------------------------
    // ENDEREÇO E LOCALIZAÇÃO
    // -------------------------------------------------

    let enderecoPedido = {};

    if (
      tipoEntrega === "entrega"
    ) {

      if (
        !enderecoId ||
        !mongoose.isValidObjectId(
          enderecoId
        )
      ) {

        return res.status(400).json({
          mensagem:
            "Selecione um endereço para entrega."
        });

      }

      const endereco =
        await Endereco.findOne({
          _id: enderecoId,
          usuario: usuarioId
        });

      if (!endereco) {

        return res.status(404).json({
          mensagem:
            "Endereço não encontrado."
        });

      }

      const latitudePedido =
        latitude != null
          ? Number(latitude)
          : endereco.latitude;

      const longitudePedido =
        longitude != null
          ? Number(longitude)
          : endereco.longitude;

      let linkMaps =
        endereco.linkMaps || "";

      if (
        Number.isFinite(
          latitudePedido
        ) &&
        Number.isFinite(
          longitudePedido
        )
      ) {

        linkMaps =
          `https://www.google.com/maps?q=${latitudePedido},${longitudePedido}`;

      }

      enderecoPedido = {

        nome:
          endereco.nome,

        rua:
          endereco.rua,

        numero:
          endereco.numero,

        bairro:
          endereco.bairro,

        cidade:
          endereco.cidade,

        complemento:
          endereco.complemento,

        referencia:
          endereco.referencia,

        latitude:
          latitudePedido,

        longitude:
          longitudePedido,

        linkMaps

      };

    }

    // -------------------------------------------------
    // VALORES
    // -------------------------------------------------

    const taxaEntrega =
      tipoEntrega === "entrega"
        ? taxaEntregaConfigurada
        : 0;

    const total =
      arredondar(
        subtotal +
        taxaEntrega
      );

    if (
      pagamento === "dinheiro" &&
      trocoPara != null &&
      Number(trocoPara) <
        total
    ) {

      return res.status(400).json({
        mensagem:
          "O valor informado para troco não pode ser menor que o total."
      });

    }

    // -------------------------------------------------
    // CRIAR
    // -------------------------------------------------

    const pedido =
      await Pedido.create({

        usuario:
          usuarioId,

        itens:
          itensPedido,

        tipoEntrega,

        endereco:
          enderecoPedido,

        pagamento,

        trocoPara:
          pagamento === "dinheiro" &&
          trocoPara != null
            ? Number(trocoPara)
            : null,

        observacoes:
          observacoes || "",

        subtotal,

        taxaEntrega,

        total,

        status:
          "Recebido",

        arquivado:
          false,

        arquivadoEm:
          null,

        historicoStatus: [
          {
            status:
              "Recebido",

            data:
              new Date()
          }
        ]

      });

    return res.status(201).json({

      mensagem:
        "Pedido realizado com sucesso.",

      pedido

    });

  } catch (error) {

    console.error(
      "Erro ao criar pedido:",
      error
    );

    return res.status(500).json({
      mensagem:
        "Erro interno ao criar pedido."
    });

  }
};

// =====================================================
// LISTAR PEDIDOS
// =====================================================

const listarPedidos = async (req, res) => {
  try {

    let pedidos;

    // -------------------------------------------------
    // ADMIN
    // -------------------------------------------------

    if (
      usuarioEhAdmin(req)
    ) {

      const verArquivados =
        req.query.arquivados ===
        "true";

      /*
        Pedidos antigos podem não possuir
        o campo "arquivado".

        Por isso consideramos campo
        inexistente como pedido ativo.
      */

      const filtro =
        verArquivados
          ? {
              arquivado: true
            }
          : {
              $or: [
                {
                  arquivado: false
                },
                {
                  arquivado: {
                    $exists: false
                  }
                }
              ]
            };

      pedidos =
        await Pedido.find(
          filtro
        )
          .populate(
            "usuario",
            "nome email telefone"
          )
          .populate(
            "itens.produto"
          )
          .sort({
            createdAt: -1
          });

    } else {

      /*
        O cliente continua vendo
        o próprio histórico completo.

        Arquivar no painel administrativo
        não apaga o pedido para o cliente.
      */

      pedidos =
        await Pedido.find({
          usuario:
            req.usuario.id
        })
          .populate(
            "itens.produto"
          )
          .sort({
            createdAt: -1
          });

    }

    return res.status(200)
      .json(pedidos);

  } catch (error) {

    console.error(
      "Erro ao listar pedidos:",
      error
    );

    return res.status(500).json({
      mensagem:
        "Erro interno ao buscar pedidos."
    });

  }
};

// =====================================================
// LISTAR PEDIDOS DO CLIENTE
// =====================================================

const listarMeusPedidos =
  async (req, res) => {

    try {

      const pedidos =
        await Pedido.find({
          usuario:
            req.usuario.id
        })
          .populate(
            "itens.produto"
          )
          .sort({
            createdAt: -1
          });

      return res.status(200)
        .json(pedidos);

    } catch (error) {

      console.error(
        "Erro ao listar meus pedidos:",
        error
      );

      return res.status(500).json({
        mensagem:
          "Erro ao listar pedidos."
      });

    }

  };

// =====================================================
// ALTERAR STATUS
// =====================================================

const atualizarStatus =
  async (req, res) => {

    try {

      if (
        !usuarioEhAdmin(req)
      ) {

        return res.status(403).json({
          mensagem:
            "Somente o administrador pode alterar o status do pedido."
        });

      }

      const {
        status
      } = req.body;

      const statusValidos = [
        "Recebido",
        "Preparando",
        "Saiu para entrega",
        "Entregue"
      ];

      if (
        !statusValidos.includes(
          status
        )
      ) {

        return res.status(400).json({
          mensagem:
            "Status inválido."
        });

      }

      const pedido =
        await Pedido.findById(
          req.params.id
        );

      if (!pedido) {

        return res.status(404).json({
          mensagem:
            "Pedido não encontrado."
        });

      }

      if (
        pedido.arquivado
      ) {

        return res.status(400).json({
          mensagem:
            "Restaure o pedido antes de alterar o status."
        });

      }

      if (
        pedido.status !==
        status
      ) {

        pedido.status =
          status;

        pedido.historicoStatus
          .push({

            status,

            data:
              new Date()

          });

        await pedido.save();

      }

      return res.status(200).json({

        mensagem:
          "Status atualizado com sucesso.",

        pedido

      });

    } catch (error) {

      console.error(
        "Erro ao atualizar status:",
        error
      );

      return res.status(500).json({
        mensagem:
          "Erro interno ao atualizar status."
      });

    }

  };

// =====================================================
// ARQUIVAR PEDIDO
// =====================================================

const arquivarPedido =
  async (req, res) => {

    try {

      if (
        !usuarioEhAdmin(req)
      ) {

        return res.status(403).json({
          mensagem:
            "Somente o administrador pode arquivar pedidos."
        });

      }

      const pedido =
        await Pedido.findById(
          req.params.id
        );

      if (!pedido) {

        return res.status(404).json({
          mensagem:
            "Pedido não encontrado."
        });

      }

      /*
        Somente pedidos concluídos podem
        sair da lista principal.
      */

      if (
        pedido.status !==
        "Entregue"
      ) {

        return res.status(400).json({
          mensagem:
            "Somente pedidos entregues podem ser arquivados."
        });

      }

      if (
        pedido.arquivado
      ) {

        return res.status(400).json({
          mensagem:
            "Este pedido já está arquivado."
        });

      }

      pedido.arquivado =
        true;

      pedido.arquivadoEm =
        new Date();

      await pedido.save();

      return res.status(200).json({

        mensagem:
          "Pedido arquivado com sucesso.",

        pedido

      });

    } catch (error) {

      console.error(
        "Erro ao arquivar pedido:",
        error
      );

      return res.status(500).json({
        mensagem:
          "Erro interno ao arquivar pedido."
      });

    }

  };

// =====================================================
// RESTAURAR PEDIDO
// =====================================================

const restaurarPedido =
  async (req, res) => {

    try {

      if (
        !usuarioEhAdmin(req)
      ) {

        return res.status(403).json({
          mensagem:
            "Somente o administrador pode restaurar pedidos."
        });

      }

      const pedido =
        await Pedido.findById(
          req.params.id
        );

      if (!pedido) {

        return res.status(404).json({
          mensagem:
            "Pedido não encontrado."
        });

      }

      if (
        !pedido.arquivado
      ) {

        return res.status(400).json({
          mensagem:
            "Este pedido não está arquivado."
        });

      }

      pedido.arquivado =
        false;

      pedido.arquivadoEm =
        null;

      await pedido.save();

      return res.status(200).json({

        mensagem:
          "Pedido restaurado com sucesso.",

        pedido

      });

    } catch (error) {

      console.error(
        "Erro ao restaurar pedido:",
        error
      );

      return res.status(500).json({
        mensagem:
          "Erro interno ao restaurar pedido."
      });

    }

  };

// =====================================================
// EXCLUIR DEFINITIVAMENTE
// =====================================================

const excluirPedido =
  async (req, res) => {

    try {

      if (
        !usuarioEhAdmin(req)
      ) {

        return res.status(403).json({
          mensagem:
            "Somente o administrador pode excluir pedidos."
        });

      }

      const pedido =
        await Pedido.findById(
          req.params.id
        );

      if (!pedido) {

        return res.status(404).json({
          mensagem:
            "Pedido não encontrado."
        });

      }

      /*
        Segurança:

        Não permitimos excluir diretamente
        um pedido que ainda esteja na lista
        principal.
      */

      if (
        !pedido.arquivado
      ) {

        return res.status(400).json({
          mensagem:
            "Arquive o pedido antes de excluí-lo definitivamente."
        });

      }

      await Pedido.deleteOne({
        _id:
          pedido._id
      });

      return res.status(200).json({
        mensagem:
          "Pedido excluído definitivamente."
      });

    } catch (error) {

      console.error(
        "Erro ao excluir pedido:",
        error
      );

      return res.status(500).json({
        mensagem:
          "Erro interno ao excluir pedido."
      });

    }

  };

// =====================================================
// EXPORTAÇÕES
// =====================================================

module.exports = {

  criarPedido,

  listarPedidos,

  listarMeusPedidos,

  atualizarStatus,

  arquivarPedido,

  restaurarPedido,

  excluirPedido

};