const Pedido = require("../models/Pedido");
const Produto = require("../models/Produto");
const Categoria = require("../models/Categoria");
const Usuario = require("../models/Usuario");

// =====================================================
// INTERVALO DO DIA - HORÁRIO DE BRASÍLIA
// =====================================================

function intervaloHojeBrasil() {

  const agora = new Date();

  const dataBrasil =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ).format(agora);

  const inicio =
    new Date(
      `${dataBrasil}T00:00:00-03:00`
    );

  const fim =
    new Date(
      `${dataBrasil}T23:59:59.999-03:00`
    );

  return {
    inicio,
    fim
  };

}

// =====================================================
// FILTRO DE PEDIDOS NÃO ARQUIVADOS
// =====================================================

function filtroAtivos() {

  return {
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

}

// =====================================================
// DASHBOARD
// =====================================================

exports.resumo = async (req, res) => {

  try {

    // ---------------------------------------------
    // SOMENTE ADMIN
    // ---------------------------------------------

    if (
      !req.usuario ||
      req.usuario.tipo !== "admin"
    ) {

      return res.status(403).json({
        mensagem:
          "Acesso permitido somente para administradores."
      });

    }

    const {
      inicio,
      fim
    } = intervaloHojeBrasil();

    const ativos =
      filtroAtivos();

    // ---------------------------------------------
    // PEDIDOS HOJE
    // ---------------------------------------------

    /*
      Conta todos os pedidos criados hoje.

      Mesmo que um pedido seja arquivado depois,
      ele continua fazendo parte do movimento
      daquele dia.
    */

    const pedidosHoje =
      await Pedido.countDocuments({
        createdAt: {
          $gte: inicio,
          $lte: fim
        }
      });

    // ---------------------------------------------
    // TOTAL DE PEDIDOS
    // ---------------------------------------------

    const totalPedidos =
      await Pedido.countDocuments();

    // ---------------------------------------------
    // STATUS OPERACIONAIS
    // ---------------------------------------------

    /*
      Pedidos arquivados NÃO entram aqui.

      Isso evita pedidos antigos entregues
      inflarem a operação atual.
    */

    const [
      recebidos,
      preparando,
      saiuParaEntrega,
      entregues
    ] = await Promise.all([

      Pedido.countDocuments({
        ...ativos,
        status: "Recebido"
      }),

      Pedido.countDocuments({
        ...ativos,
        status: "Preparando"
      }),

      Pedido.countDocuments({
        ...ativos,
        status:
          "Saiu para entrega"
      }),

      Pedido.countDocuments({
        ...ativos,
        status: "Entregue"
      })

    ]);

    // ---------------------------------------------
    // FATURAMENTO DE HOJE
    // ---------------------------------------------

    /*
      Arquivados continuam contando no
      faturamento.

      Procuramos quando o pedido realmente
      chegou ao status Entregue.
    */

    const pedidosEntreguesHoje =
      await Pedido.find({

        status:
          "Entregue",

        $or: [

          {
            historicoStatus: {
              $elemMatch: {
                status:
                  "Entregue",

                data: {
                  $gte: inicio,
                  $lte: fim
                }
              }
            }
          },

          /*
            Compatibilidade com pedidos antigos
            sem histórico de status.
          */

          {
            $and: [

              {
                $or: [
                  {
                    historicoStatus: {
                      $exists: false
                    }
                  },
                  {
                    "historicoStatus.0": {
                      $exists: false
                    }
                  }
                ]
              },

              {
                createdAt: {
                  $gte: inicio,
                  $lte: fim
                }
              }

            ]
          }

        ]

      }).select(
        "total"
      );

    const totalVendidoHoje =
      pedidosEntreguesHoje.reduce(
        (
          acumulado,
          pedido
        ) => {

          return (
            acumulado +
            Number(
              pedido.total || 0
            )
          );

        },
        0
      );

    // ---------------------------------------------
    // FATURAMENTO TOTAL
    // ---------------------------------------------

    /*
      Arquivados também permanecem aqui.

      Só uma exclusão definitiva tira
      o pedido do faturamento histórico.
    */

    const faturamento =
      await Pedido.aggregate([

        {
          $match: {
            status:
              "Entregue"
          }
        },

        {
          $group: {

            _id: null,

            total: {
              $sum: "$total"
            },

            quantidade: {
              $sum: 1
            }

          }
        }

      ]);

    const totalVendido =
      Number(
        faturamento[0]
          ?.total || 0
      );

    const quantidadeEntregues =
      Number(
        faturamento[0]
          ?.quantidade || 0
      );

    // ---------------------------------------------
    // TICKET MÉDIO
    // ---------------------------------------------

    const ticketMedio =
      quantidadeEntregues > 0
        ? totalVendido /
          quantidadeEntregues
        : 0;

    // ---------------------------------------------
    // PRODUTOS
    // ---------------------------------------------

    const produtosAtivos =
      await Produto.countDocuments({
        ativo: true
      });

    // ---------------------------------------------
    // CATEGORIAS
    // ---------------------------------------------

    const categoriasAtivas =
      await Categoria.countDocuments({
        ativo: true
      });

    // ---------------------------------------------
    // CLIENTES
    // ---------------------------------------------

    const clientes =
      await Usuario.countDocuments({
        tipo: "cliente"
      });

    // ---------------------------------------------
    // PEDIDOS RECENTES
    // ---------------------------------------------

    /*
      Arquivados não aparecem nos pedidos
      recentes do Dashboard.
    */

    const pedidosRecentes =
      await Pedido.find(
        ativos
      )
        .populate(
          "usuario",
          "nome email telefone"
        )
        .sort({
          createdAt: -1
        })
        .limit(10);

    // ---------------------------------------------
    // RESPOSTA
    // ---------------------------------------------

    return res.status(200).json({

      pedidosHoje,

      totalPedidos,

      status: {

        recebidos,

        preparando,

        saiuParaEntrega,

        entregues

      },

      totalVendidoHoje,

      totalVendido,

      ticketMedio,

      produtosAtivos,

      categoriasAtivas,

      clientes,

      pedidosRecentes

    });

  } catch (error) {

    console.error(
      "Erro ao carregar dashboard:",
      error
    );

    return res.status(500).json({
      mensagem:
        "Erro ao carregar dashboard."
    });

  }

};