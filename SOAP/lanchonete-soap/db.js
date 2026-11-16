// db.js - conexão e esquema do SQLite (arquivo lanchonete.db)
const path = require('path');
const Database = require('better-sqlite3');

// DB_PATH permite trocar o arquivo (os testes usam ':memory:' ou um arquivo temporário)
const arquivo = process.env.DB_PATH || 'lanchonete.db';
const db = new Database(arquivo);
const caminho = arquivo === ':memory:' ? arquivo : path.resolve(arquivo);

db.exec('PRAGMA foreign_keys = ON'); // faz o SQLite respeitar as chaves estrangeiras

// ---- Esquema: uma tabela por componente (Pedido tem também a tabela de itens)
db.exec(`
  CREATE TABLE IF NOT EXISTS produto (
    codigo         INTEGER PRIMARY KEY,
    nome           TEXT    NOT NULL,
    categoria      TEXT    NOT NULL CHECK (categoria IN ('LANCHE','BEBIDA','PORCAO')),
    preco_centavos INTEGER NOT NULL CHECK (preco_centavos >= 0)
  );

  -- Estoque DEPENDE de Produto: só existe estoque de produto cadastrado (FK)
  CREATE TABLE IF NOT EXISTS estoque (
    codigo_produto INTEGER PRIMARY KEY REFERENCES produto(codigo),
    quantidade     INTEGER NOT NULL CHECK (quantidade >= 0)
  );

  CREATE TABLE IF NOT EXISTS cliente (
    codigo   INTEGER PRIMARY KEY AUTOINCREMENT,
    nome     TEXT NOT NULL,
    telefone TEXT NOT NULL DEFAULT ''
  );

  -- Pedido REQUER Cliente (FK)
  CREATE TABLE IF NOT EXISTS pedido (
    id_pedido      INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_cliente INTEGER NOT NULL REFERENCES cliente(codigo),
    total_centavos INTEGER NOT NULL,
    status         TEXT    NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO'
                           CHECK (status IN ('AGUARDANDO_PAGAMENTO','PAGO')),
    criado_em      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );

  -- Pedido REQUER Produto (FK em cada item)
  CREATE TABLE IF NOT EXISTS item_pedido (
    id_item            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido          INTEGER NOT NULL REFERENCES pedido(id_pedido),
    codigo_produto     INTEGER NOT NULL REFERENCES produto(codigo),
    quantidade         INTEGER NOT NULL CHECK (quantidade > 0),
    subtotal_centavos  INTEGER NOT NULL
  );

  -- Pagamento DEPENDE de Pedido; UNIQUE = um pedido só pode ser pago uma vez
  CREATE TABLE IF NOT EXISTS pagamento (
    id_pagamento    INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido       INTEGER NOT NULL UNIQUE REFERENCES pedido(id_pedido),
    forma           TEXT    NOT NULL CHECK (forma IN ('DINHEIRO','PIX','CARTAO')),
    valor_centavos  INTEGER NOT NULL,
    troco_centavos  INTEGER NOT NULL DEFAULT 0,
    pago_em         TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );
`);

// ---- Dados iniciais (só na primeira execução, quando o banco está vazio)
if (db.prepare('SELECT COUNT(*) AS n FROM produto').get().n === 0) {
  const inserirProduto = db.prepare('INSERT INTO produto (codigo, nome, categoria, preco_centavos) VALUES (?, ?, ?, ?)');
  const inserirEstoque = db.prepare('INSERT INTO estoque (codigo_produto, quantidade) VALUES (?, ?)');
  const cardapio = [
    [1, 'X-Burger', 'LANCHE', 1800, 30],
    [2, 'X-Salada', 'LANCHE', 2000, 25],
    [3, 'Batata Frita', 'PORCAO', 1200, 40],
    [4, 'Refrigerante Lata', 'BEBIDA', 600, 60],
    [5, 'Suco Natural', 'BEBIDA', 900, 20],
    [6, 'Milk-Shake', 'BEBIDA', 1500, 15],
  ];
  for (const [codigo, nome, categoria, centavos, qtd] of cardapio) {
    inserirProduto.run(codigo, nome, categoria, centavos);
    inserirEstoque.run(codigo, qtd);
  }
  const inserirCliente = db.prepare('INSERT INTO cliente (nome, telefone) VALUES (?, ?)');
  inserirCliente.run('Maria Souza', '47999990001');
  inserirCliente.run('João Pereira', '47999990002');
}

// Transação: ou tudo é gravado, ou nada (ROLLBACK em caso de erro/Fault).
function transacao(fn) {
  db.exec('BEGIN');
  try {
    const resultado = fn();
    db.exec('COMMIT');
    return resultado;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

module.exports = { db, transacao, caminho };
