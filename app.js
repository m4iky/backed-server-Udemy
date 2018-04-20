// REQUIRES
var express = require('express');
var mongoose = require('mongoose')

// INICIALIZAR VARIABLES
var app = express()


// CONEXIÓN BASE DE DATOS
mongoose.connection.openUri("mongodb://localhost:27017/hospitalDB", (err, res) => {

    if (err) console.log('Error');

    console.log("Base de Datos: \x1b[32m%s\x1b[0m", "ONLINE");


});

// RUTAS
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    })

});

// ESCUCHAR PETICIONES
app.listen(3000, () => {
    console.log("Servidor Express corriendo en el puerto 300: \x1b[32m%s\x1b[0m", "ONLINE")
})