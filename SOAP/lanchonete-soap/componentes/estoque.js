// Depende de Produto: só existe estoque de produtos cadastrados
const { db } = require('../db');
const { ErroNegocio, inteiro } = require('./erro');
const produto = require('./produto');

function quantidadeDe(codigo) {
  const p = produto.buscar(codigo); // falha com Fault se o produto não está cadastrado
  const linha = db.prepare('SELECT quantidade FROM estoque WHERE codigo_produto = ?').get(p.codigo);
  return linha ? linha.quantidade : 0;
}

function consultar(codigo) {
  const p = produto.buscar(codigo);
  const quantidade = quantidadeDe(p.codigo);
  return { codigoProduto: p.codigo, nome: p.nome, quantidade, disponivel: quantidade > 0 };
}

// Baixa atômica: o UPDATE só acontece se ainda houver saldo (evita estoque negativo)
function baixar(codigo, qtd) {
  const p = produto.buscar(codigo);
  const q = inteiro(qtd, 'quantidade');
  const r = db
    .prepare('UPDATE estoque SET quantidade = quantidade - ? WHERE codigo_produto = ? AND quantidade >= ?')
    .run(q, p.codigo, q);
  if (r.changes === 0) {
    throw new ErroNegocio('Server', 'Estoque insuficiente',
      `produto=${p.nome}; disponivel=${quantidadeDe(p.codigo)}; solicitado=${q}`);
  }
}

module.exports = { quantidadeDe, consultar, baixar };
