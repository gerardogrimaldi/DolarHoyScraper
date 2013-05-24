var mongoose = require ("mongoose"); 
 
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://dolarhoy:Hola123!@ds051447.mongolab.com:51447/dolarhoydb';

//var theport = process.env.PORT || 5000;
mongoose.connect(uristring, function (err, res) {
  if (err) { 
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});


var valoresDolarHoy = new mongoose.Schema(
    {
    valorDolarHoyCompra : String,
    valorDolarHoyVenta : String,
    valorDolarBlueCompra : String,
    valorDolarBlueVenta : String,
    valorDolarTarjeta : String,
    valorEuroHoyCompra : String,
    valorEuroHoyVenta : String
});

var valores_A_Grabar = mongoose.model('ValoresDolarHoy', valoresDolarHoy);

var valoresDolarHoyObj = new valores_A_Grabar ({
    valorDolarHoyCompra : "5.3",
    valorDolarHoyVenta : "5.3",
    valorDolarBlueCompra : "5.3",
    valorDolarBlueVenta : "5.3",
    valorDolarTarjeta : "5.3",
    valorEuroHoyCompra : "5.3",
    valorEuroHoyVenta : "5.3"
});


valoresDolarHoyObj.save(
    function (err) {
        if (err) console.log ('Error on save!');
        else console.log ('Saved!');
        }
    );
        
    