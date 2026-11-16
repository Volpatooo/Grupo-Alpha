// teste-componentes.js - testa os 5 componentes + SQLite SEM precisar do SOAP.
// Usa um banco em memória (não mexe no seu lanchonete.db).
// Rodar: node teste-componentes.js
process.env.DB_PATH = ':memory:';
const assert = require('assert');
const produto = require('./componentes/produto');
const estoque = require('./componentes/estoque');
const cliente = require('./componentes/cliente');
const pedido = require('./componentes/pedido');
const pagamento = require('./componentes/pagamento');
const { ErroNegocio } = require('./componentes/erro');
const { db } = require('./db');

let ok = 0;
function teste(nome, fn) { fn(); ok++; console.log('  ok -', nome); }
function falha(fn, tipo, trecho) {
  try { fn(); } catch (e) {
    assert(e instanceof ErroNegocio, 'esperava ErroNegocio, veio: ' + e);
    assert.strictEqual(e.tipo, tipo);
    assert(e.message.includes(trecho), `mensagem "${e.message}" sem "${trecho}"`);
    return;
  }
  assert.fail('deveria ter falhado: ' + trecho);
}

console.log('Produto');
teste('lista 6 itens do cardapio', () => assert.strictEqual(produto.listar().length, 6));
teste('consulta X-Burger', () => assert.deepStrictEqual(produto.obter(1),
  { codigo: 1, nome: 'X-Burger', categoria: 'LANCHE', preco: '18.00' }));
teste('aceita codigo como texto (vem do XML)', () => assert.strictEqual(produto.obter('1').nome, 'X-Burger'));
teste('produto inexistente -> Fault Client', () => falha(() => produto.obter(99), 'Client', 'Produto não encontrado'));

console.log('Estoque (depende de Produto)');
teste('consulta estoque', () => assert.strictEqual(estoque.consultar(1).quantidade, 30));
teste('estoque de produto nao cadastrado falha', () => falha(() => estoque.consultar(99), 'Client', 'Produto não encontrado'));

console.log('Cliente');
teste('cadastra e consulta', () => {
  const c = cliente.cadastrar('Ana Lima', '47988887777');
  assert.strictEqual(cliente.obter(c.codigo).nome, 'Ana Lima');
});
teste('nome invalido', () => falha(() => cliente.cadastrar('', '1'), 'Client', 'Nome inválido'));
teste('cliente inexistente', () => falha(() => cliente.obter(999), 'Client', 'Cliente não encontrado'));

