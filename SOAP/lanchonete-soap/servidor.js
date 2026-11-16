// servidor.js - Web Service SOAP da Lanchonete
// Cada operação delega para o componente correspondente (pasta componentes/).
const soap = require('soap');
const http = require('http');
const fs = require('fs');

const produto = require('./componentes/produto');
const estoque = require('./componentes/estoque');
const cliente = require('./componentes/cliente');
const pedido = require('./componentes/pedido');
const pagamento = require('./componentes/pagamento');
const { ErroNegocio } = require('./componentes/erro');
const { caminho } = require('./db'); // abre/cria o banco SQLite

// Converte qualquer erro de negócio em SOAP Fault (SOAP 1.1: faultcode/faultstring/detail)
function comFault(fn) {
  return function (args) {
    try {
      return fn(args || {});
    } catch (e) {
      if (e instanceof ErroNegocio) {
        throw {
          Fault: {
            faultcode: 'soap:' + e.tipo,
            faultstring: e.message,
            detail: { erro: e.detalhe },
          },
        };
      }
      console.error('Erro inesperado:', e);
      throw {
        Fault: { faultcode: 'soap:Server', faultstring: 'Erro interno do servidor', detail: { erro: e.message } },
      };
    }
  };
}

// Estrutura service -> port -> operação (idêntica ao WSDL)
const service = {
  LanchoneteService: {
    LanchonetePort: {
      // ---- Componente Produto
      ListarCardapio: comFault(() => ({ produto: produto.listar() })),
      ConsultarProduto: comFault((a) => produto.obter(a.codigo)),

      // ---- Componente Estoque
      ConsultarEstoque: comFault((a) => estoque.consultar(a.codigoProduto)),

      // ---- Componente Cliente
      CadastrarCliente: comFault((a) => cliente.cadastrar(a.nome, a.telefone)),
      ConsultarCliente: comFault((a) => cliente.obter(a.codigo)),

      // ---- Componente Pedido
      CriarPedido: comFault((a) => pedido.criar(a.codigoCliente, a.itens)),
      ConsultarPedido: comFault((a) => pedido.obter(a.idPedido)),

      // ---- Componente Pagamento
      ProcessarPagamento: comFault((a) => pagamento.processar(a.idPedido, a.formaPagamento, a.valor)),
    },
  },
};

const xml = fs.readFileSync(__dirname + '/lanchonete.wsdl', 'utf8');

const server = http.createServer((req, res) => {
  res.end('Servico SOAP da Lanchonete no ar');
});

server.listen(8000, () => {
  const s = soap.listen(server, '/lanchonete', service, xml);

  // Mostra o XML recebido/enviado (útil para estudar e para os prints)
  s.log = (tipo, dados) => {
    if (tipo === 'received' || tipo === 'replied') {
      console.log(`\n--- ${tipo.toUpperCase()} ---\n${dados}`);
    }
  };

  console.log('Servidor SOAP da Lanchonete rodando.');
  console.log('Banco SQLite:', caminho);
  console.log('WSDL disponivel em: http://localhost:8000/lanchonete?wsdl');
});
