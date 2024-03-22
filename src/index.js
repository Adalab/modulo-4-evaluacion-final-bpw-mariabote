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
// Obtener todas las recetas
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
  res.json({
    success: true,
    info: { count: results.length }, // número de elementos
    results: results, // listado });
  });
});

//Obtener una receta por su ID
server.get(`/api/recetas/:id`, async function (req, res) {
  let conn; // Definir la variable de conexión fuera del bloque try
  try {
    // Conectar con la base de datos
    conn = await getConnection(); // async   Dev conn

    // Obtener el ID de la receta desde los parámetros de la URL
    const recetaId = req.params.id;

    // Consultar la base de datos para obtener la receta con el ID especificado
    const queryGetRecipeById = `SELECT * FROM recetas WHERE id = ?`;
    const [results] = await conn.query(queryGetRecipeById, [recetaId]); //  async  Dev result

    // Verificar si se encontró la receta
    if (results.length === 0) {
      // Si no se encontró la receta, enviar una respuesta de error
      return res
        .status(404)
        .json({ success: false, message: "Receta no encontrada" });
    }

    // Si se encontró la receta, enviarla en la respuesta
    res.json({
      success: true,
      result: results[0], // Devuelve solo la primera receta encontrada
    });
  } catch (error) {
    // Manejar errores
    console.error("Error al obtener la receta por ID:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener la receta por ID" });
  } finally {
    // Cerrar la conexión a la base de datos
    conn.end();
  }
});

// Crear una nueva receta (POST /api/recetas)
server.post(`/api/recetas`, async function (req, res) {
  let conn; // Definir la variable de conexión fuera del bloque try
  try {
    // Obtener los datos de la receta desde el cuerpo de la solicitud
    const { nombre, ingredientes, instrucciones } = req.body;

    // Validar que se hayan proporcionado todos los campos necesarios
    if (!nombre || !ingredientes || !instrucciones) {
      return res.json({
        success: false,
        message: "Faltan campos obligatorios",
      });
    }

    // Conectar con la base de datos
    conn = await getConnection(); // async   Dev conn

    // Insertar la nueva receta en la base de datos
    const queryInsertRecipe = `INSERT INTO recetas (nombre, ingredientes, instrucciones) VALUES (?, ?, ?)`;
    const [result] = await conn.query(queryInsertRecipe, [
      nombre,
      ingredientes,
      instrucciones,
    ]); //  async  Dev result

    // Verificar si la inserción fue exitosa y obtener el ID de la nueva fila
    if (result.affectedRows === 1) {
      const nuevoId = result.insertId;
      // Enviar la respuesta con éxito y el ID de la nueva fila
      res.json({ success: true, id: nuevoId });
    } else {
      // Enviar un mensaje de error si la inserción falló
      res.json({ success: false, message: "Error al insertar la receta" });
    }
  } catch (error) {
    // Manejar errores
    console.error("Error al insertar la receta:", error);
    res.json({ success: false, message: "Error al insertar la receta" });
  } finally {
    // Cerrar la conexión a la base de datos si está definida y abierta
    if (conn) {
      conn.end();
    }
  }
});

// Actualizar una receta existente (PUT /api/recetas/:id)
server.put(`/api/recetas/:id`, async function (req, res) {
  // let receta;
  // try {
  //   // Obtener el ID de la receta desde los parámetros de la URL
  //   const recetaId = req.params.id;

  //   // Conectar con la base de datos
  //   const conn = await getConnection(); // async   Dev conn

  //   // Consultar la base de datos para obtener la receta con el ID especificado
  //   const queryGetRecipeById = `SELECT * FROM recetas WHERE id = ?`;
  //   const [results] = await conn.query(queryGetRecipeById, [recetaId]); //  async  Dev result

  //   // Verificar si se encontró la receta
  //   if (results.length === 0) {
  //     // Si no se encontró la receta, enviar una respuesta de error
  //     return res
  //       .status(404)
  //       .json({ success: false, message: "Receta no encontrada" });
  //   }
  //   receta = results[0];
  //   // Si se encontró la receta, enviarla en la respuesta
  //   // res.json({
  //   //   success: true,
  //   //   result: results[0], // Devuelve solo la primera receta encontrada
  //   // });
  // } catch (error) {
  //   // Manejar errores
  //   console.error("Error al obtener la receta por ID:", error);
  //   res
  //     .status(500)
  //     .json({ success: false, message: "Error al obtener la receta por ID" });
  // } finally {
  //   // Cerrar la conexión a la base de datos
  //   conn.end();
  // }
  let conn; // Definir la variable de conexión fuera del bloque try
  try {
    const recetaId = req.params.id;

    // Obtener los datos de la receta desde el cuerpo de la solicitud
    const { nombre, ingredientes, instrucciones } = req.body;

    // Validar que se hayan proporcionado todos los campos necesarios
    if (!nombre || !ingredientes || !instrucciones) {
      return res.json({
        success: false,
        message: "Faltan campos obligatorios",
      });
    }

    // Conectar con la base de datos
    conn = await getConnection(); // async   Dev conn

    // Insertar la nueva receta en la base de datos
    const queryInsertRecipe = `UPDATE recetas SET nombre = ?, ingredientes = ?, instrucciones = ? WHERE id = ?`;
    const [result] = await conn.query(queryInsertRecipe, [
      nombre,
      ingredientes,
      instrucciones,
      recetaId,
    ]); //  async  Dev result

    // Verificar si la inserción fue exitosa y obtener el ID de la nueva fila
    if (result.affectedRows === 1) {
      const nuevoId = result.insertId;
      // Enviar la respuesta con éxito y el ID de la nueva fila
      res.json({ success: true });
    } else {
      // Enviar un mensaje de error si la inserción falló
      res.json({ success: false, message: "Error al modificar la receta" });
    }
  } catch (error) {
    // Manejar errores
    console.error("Error al modificar la receta:", error);
    res.json({ success: false, message: "Error al modificar la receta" });
  } finally {
    // Cerrar la conexión a la base de datos si está definida y abierta
    if (conn) {
      conn.end();
    }
  }
});

// Eliminar una receta (DELETE /api/recetas/:id
server.delete(`/api/recetas/:id`, async function (req, res) {
  let conn; // Definir la variable de conexión fuera del bloque try
  try {
    const recetaId = req.params.id;

    // Conectar con la base de datos
    conn = await getConnection(); // async   Dev conn

    // Insertar la nueva receta en la base de datos
    const queryInsertRecipe = `DELETE FROM recetas WHERE id = ?`;
    const [result] = await conn.query(queryInsertRecipe, [recetaId]); //  async  Dev result

    // Verificar si la inserción fue exitosa y obtener el ID de la nueva fila
    if (result.affectedRows === 1) {
      // Enviar la respuesta con éxito y el ID de la nueva fila
      res.json({ success: true });
    } else {
      // Enviar un mensaje de error si la inserción falló
      res.json({ success: false, message: "Error al borrar la receta" });
    }
  } catch (error) {
    // Manejar errores
    console.error("Error al borrar la receta:", error);
    res.json({ success: false, message: "Error al borrar la receta" });
  } finally {
    // Cerrar la conexión a la base de datos si está definida y abierta
    if (conn) {
      conn.end();
    }
  }
});
