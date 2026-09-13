const Configuracao =
  require("../models/Configuracao");

async function buscarConfiguracao() {

  let configuracao =
    await Configuracao.findOne({
      chave: "principal"
    });

  if (!configuracao) {

    configuracao =
      await Configuracao.create({
        chave: "principal"
      });

  }

  return configuracao;
}

// ========================================
// BUSCAR CONFIGURAÇÕES
// ========================================

exports.buscar = async (req, res) => {

  try {

    const configuracao =
      await buscarConfiguracao();

    return res.status(200).json(
      configuracao
    );

  } catch (error) {

    console.error(
      "Erro ao buscar configurações:",
      error
    );

    return res.status(500).json({
      mensagem:
        "Erro ao buscar configurações."
    });

  }

};

// ========================================
// EDITAR CONFIGURAÇÕES
// ========================================

exports.editar = async (req, res) => {

  try {

    if (
      !req.usuario ||
      req.usuario.tipo !== "admin"
    ) {

      return res.status(403).json({
        mensagem:
          "Somente o administrador pode alterar as configurações."
      });

    }

    const {
  nomeLoja,
  whatsapp,
  nomeEntregador,
  whatsappEntregador,
  pixChave,
  pixNome,
  taxaEntrega,
  horarioAbertura,
  horarioFechamento,
  lojaAberta,
  avisoAtivo,
  aviso
} = req.body;

    const configuracao =
      await buscarConfiguracao();

    if (taxaEntrega !== undefined) {

      const taxa =
        Number(taxaEntrega);

      if (
        !Number.isFinite(taxa) ||
        taxa < 0
      ) {

        return res.status(400).json({
          mensagem:
            "Taxa de entrega inválida."
        });

      }

      configuracao.taxaEntrega =
        taxa;
    }

    if (nomeLoja !== undefined) {
      configuracao.nomeLoja =
        nomeLoja.trim();
    }

    if (whatsapp !== undefined) {
      configuracao.whatsapp =
        whatsapp.trim();
    }

    if (nomeEntregador !== undefined) {

  configuracao.nomeEntregador =
    String(nomeEntregador)
      .trim();

}

if (whatsappEntregador !== undefined) {

  const numeroEntregador =
    String(whatsappEntregador)
      .replace(/\D/g, "");

  if (
    numeroEntregador &&
    ![10, 11, 12, 13]
      .includes(numeroEntregador.length)
  ) {

    return res.status(400).json({
      mensagem:
        "Informe um WhatsApp válido para o entregador."
    });

  }

  configuracao.whatsappEntregador =
    numeroEntregador;

}

    if (pixChave !== undefined) {
      configuracao.pixChave =
        pixChave.trim();
    }

    if (pixNome !== undefined) {
      configuracao.pixNome =
        pixNome.trim();
    }

    if (horarioAbertura !== undefined) {
      configuracao.horarioAbertura =
        horarioAbertura;
    }

    if (horarioFechamento !== undefined) {
      configuracao.horarioFechamento =
        horarioFechamento;
    }

    if (typeof lojaAberta === "boolean") {
      configuracao.lojaAberta =
        lojaAberta;
    }

    if (typeof avisoAtivo === "boolean") {
  configuracao.avisoAtivo =
    avisoAtivo;
}

    if (aviso !== undefined) {
      configuracao.aviso =
        aviso.trim();
    }

    await configuracao.save();

    return res.status(200).json({
      mensagem:
        "Configurações atualizadas com sucesso.",
      configuracao
    });

  } catch (error) {

    console.error(
      "Erro ao atualizar configurações:",
      error
    );

    return res.status(500).json({
      mensagem:
        "Erro ao atualizar configurações."
    });

  }

};