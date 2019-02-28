const mongoose = require ('mongoose');

const valoresDolarHoySchema = new mongoose.Schema({
	dolarCompra: String,
	dolarVenta: String,
	euroCompra: String,
	euroVenta: String,
	realCompra: String,
	realVenta: String,
	date: Date
});

exports.valoresDolarHoySchema = valoresDolarHoySchema;