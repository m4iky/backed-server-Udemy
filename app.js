// REQUIRES
var express = require('express');
var mongoose = require('mongoose')
var bodyParser = require("body-parser");

// INICIALIZAR VARIABLES
var app = express();


// Body Parse

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())



// CONEXIÓN BASE DE DATOS
mongoose.connection.openUri("mongodb://localhost:27017/hospitalDB", (err, res) => {

    if (err) console.log('Error');

    console.log("Base de Datos: \x1b[32m%s\x1b[0m", "ONLINE");


});
// SERVER INDEX CONFIG
// var serveIndex = require("serve-index");
// app.use(express.static(__dirname + "/"));
// app.use("/uploads", serveIndex(__dirname + "/uploads"));

// IMPORTAR RUTAS
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require("./routes/login");
var hospitalRoutes = require("./routes/hospital");
var medicoRoutes = require("./routes/medico");
var busquedaRoutes = require("./routes/busqueda");
var uploadRoutes = require("./routes/upload");
var imagenesRoutes = require("./routes/imagenes");






// RUTAS
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use("/medico", medicoRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/img", imagenesRoutes);





app.use('/login', loginRoutes);

app.use('/', appRoutes);


// ESCUCHAR PETICIONES
app.listen(3000, () => {
    console.log("Servidor Express corriendo en el puerto 3000: \x1b[32m%s\x1b[0m", "ONLINE")
})