var express = require("express");
var app = express();
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken')
var Usuario = require("../models/usuario");
var SEED = require('../config/config').SEED;



app.post('/', (req, res) => {

    var body = req.body;


    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            })
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Datos incorrectos - email',
                errors: err,
            })
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "Datos incorrectos - contraseña",
                    errors: err
                });
        }

        // ¡CREAR UN TOKEN!
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 600 })

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        })

    })


})

module.exports = app;