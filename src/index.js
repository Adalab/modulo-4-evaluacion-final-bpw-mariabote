const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const server = express();
server.use(cors());
server.use(express.json({ limit: "25mb" }));
server.set("view engine", "ejs");
const port = 3000;

server.listen(port, () => {
  console.log(`Example server listening on port ${port}`);
});

server.get("/", function (req, res) {
  res.send("Hola, estas son las mejores recetas");
});

//Crear conexion MySQL
async function getConnection() {
  console.log({
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_SCHEMA,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
  });
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_SCHEMA,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
  });

  await connection.connect();

  console.log(
    `Conexión establecida con la base de datos (identificador=${connection.threadId})`
  );

  return connection;
}
// Definir los endpoints

server.get(`/api/recetas`, async function (req, res) {
  // Conectar con la bbdd

  const conn = await getConnection(); // async   Dev conn

  // Mandarle el SELECT  -> result
  const queryGetRecipes = `SELECT * FROM recetas`;

  const [results] = await conn.query(queryGetRecipes); //  async  Dev result

  // Recuperar datos
  console.log(results);

  // Cerrar la conexion

  conn.end();

  // Enviar los resultos

  //res.send(results);
  //res.sendFile('/uploads/' + uid + '/' + file);
  res.json({
    success: true,
    info: { count: results.length }, // número de elementos
    results: results, // listado });
  });
});
