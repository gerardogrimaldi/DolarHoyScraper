const mongoose = require ('mongoose');

const valoresDolarHoySchema = new mongoose.Schema({
  dolarOficialCompra    : String,
  dolarOficialVenta     : String,
  dolarLibreCompra      : String,
  dolarLibreVenta       : String,
  dolarMayoristaCompra  : String,
  dolarMayoristaVenta   : String,
  dolarBolsaCompra      : String,
  dolarBolsaVenta       : String,
	dolarLiquiCompra      : String,
	dolarLiquiVenta       : String,
	euroCompra            : String,
	euroVenta             : String,
  realCompra            : String,
  realVenta             : String,
  pesoUruguayoCompra    : String,
  pesoUruguayoVenta     : String,
  pesoChilenoCompra     : String,
  pesoChilenoVenta      : String,
  date                  : Date
});

exports.valoresDolarHoySchema = valoresDolarHoySchema;