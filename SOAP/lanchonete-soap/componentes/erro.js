// Erro de negócio -> o servidor converte em SOAP Fault
// tipo: 'Client' (culpa do chamador: dado inválido) ou 'Server' (problema do lado do serviço)
class ErroNegocio extends Error {
  constructor(tipo, mensagem, detalhe) {
    super(mensagem);
    this.tipo = tipo;
    this.detalhe = detalhe || '';
  }
}

// Converte o valor recebido (que pode vir como texto do XML) em inteiro, ou gera Fault
function inteiro(valor, campo) {
  const n = Number(valor);
  if (valor === undefined || valor === null || valor === '' || !Number.isInteger(n)) {
    throw new ErroNegocio('Client', `Campo '${campo}' deve ser um número inteiro`, `${campo}=${valor}`);
  }
  return n;
}

// Dinheiro: trabalhamos em centavos (inteiros) para evitar erro de ponto flutuante
const emCentavos = (valor) => Math.round(Number(valor) * 100);
const formatar = (centavos) => (centavos / 100).toFixed(2);

module.exports = { ErroNegocio, inteiro, emCentavos, formatar };
