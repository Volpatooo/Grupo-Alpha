# Lanchonete - Web Service SOAP + SQLite (Web II)

Serviço SOAP em Node.js que implementa o **diagrama de componentes** da lanchonete,
com os dados gravados em um banco **SQLite** (`lanchonete.db`, criado sozinho na primeira execução, na pasta de onde você roda os comandos).

## Requisitos
- Node.js (versão LTS) e npm.
- Banco acessado com **better-sqlite3**, como em aula: `const db = new Database("lanchonete.db")` (em `db.js`).

## Como rodar
```bash
npm install            # instala soap e better-sqlite3
npm test                # testa componentes + SQLite + persistência (sem SOAP, banco temporário)
npm run servidor        # terminal 1 -> http://localhost:8000/lanchonete?wsdl
npm run cliente         # terminal 2 -> todas as operações + 6 SOAP Faults
npm run ver-banco       # mostra o conteúdo de todas as tabelas 
npm run resetar-banco   # (servidor parado) apaga o .db; é recriado com os dados iniciais
npm run publico         # WSDL público (CountryInfoService) + client.describe()
```
Como os dados persistem, o estoque diminui a cada `npm run cliente`; use `resetar-banco` para voltar ao início.

## Banco de dados (uma tabela por componente)
| Componente | Tabela | Observação |
|---|---|---|
| Produto   | `produto`     | cardápio; preço em centavos |
| Estoque   | `estoque`     | FK -> `produto` (Estoque depende de Produto); `CHECK quantidade >= 0` |
| Cliente   | `cliente`     | código autoincremental |
| Pedido    | `pedido`, `item_pedido` | FK -> `cliente` e -> `produto` (Pedido requer ambos) |
| Pagamento | `pagamento`   | FK `UNIQUE` -> `pedido` (um pagamento por pedido; depende de Pedido) |

- **Transações** (`transacao()` em `db.js`): `CriarPedido` baixa o estoque e grava pedido + itens de uma vez;
  se faltar estoque de qualquer item, o ROLLBACK desfaz tudo. `ProcessarPagamento` grava o pagamento
  e marca o pedido como PAGO juntos.
- **Baixa de estoque atômica:** `UPDATE ... WHERE quantidade >= ?` impede estoque negativo.
- O WSDL e as operações SOAP **não mudaram**: só a camada de dados dos componentes foi trocada.

## Diagrama -> código
| Componente do diagrama | Arquivo | Operações SOAP |
|---|---|---|
| Produto   | `componentes/produto.js`   | `ListarCardapio`, `ConsultarProduto` |
| Estoque   | `componentes/estoque.js`   | `ConsultarEstoque` |
| Cliente   | `componentes/cliente.js`   | `CadastrarCliente`, `ConsultarCliente` |
| Pedido    | `componentes/pedido.js`    | `CriarPedido`, `ConsultarPedido` |
| Pagamento | `componentes/pagamento.js` | `ProcessarPagamento` |

| Relação no diagrama | Como aparece no código |
|---|---|
| Pedido **requer** Cliente / Produto / Estoque | `pedido.js` chama `cliente.obter()`, `produto.buscar()`, `estoque.baixar()` |
| Estoque **depende** dos Produtos cadastrados  | `estoque.js` chama `produto.buscar()` + FK no banco |
| Pagamento **depende** da existência de Pedido | `pagamento.js` chama `pedido.buscar()` / `pedido.marcarPago()` + FK no banco |
