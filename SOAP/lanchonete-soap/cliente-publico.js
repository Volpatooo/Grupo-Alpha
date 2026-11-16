// cliente-publico.js
// Cliente de um serviço SOAP público (CountryInfoService, informações de países):
// lê o WSDL, lista as operações com describe() e chama algumas delas.
//
// Rodar: node cliente-publico.js
const soap = require('soap');

const url =
  'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL';

async function main() {
  const client = await soap.createClientAsync(url);

  // Explorando o WSDL: serviço -> porta -> operações -> parâmetros
  console.log('===== client.describe() =====');
  console.log(JSON.stringify(client.describe(), null, 2));

  console.log('\n===== CapitalCity (BR) =====');
  const [capital] = await client.CapitalCityAsync({ sCountryISOCode: 'BR' });
  console.log(capital);

  console.log('\n===== CountryName (BR) =====');
  const [nome] = await client.CountryNameAsync({ sCountryISOCode: 'BR' });
  console.log(nome);

  console.log('\n===== CountryCurrency (BR) =====');
  const [moeda] = await client.CountryCurrencyAsync({ sCountryISOCode: 'BR' });
  console.log(JSON.stringify(moeda));
}

main().catch((err) => {
  console.error('Falha ao consumir o servico publico:', err.message);
  console.error('Se o servico estiver fora do ar, troque a constante `url` por outro WSDL publico.');
});
