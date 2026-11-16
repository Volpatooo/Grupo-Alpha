// cliente.js - cliente do NOSSO servidor (rode `node servidor.js` antes)
const soap = require('soap');

const url = 'http://localhost:8000/lanchonete?wsdl';

// Executa uma chamada que DEVE falhar e imprime o SOAP Fault de forma legível.
async function provocarErro(titulo, chamada) {
  console.log('\n===== ERRO PROPOSITAL: ' + titulo + ' =====');
  try {
    await chamada();
    console.log('(nenhum erro - inesperado)');
  } catch (err) {
    const f = err.root && err.root.Envelope.Body.Fault;
    if (!f) return console.log('Erro que nao e Fault:', err.message);
    console.log('faultcode  :', f.faultcode);
    console.log('faultstring:', f.faultstring);
    console.log('detail     :', JSON.stringify(f.detail));
  }
}

async function main() {
  const client = await soap.createClientAsync(url);

  console.log('===== OPERACOES DISPONIVEIS (client.describe) =====');
  console.log(JSON.stringify(client.describe(), null, 2));

  // ---------- Componente Produto
  console.log('\n===== ListarCardapio =====');
  const [cardapio] = await client.ListarCardapioAsync({});
  console.log(JSON.stringify(cardapio, null, 2));

  console.log('\n===== ConsultarProduto (1) =====');
  const [prod] = await client.ConsultarProdutoAsync({ codigo: 1 });
  console.log(prod);

  // ---------- Componente Estoque
  console.log('\n===== ConsultarEstoque (1) =====');
  const [est] = await client.ConsultarEstoqueAsync({ codigoProduto: 1 });
  console.log(est);

  // ---------- Componente Cliente
  console.log('\n===== CadastrarCliente =====');
  const [novo] = await client.CadastrarClienteAsync({ nome: 'Ana Lima', telefone: '47988887777' });
  console.log(novo);

  console.log('\n===== ConsultarCliente =====');
  const [cli] = await client.ConsultarClienteAsync({ codigo: novo.codigo });
  console.log(cli);

  // ---------- Componente Pedido (2 X-Burger + 1 Batata + 2 Refrigerantes)
  console.log('\n===== CriarPedido =====');
  const [ped] = await client.CriarPedidoAsync({
    codigoCliente: novo.codigo,
    itens: {
      item: [
        { codigoProduto: 1, quantidade: 2 },
        { codigoProduto: 3, quantidade: 1 },
        { codigoProduto: 4, quantidade: 2 },
      ],
    },
  });
  console.log(JSON.stringify(ped, null, 2));

  console.log('\n===== ConsultarPedido =====');
  const [ped2] = await client.ConsultarPedidoAsync({ idPedido: ped.idPedido });
  console.log('Status:', ped2.status, '| Total:', ped2.total);

  // ---------- Componente Pagamento
  console.log('\n===== ProcessarPagamento (DINHEIRO, com troco) =====');
  const [pag] = await client.ProcessarPagamentoAsync({
    idPedido: ped.idPedido,
    formaPagamento: 'DINHEIRO',
    valor: 100,
  });
  console.log(pag);

  // ---------- SOAP Faults de propósito
  await provocarErro('produto inexistente (Client)', () =>
    client.ConsultarProdutoAsync({ codigo: 99 }));

  await provocarErro('cliente inexistente ao criar pedido (Client)', () =>
    client.CriarPedidoAsync({ codigoCliente: 999, itens: { item: [{ codigoProduto: 1, quantidade: 1 }] } }));

  await provocarErro('estoque insuficiente (Server)', () =>
    client.CriarPedidoAsync({ codigoCliente: 1, itens: { item: [{ codigoProduto: 6, quantidade: 999 }] } }));

  await provocarErro('pagamento em dinheiro com valor insuficiente (Client)', async () => {
    const [p] = await client.CriarPedidoAsync({
      codigoCliente: 2, itens: { item: [{ codigoProduto: 2, quantidade: 1 }] },
    });
    return client.ProcessarPagamentoAsync({ idPedido: p.idPedido, formaPagamento: 'DINHEIRO', valor: 5 });
  });

  await provocarErro('pagar o mesmo pedido duas vezes (Client)', () =>
    client.ProcessarPagamentoAsync({ idPedido: ped.idPedido, formaPagamento: 'PIX', valor: 1 }));

  await provocarErro('pagamento de pedido inexistente (Client)', () =>
    client.ProcessarPagamentoAsync({ idPedido: 12345, formaPagamento: 'PIX', valor: 10 }));
}

main().catch((err) => {
  console.error('Falha ao executar o cliente:', err.message);
});
