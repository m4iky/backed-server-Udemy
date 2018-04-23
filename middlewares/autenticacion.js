var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;


//==============================================================
// Modificar Token 
//==============================================================
exports.verificarToken = function(req, res, next) {


    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res
                .status(401)
                .json({
                    ok: false,
                    mensaje: "¡Error en el Token!",
                    errors: err
                });
        }

        req.usuario = decoded.usuario;

        // return res
        //     .status(200)
        //     .json({
        //         ok: true,
        //         coded: decoded
        //     });

        next();
    })
}