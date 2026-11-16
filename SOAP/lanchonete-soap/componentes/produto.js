// Fornece: o cardápio e os dados de cada produto
const { db } = require('../db');
const { ErroNegocio, inteiro, formatar } = require('./erro');

const SELECT = 'SELECT codigo, nome, categoria, preco_centavos AS centavos FROM produto';
const visao = (p) => ({ codigo: p.codigo, nome: p.nome, categoria: p.categoria, preco: formatar(p.centavos) });

// Uso interno dos outros componentes (Estoque e Pedido dependem disto)
function buscar(codigo) {
  const n = inteiro(codigo, 'codigo');
  const p = db.prepare(SELECT + ' WHERE codigo = ?').get(n);
  if (!p) throw new ErroNegocio('Client', 'Produto não encontrado', `codigo=${codigo}`);
  return p;
}

const obter = (codigo) => visao(buscar(codigo));
const listar = () => db.prepare(SELECT + ' ORDER BY codigo').all().map(visao);

module.exports = { buscar, obter, listar };
