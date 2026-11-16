// ver-banco.js - mostra o conteúdo de todas as tabelas do banco
// Rodar: node ver-banco.js
const { db, caminho } = require('./db');

console.log('Banco:', caminho);
for (const t of ['produto', 'estoque', 'cliente', 'pedido', 'item_pedido', 'pagamento']) {
  console.log(`\n=== ${t} ===`);
  const linhas = db.prepare(`SELECT * FROM ${t}`).all().map((l) => ({ ...l }));
  linhas.length ? console.table(linhas) : console.log('(vazia)');
}
