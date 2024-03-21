CREATE DATABASE recetas_db;
USE recetas_db;
CREATE TABLE recetas(
    id INT auto_increment primary key,
    nombre VARCHAR(30) not null,
    ingredientes VARCHAR(250) not null,
    instrucciones text
    );