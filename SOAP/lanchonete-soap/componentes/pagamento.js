// Depende da existência de um Pedido
const { db, transacao } = require('../db');
const { ErroNegocio, emCentavos, formatar } = require('./erro');
const pedido = require('./pedido');

const FORMAS = ['DINHEIRO', 'PIX', 'CARTAO'];

function processar(idPedido, formaPagamento, valor) {
  const p = pedido.buscar(idPedido); // Fault se o pedido não existe
  if (p.status === 'PAGO') {
    throw new ErroNegocio('Client', 'Pedido já foi pago', `idPedido=${idPedido}`);
  }
  if (!FORMAS.includes(formaPagamento)) {
    throw new ErroNegocio('Client', 'Forma de pagamento inválida',
      `formaPagamento=${formaPagamento}; aceitas=${FORMAS.join('|')}`);
  }
  const recebido = emCentavos(valor);
  if (Number.isNaN(recebido)) {
    throw new ErroNegocio('Client', 'Valor deve ser numérico', `valor=${valor}`);
  }

  let troco = 0;
  if (formaPagamento === 'DINHEIRO') {
    if (recebido < p.totalCentavos) {
      throw new ErroNegocio('Client', 'Valor insuficiente para quitar o pedido',
        `total=${formatar(p.totalCentavos)}; recebido=${formatar(recebido)}`);
    }
    troco = recebido - p.totalCentavos;
  } else if (recebido !== p.totalCentavos) {
    throw new ErroNegocio('Client', `Pagamento em ${formaPagamento} deve ser exatamente o total do pedido`,
      `total=${formatar(p.totalCentavos)}; recebido=${formatar(recebido)}`);
  }

  // Transação: registra o pagamento E marca o pedido como PAGO, juntos
  transacao(() => {
    db.prepare(
      'INSERT INTO pagamento (id_pedido, forma, valor_centavos, troco_centavos) VALUES (?, ?, ?, ?)'
    ).run(p.idPedido, formaPagamento, recebido, troco);
    pedido.marcarPago(p.idPedido);
  });

  return {
    idPedido: p.idPedido,
    status: 'APROVADO',
    formaPagamento,
    troco: formatar(troco),
    mensagem: `Pagamento de R$ ${formatar(p.totalCentavos)} confirmado via ${formaPagamento}`,
  };
}

module.exports = { processar };
