// resetar-banco.js - apaga o lanchonete.db; na próxima execução ele é recriado com os dados iniciais
// Rodar: node resetar-banco.js   (com o servidor parado)
const fs = require('fs');
const path = require('path');
const arquivo = path.resolve(process.env.DB_PATH || 'lanchonete.db');
for (const f of [arquivo, arquivo + '-wal', arquivo + '-shm', arquivo + '-journal']) {
  if (fs.existsSync(f)) { fs.unlinkSync(f); console.log('Removido:', f); }
}
console.log('Pronto. O banco será recriado no próximo `node servidor.js`.');
