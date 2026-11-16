// Usa os componentes Cliente, Produto e Estoque
const { db, transacao } = require('../db');
const { ErroNegocio, inteiro, formatar } = require('./erro');
const cliente = require('./cliente');
const produto = require('./produto');
const estoque = require('./estoque');

// O XML pode entregar 1 item (objeto) ou vários (array): normalizamos para array
const comoLista = (x) => (x === undefined || x === null ? [] : [].concat(x));

const visao = (p) => ({
  idPedido: p.idPedido,
  cliente: p.cliente,
  itens: {
    item: p.itens.map((i) => ({
      codigoProduto: i.codigoProduto,
      nome: i.nome,
      quantidade: i.quantidade,
      subtotal: formatar(i.subtotalCentavos),
    })),
  },
  total: formatar(p.totalCentavos),
  status: p.status,
});

function criar(codigoCliente, itensEntrada) {
  const cli = cliente.obter(codigoCliente);

  const lista = comoLista(itensEntrada && itensEntrada.item);
  if (lista.length === 0) {
    throw new ErroNegocio('Client', 'O pedido precisa ter ao menos um item', 'itens vazio');
  }

  // 1) valida e consolida produtos repetidos (só leitura)
  const consolidado = new Map();
  for (const it of lista) {
    const prod = produto.buscar(it.codigoProduto);
    const qtd = inteiro(it.quantidade, 'quantidade');
    if (qtd <= 0) {
      throw new ErroNegocio('Client', 'Quantidade deve ser maior que zero', `quantidade=${it.quantidade}`);
    }
    consolidado.set(prod.codigo, (consolidado.get(prod.codigo) || 0) + qtd);
  }

  // 2) TRANSAÇÃO: baixa o estoque e grava pedido + itens. Se qualquer item faltar,
  //    o estoque lança Fault e o ROLLBACK desfaz tudo (nada fica pela metade)
  const id = transacao(() => {
    const itens = [];
    let totalCentavos = 0;
    for (const [codigo, qtd] of consolidado) {
      estoque.baixar(codigo, qtd);
      const prod = produto.buscar(codigo);
      const subtotalCentavos = prod.centavos * qtd;
      totalCentavos += subtotalCentavos;
      itens.push({ codigo, qtd, subtotalCentavos });
    }
    const r = db
      .prepare('INSERT INTO pedido (codigo_cliente, total_centavos) VALUES (?, ?)')
      .run(cli.codigo, totalCentavos);
    const idPedido = Number(r.lastInsertRowid);
    const inserirItem = db.prepare(
      'INSERT INTO item_pedido (id_pedido, codigo_produto, quantidade, subtotal_centavos) VALUES (?, ?, ?, ?)'
    );
    for (const i of itens) inserirItem.run(idPedido, i.codigo, i.qtd, i.subtotalCentavos);
    return idPedido;
  });

  return obter(id);
}

// Uso interno (Pagamento depende disto): devolve o pedido "cru", com valores em centavos
function buscar(idPedido) {
  const n = inteiro(idPedido, 'idPedido');
  const p = db
    .prepare(
      `SELECT p.id_pedido AS idPedido, c.nome AS cliente, p.total_centavos AS totalCentavos, p.status
         FROM pedido p JOIN cliente c ON c.codigo = p.codigo_cliente
        WHERE p.id_pedido = ?`
    )
    .get(n);
  if (!p) throw new ErroNegocio('Client', 'Pedido inexistente', `idPedido=${idPedido}`);
  const itens = db
    .prepare(
      `SELECT i.codigo_produto AS codigoProduto, pr.nome, i.quantidade, i.subtotal_centavos AS subtotalCentavos
         FROM item_pedido i JOIN produto pr ON pr.codigo = i.codigo_produto
        WHERE i.id_pedido = ? ORDER BY i.id_item`
    )
    .all(n)
    .map((i) => ({ ...i }));
  return { idPedido: p.idPedido, cliente: p.cliente, totalCentavos: p.totalCentavos, status: p.status, itens };
}

const obter = (id) => visao(buscar(id));
const marcarPago = (id) => {
  db.prepare("UPDATE pedido SET status = 'PAGO' WHERE id_pedido = ?").run(buscar(id).idPedido);
};

module.exports = { criar, obter, buscar, marcarPago };
