var express = require("express");
var app = express();
var Medico = require("../models/medico");
var mdaut = require("../middlewares/autenticacion");

//==============================================================
// MOSTRAR MEDICOS 
//==============================================================
app.get('/', (req, res) => {
        var desde = req.query.desde || 0;
        desde = Number(desde);
        Medico.find({})
            .skip(desde)
            .limit(5)
            .populate("usuario", "nombre email")
            .populate("hospital")
            .exec((err, medicos) => {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            ok: false,
                            mensaje: "¡Error al traer médicos!",
                            erros: err
                        });
                }

                Medico.count({}, (err, cont) => {
                    res
                        .status(200)
                        .json({
                            total: cont,
                            ok: true,
                            Médicos: medicos
                        });
                });
            });

    })
    //FIN MOSTRAR MEDICOS

app.post("/", mdaut.verificarToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
        hospital: body.hospital
    });
    medico.usuario = req.usuario;
    medico.save((err, medicoG) => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    errors: err,
                    body: medico
                });
        }

        res
            .status(201)
            .json({
                ok: true,
                medico: medicoG
            });

    })
});

app.put("/:id", mdaut.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    errors: err,
                });
        }

        medico.nombre = body.nombre
        medico.usuario = req.usuario
        medico.hospital = body.hospital

        medico.save((err, medicoG) => {
            if (err) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Error al actualizar médico",
                        errors: err,
                    });
            }
            res.status(200).json({ ok: true, NewMedico: medicoG })
        })
    })
});
//FIN MODIFICAR MÉDICO

//==============================================================
// ELIMINAR UN MÉDICO 
//==============================================================
app.delete("/:id", mdaut.verificarToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                errors: err
            });
        }
        res.status(200).json({ ok: true, medico: medicoB });
    });
});
// FIN ELIMINAR MEDICO

module.exports = app;