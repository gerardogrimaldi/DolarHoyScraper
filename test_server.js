var express = require('express');
var valoresDolarHoy = {
    'valorDolarHoyCompra' : '5,2',
    'valorDolarHoyVenta' : '5,2',
    'valorDolarBlueCompra' : '5,2',
    'valorDolarBlueVenta' : '5,2',
    'valorDolarTarjeta' : '5,2',
    'valorEuroHoyCompra' : '5,2',
    'valorEuroHoyVenta' : '5,2'
};
    
var app = express();
 
 app.use(express.logger());
 
 app.get('/', function(req, res) {
    
    res.send('Dolar Hoy');
});
 
app.get('/Dolar', function(req, res) {
    res.send(JSON.stringify(valoresDolarHoy));
    //res.send({Value:'5,20'});
    //res.send([{name:'wine1'}, {Value:'5,20'}]);
});
app.get('/Dolar/:id', function(req, res) {
    //res.send({id:req.params.id, name: "The Name", description: "description"});
});
 
app.listen(process.env.PORT);
//app.server(process.env.IP);
console.log('server on Listening on port ' + process.env.PORT + '...');