var express = require("express");
var app = express();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var Usuario = require('../models/usuario')
var mdaut = require('../middlewares/autenticacion');

//==============================================================
// OBTENER TODOS LOS USUARIOS
//==============================================================


app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'role img email nombre id')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "¡Error al traer usuarios!",
                    errors: err
                });
            }
            Usuario.count({}, (err, cont) => {

                res.status(200).json({
                    total: cont,
                    ok: true,
                    usuarios: usuarios
                });
            })


        })

});



//==============================================================
//  Crear un nuevo Usuario
//==============================================================

app.post('/', mdaut.verificarToken, (req, res) => {

    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioG) => {

        if (err) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "¡Error al registrar usuario!",
                    errors: err
                });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioG,
            usuariot: req.usuario
        });



    })

});
// FIN GUARDAR USUARIO


//==============================================================
// Modificar usuario 
//==============================================================

app.put("/:id", mdaut.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "¡Error al buscar usuarios!",
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "¡No existe un usuario con ese id!",
                errors: err
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioG) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "¡Error al actualizar usuario!",
                    errors: err
                });
            }
            usuarioG.password = ":D";
            res.status(200).json({
                ok: true,
                usuario: usuarioG
            });
        });
    });
});
//FIN MODIFICAR

//==============================================================
// Eliminar usuario 
//==============================================================

app.delete('/:id', mdaut.verificarToken, (req, res) => {

    var id = req.params.id


    Usuario.findByIdAndRemove(id, (err, usuB) => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "¡Error al eliminar usuario!",
                    errors: err
                });
        }
        res.status(200).json({ ok: true, usuario: usuB });


    })
})

// FIN ELIMINAR


module.exports = app;