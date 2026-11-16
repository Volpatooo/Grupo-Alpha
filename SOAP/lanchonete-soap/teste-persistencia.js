// teste-persistencia.js - prova que os dados ficam gravados no arquivo .db
// (dois processos Node separados: o 2o enxerga o que o 1o gravou).
// Rodar: node teste-persistencia.js
const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const arquivo = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lanchonete-')), 'teste.db');
const env = { ...process.env, DB_PATH: arquivo };
const dir = __dirname.replace(/\\/g, '/');
const rodar = (codigo) =>
  execFileSync(process.execPath, ['-e', codigo], { env }).toString().trim();

// Processo 1: cadastra cliente, cria pedido e paga
const saida1 = rodar(`
  const cliente = require('${dir}/componentes/cliente');
  const pedido = require('${dir}/componentes/pedido');
  const pagamento = require('${dir}/componentes/pagamento');
  const c = cliente.cadastrar('Teste Persistencia', '47');
  const p = pedido.criar(c.codigo, { item: { codigoProduto: 1, quantidade: 3 } });
  pagamento.processar(p.idPedido, 'PIX', 54);
  console.log(JSON.stringify({ cliente: c.codigo, pedido: p.idPedido }));
`);
const ids = JSON.parse(saida1);

// Processo 2 (novo): lê tudo de volta do arquivo
const saida2 = rodar(`
  const pedido = require('${dir}/componentes/pedido');
  const estoque = require('${dir}/componentes/estoque');
  const cliente = require('${dir}/componentes/cliente');
  console.log(JSON.stringify({
    pedido: pedido.obter(${ids.pedido}),
    estoque: estoque.consultar(1).quantidade,
    cliente: cliente.obter(${ids.cliente}).nome,
  }));
`);
const r = JSON.parse(saida2);

assert.strictEqual(r.cliente, 'Teste Persistencia');
assert.strictEqual(r.pedido.status, 'PAGO');
assert.strictEqual(r.pedido.total, '54.00');
assert.strictEqual(r.estoque, 27); // 30 - 3, e continua assim no processo novo
console.log('ok - cliente, pedido pago e baixa de estoque continuam gravados apos reiniciar');
fs.rmSync(path.dirname(arquivo), { recursive: true, force: true });
