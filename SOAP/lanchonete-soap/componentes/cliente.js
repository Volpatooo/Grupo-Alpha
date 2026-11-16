// Fornece: cadastro e consulta de clientes (tabela `cliente`)
const { db } = require('../db');
const { ErroNegocio, inteiro } = require('./erro');

function cadastrar(nome, telefone) {
  if (typeof nome !== 'string' || nome.trim().length < 2) {
    throw new ErroNegocio('Client', 'Nome inválido', `nome=${nome}`);
  }
  const r = db
    .prepare('INSERT INTO cliente (nome, telefone) VALUES (?, ?)')
    .run(nome.trim(), String(telefone || ''));
  return obter(Number(r.lastInsertRowid));
}

function obter(codigo) {
  const n = inteiro(codigo, 'codigo');
  const c = db.prepare('SELECT codigo, nome, telefone FROM cliente WHERE codigo = ?').get(n);
  if (!c) throw new ErroNegocio('Client', 'Cliente não encontrado', `codigo=${codigo}`);
  return { codigo: c.codigo, nome: c.nome, telefone: c.telefone };
}

module.exports = { cadastrar, obter };