console.log('Pedido (requer Cliente, Produto, Estoque)');
let ped;
teste('cria pedido com varios itens e calcula total', () => {
  ped = pedido.criar(1, { item: [
    { codigoProduto: 1, quantidade: 2 }, // 36.00
    { codigoProduto: 3, quantidade: 1 }, // 12.00
    { codigoProduto: 4, quantidade: 2 }, // 12.00
  ] });
  assert.strictEqual(ped.total, '60.00');
  assert.strictEqual(ped.itens.item.length, 3);
  assert.strictEqual(ped.status, 'AGUARDANDO_PAGAMENTO');
});
teste('aceita 1 unico item (objeto, nao array)', () => {
  const p = pedido.criar(1, { item: { codigoProduto: 5, quantidade: 1 } });
  assert.strictEqual(p.total, '9.00');
});
teste('baixou o estoque', () => assert.strictEqual(estoque.consultar(1).quantidade, 28));
teste('itens repetidos sao consolidados', () => {
  const p = pedido.criar(2, { item: [{ codigoProduto: 2, quantidade: 1 }, { codigoProduto: 2, quantidade: 2 }] });
  assert.strictEqual(p.itens.item.length, 1);
  assert.strictEqual(p.itens.item[0].quantidade, 3);
  assert.strictEqual(p.total, '60.00');
});
teste('cliente inexistente', () => falha(() => pedido.criar(999, { item: [{ codigoProduto: 1, quantidade: 1 }] }), 'Client', 'Cliente não encontrado'));
teste('produto inexistente', () => falha(() => pedido.criar(1, { item: [{ codigoProduto: 99, quantidade: 1 }] }), 'Client', 'Produto não encontrado'));
teste('quantidade invalida', () => falha(() => pedido.criar(1, { item: [{ codigoProduto: 1, quantidade: 0 }] }), 'Client', 'Quantidade'));
teste('pedido sem itens', () => falha(() => pedido.criar(1, {}), 'Client', 'ao menos um item'));
teste('estoque insuficiente -> Fault Server e nada e baixado', () => {
  const antes = estoque.consultar(6).quantidade;
  falha(() => pedido.criar(1, { item: [{ codigoProduto: 6, quantidade: 1 }, { codigoProduto: 6, quantidade: 999 }] }), 'Server', 'Estoque insuficiente');
  assert.strictEqual(estoque.consultar(6).quantidade, antes);
});
teste('rollback desfaz TODAS as baixas quando um item falta (transacao)', () => {
  const antes5 = estoque.consultar(5).quantidade;
  const pedidosAntes = db.prepare('SELECT COUNT(*) AS n FROM pedido').get().n;
  falha(() => pedido.criar(1, { item: [{ codigoProduto: 5, quantidade: 1 }, { codigoProduto: 6, quantidade: 999 }] }), 'Server', 'Estoque insuficiente');
  assert.strictEqual(estoque.consultar(5).quantidade, antes5);
  assert.strictEqual(db.prepare('SELECT COUNT(*) AS n FROM pedido').get().n, pedidosAntes);
});
teste('consulta pedido', () => assert.strictEqual(pedido.obter(ped.idPedido).total, '60.00'));
teste('pedido inexistente', () => falha(() => pedido.obter(555), 'Client', 'Pedido inexistente'));

console.log('Pagamento (depende de Pedido)');
teste('dinheiro com troco', () => {
  const r = pagamento.processar(ped.idPedido, 'DINHEIRO', 100);
  assert.strictEqual(r.troco, '40.00');
  assert.strictEqual(r.status, 'APROVADO');
  assert.strictEqual(pedido.obter(ped.idPedido).status, 'PAGO');
  const linha = db.prepare('SELECT forma, valor_centavos AS v, troco_centavos AS t FROM pagamento WHERE id_pedido = ?').get(ped.idPedido);
  assert.deepStrictEqual({ ...linha }, { forma: 'DINHEIRO', v: 10000, t: 4000 }); // gravou na tabela pagamento
});
teste('pagar de novo falha', () => falha(() => pagamento.processar(ped.idPedido, 'PIX', 60), 'Client', 'já foi pago'));
teste('pedido inexistente', () => falha(() => pagamento.processar(777, 'PIX', 10), 'Client', 'Pedido inexistente'));
teste('dinheiro insuficiente', () => {
  const p = pedido.criar(1, { item: [{ codigoProduto: 2, quantidade: 1 }] });
  falha(() => pagamento.processar(p.idPedido, 'DINHEIRO', 5), 'Client', 'Valor insuficiente');
});
teste('PIX exige valor exato', () => {
  const p = pedido.criar(1, { item: [{ codigoProduto: 2, quantidade: 1 }] });
  falha(() => pagamento.processar(p.idPedido, 'PIX', 25), 'Client', 'exatamente');
  assert.strictEqual(pagamento.processar(p.idPedido, 'PIX', 20).troco, '0.00');
});
teste('forma de pagamento invalida', () => {
  const p = pedido.criar(1, { item: [{ codigoProduto: 4, quantidade: 1 }] });
  falha(() => pagamento.processar(p.idPedido, 'FIADO', 6), 'Client', 'Forma de pagamento inválida');
});

console.log(`\n${ok} testes passaram.`);
