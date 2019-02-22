const mongoose = require ('mongoose');

const valoresDolarHoySchema = new mongoose.Schema({
    dolarCompra : String,
    dolarVenta : String,
    dolarBlueCompra : String,
    dolarBlueVenta : String,
    dolarTarjeta : String,
    realCompra : String,
    realVenta : String,
    euroCompra : String,
    euroVenta : String,
    date : Date
});

exports.valoresDolarHoySchema = valoresDolarHoySchema;