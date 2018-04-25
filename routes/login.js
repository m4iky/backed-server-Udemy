var express = require("express");
var app = express();
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken')
var Usuario = require("../models/usuario");
var SEED = require('../config/config').SEED;

// GOOGLE
var CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);


async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload["sub"];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

//==============================================================
// LOGIN CON GOOGLE 
//==============================================================
app.post('/google', async(req, res) => {

    var token = req.body.token
    var googleUser = await verify(token).catch(e => {

        return res.status(403).json({
            ok: false,
            mensaje: 'Token no válido.',
        })
    })

    Usuario.findOne({ email: googleUser.email }, (err, usu) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            })
        }

        if (usu) {
            if (usu.google === false) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Debe usar su autenticación normal",
                    });
            } else {
                // ¡CREAR UN TOKEN!
                var token = jwt.sign({ usuario: usu }, SEED, { expiresIn: 6000 });

                res.status(200).json({
                    ok: true,
                    usuario: usu,
                    token: token,

                });
            }
        } else {
            // ¡Usuario no existe, hay que crearlo!
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':D';


            usuario.save((err, usuarioG) => {
                // ¡CREAR UN TOKEN!
                var token = jwt.sign({ usuario: usu }, SEED, { expiresIn: 6000 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioG,
                    token: token,
                });
            })
        }
    })



})

//==============================================================
// LOGIN NORMAL 
//==============================================================
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
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 6000 })

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        })

    })


})

module.exports = app;