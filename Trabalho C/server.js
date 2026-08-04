const express = require('express');

const app = express();

app.get("/",(req,res)=>res.send('olá'));

app.listen(3000, () => {
    console.log("Servidor conectado e funcionando!");
});