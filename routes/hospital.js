var express = require("express");
var app = express();
var Hospital = require("../models/hospital");
var mdaut = require("../middlewares/autenticacion");

//==============================================================
// TRAER TODOS LOS HOSPITALES 
//==============================================================

app.get('/', (req, res) => {
        var desde = req.query.desde || 0;
        desde = Number(desde);

        Hospital.find({})
            .skip(desde)
            .limit(5)
            .populate("usuario", "nombre email")
            .exec((err, hospitales) => {
                if (err) {
                    return res.status(500).json({ ok: false, error: err });
                }

                Hospital.count({}, (err, cont) => {
                    res
                        .status(200)
                        .json({
                            total: cont,
                            ok: true,
                            hospitales: hospitales
                        });
                });
            });


    })
    //FIN TRAER HOSPITALES



//==============================================================
// CREAR HOSPITALES 
//==============================================================
app.post('/', mdaut.verificarToken, (req, res) => {

        var body = req.body;
        var hospital = new Hospital({
            nombre: body.nombre,
            img: body.img,
            usuario: body.usuario
        })
        hospital.usuario = req.usuario
        hospital.save((err, hospitalG) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                })
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalG
            })
        })

    })
    // FIN CREAR HOSPITALES


//==============================================================
// MODIFICAR HOSPITALES 
//==============================================================
app.put("/:id", mdaut.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                error: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un usuario con el ID especificado",
                error: err
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario
        hospital.save((err, hospitalG) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar hospital",
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalG
            });
        });
    });
});
//FIN MODIFICAR HOSPITALES



//==============================================================
// ELIMINAR HOSPITAL 
//==============================================================
app.delete("/:id", mdaut.verificarToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al eliminar hospital",
                errors: err
            });
        }
        res.status(200).json({ ok: true, hospitalBorrado: hospB });
    });
});
//FIN ELIMINAR HOSPITAL


module.exports = app;