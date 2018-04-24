var express = require("express");
var app = express();

var Hospital = require('../models/hospital');
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

//==============================================================
// BÚSQUEDA POR COLECCIÓN 
//==============================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda
    var exp = new RegExp(busqueda, "i");
    var tabla = req.params.tabla

    var promesa;

    switch (tabla) {
        case "usuarios":
            promesa = buscarUsuarios(busqueda, exp);
            break;
        case "hospitales":
            promesa = buscarHospitales(busqueda, exp);
            break;
        case "medicos":
            promesa = buscarMedicos(busqueda, exp);
            break;
        default:
            return res.status(400).json({ ok: false, mensaje: 'Parámetros de búsqueda incorrectos' })
    }

    promesa.then(respuestas => {
        res.status(200).json({
            ok: true,
            [tabla]: respuestas
        })
    })


});
//FIN BUSCAR COLECCIÓN

//==============================================================
// BUSCAR TODO 
//==============================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda
    var exp = new RegExp(busqueda, 'i')

    Promise.all([
        buscarHospitales(busqueda, exp),
        buscarMedicos(busqueda, exp),
        buscarUsuarios(busqueda, exp)
    ]).then(respuestas => {
        res
            .status(200)
            .json({
                ok: true,
                hospitales: respuestas[0],
                médicos: respuestas[1],
                usuarios: respuestas[2]
            });
    });


});


function buscarHospitales(busqueda, exp) {
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: exp })
            .populate("usuario", "nombre")
            .exec((err, hospitales) => {
                if (err) {
                    reject("Error al traer hospitales", err);
                } else {
                    resolve(hospitales);
                }
            });
    });

}

function buscarMedicos(busqueda, exp) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: exp }).populate('usuario', 'nombre')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {
                if (err) {
                    reject("Error al traer médicos", err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, exp) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email').or([{ 'nombre': exp }, { 'email': exp }])
            .exec((err, usuarios) => {
                if (err) {
                    reject("Error al traer usuarios", err);
                } else {
                    resolve(usuarios);
                }
            })
    })
}

module.exports = app;