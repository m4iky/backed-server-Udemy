var express = require("express");
var app = express();
var fs = require('fs');
var fileUpload = require("express-fileupload");



var Medico = require("../models/medico");
var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");


app.use(fileUpload());


app.put("/:tipo/:id", (req, res, next) => {
    var tipo = req.params.tipo
    var id = req.params.id;

    var tipoValidos = ['hospitales', 'usuarios', 'medicos'];

    if (tipoValidos.indexOf(tipo) < 0) {
        return res
            .status(400)
            .json({
                ok: false,
                mensaje: "Ruta de almacenamiento incorrecta.",
                errors: {
                    message: "Las colleciones para imágenes son: " +
                        tipoValidos.join(", ")
                }
            });
    }


    if (!req.files) {
        return res
            .status(400)
            .json({
                ok: false,
                mensaje: "Ningún archivo fue seleccionado.",
                errors: { message: "Debe seleccionar un archivo para subir." }
            });
    }
    // Obtener extensión del archivo
    var archivo = req.files.imagen;
    var archivoSplit = archivo.name.split('.');
    var exten = archivoSplit[archivoSplit.length - 1];

    // Extensiones permitidas
    var extensiones = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensiones.indexOf(exten) < 0) {
        return res
            .status(400)
            .json({
                ok: false,
                mensaje: "Formato de imagen incorrecto.",
                errors: {
                    message: "Seleccione una imagen que posea alguno de los formatos: " + extensiones.join(', ')
                }
            });
    }

    // Nombre para el archivo
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${exten}`;

    //Mover el archivo
    var path = `./uploads/${tipo}/${nombreArchivo}`

    archivo.mv(path, err => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al mover el archivo.",
                    errors: {
                        message: "No se pudo mover el archivo."
                    }
                });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // return res
        //     .status(200)
        //     .json({
        //         ok: true,
        //         formato: exten,
        //         mensaje: `Petición correcta.`,
        //     });

    })


});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Usuario no existe",
                    errors: { message: 'El usuario no existe' }
                })
            }

            if (err) {
                return res.status(500).json({ ok: false, errors: err });
            }

            var pathViejo = `./uploads/usuarios/${usuario.img}`;
            // Si existe, eliminar imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usu) => {
                if (err) {
                    return res
                        .status(
                            500
                        )
                        .json({
                            ok: false,
                            mensaje: "Error al actualizar imagen.",
                            errors: {
                                message: "El usuario ya no posee una imagen."
                            }
                        });
                }
                usu.password = ":D";
                return res
                    .status(200)
                    .json({
                        ok: true,
                        mensaje: `Imagen de usuario actualizada.`,
                        usuario: usu
                    });
            })
        })
    }

    if (tipo === "hospitales") {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Hospital no existe",
                        errors: { message: "El hospital no existe" }
                    });
            }

            if (err) {
                return res.status(500).json({ ok: false, errors: err })
            }
            var pathViejo = `./uploads/hospitales/${hospital.img}`;
            // Eliminar si existe una imagen para ese hospital
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo)
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hosp) => {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            ok: false,
                            mensaje: "Error al actualizar imagen del hospital.",
                            errors: {
                                message: "El hospital ya no posee una imagen."
                            }
                        });
                }

                return res
                    .status(200)
                    .json({
                        ok: true,
                        mensaje: `Imagen de hospital actualizada.`,
                        hospital: hosp
                    });
            })

        })
    }

    if (tipo === "medicos") {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "Médico no existe",
                        errors: { message: "El médico no existe" }
                    });
            }

            if (err) {
                return res
                    .status(500)
                    .json({ ok: false, errors: err });
            }
            var pathViejo = `./uploads/medicos/${medico.img}`;
            //Validar si esxiste
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo)
            }
            medico.img = nombreArchivo
            medico.save((err, med) => {
                if (err) {
                    return res
                        .status(500)
                        .json({
                            ok: false,
                            mensaje: "Error al actualizar imagen del médico.",
                            errors: {
                                message: "El médico ya no posee una imagen."
                            }
                        });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada.',
                    medico: med
                })
            })

        })
    }

}

module.exports = app;