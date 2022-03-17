const express = require("express");
const server = express();
const routes = require("./routes");

// Usando template engine
server.set("view engine", "ejs");

// Habilita os arquivos statics
server.use(express.static("public"));

// Liberar a utilização do req.body
server.use(express.urlencoded({ extended:true }))

//Rotas
server.use(routes);

/* Propriedade do express para ligar o servidor. Ela recebe a porta
 *  (onde é verificado se essa porta esta disponível) e uma função.
 */
server.listen(3000, () => console.log("Rodando"));
