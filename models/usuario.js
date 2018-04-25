var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcryptjs');


var Scheme = mongoose.Schema;

roles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido.'
}


var usuarioScheme = new Scheme({
    nombre: { type: String, required: [true, "El nombre es obligatorio."] },
    email: { type: String, unique: true, required: [true, "El correo es obligatorio."] },
    password: { type: String, required: [true, "La contraseña es necesaria."] },
    img: { type: String },
    role: { type: String, required: true, default: 'USER_ROLE', enum: roles },
    google: { type: Boolean, default: false }
});


usuarioScheme.plugin(uniqueValidator, { message: 'El correo debe ser único.' })

module.exports = mongoose.model('Usuario', usuarioScheme)