var mongoose = require ("mongoose"); ///http://stackoverflow.com/questions/9119648/securing-my-node-js-apps-rest-api///http://comments.gmane.org/gmane.comp.lang.javascript.nodejs/55287///http://stackoverflow.com/questions/16159063/how-to-secure-restful-route-in-backbone-and-express
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://dolarhoy:Traserito#321!@widmore.mongohq.com:10010/dolarhoydb';
var Crawler = require("crawler").Crawler;
var express = require('express');
var jquery = require('jquery');
var path = require('path');
var compraDolar;
var ventaDolar;
var compraEuro;
var ventaEuro;
var mail = require("./nodemail");
var valoresSchema = require("./Model/mongoSchema").valoresDolarHoySchema;
var Valores = mongoose.model('ValoresDolarHoy', valoresSchema);
var work = false;
var offset = -3;
var intervalTime = 900000;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});


mongoose.connect(uristring, function (err, res) {
    if (err) { console.log ('ERROR connecting to: ' + uristring + '. ' + err); } 
    else { console.log ('Succeeded connected to: ' + uristring); }
});
    
function main(){
    if (work) {
        var day = new Date( new Date().getTime() + offset * 3600 * 1000).getDay();//var day = new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" ).getDay();//;
        if(day !== 0 && day !== 6){
            var hour = new Date( new Date().getUTCDate() + offset * 3600 * 1000).getHours() + 1;/*.toUTCString().replace( / GMT$/, "" ).getHours()*/
            if(hour >= 9 && hour <= 18){
                console.log('Working...');
                try { worker(); }
                catch (Err) { onError(Err); }
            } else { console.log('Not Working hours...'); }
        } else { console.log('No Working Weekday...'); }
    }
    setTimeout(main, intervalTime);
}

function worker(){
    var c = new Crawler({"maxConnections":10, "callback":function(error,result,$) {}});
    c.queue([{
        "uri":"http://ambito.com/economia/mercados/monedas/dolar/",
        "jQuery":false,
        "callback":function(error,result) {
            if(error && error.response.statusCode !== 200) { console.log('Request error.'); }
            if(result.body.length > 0){
                getValuesDolar(result.body.toString());
                console.log("Grabbed Dolar ", result.body.length, "bytes");
            }   
        }
    }]);
    c.queue([{
        "uri":"http://ambito.com/economia/mercados/monedas/euro/",
        "jQuery":false,
        "callback":function(error,result) {
            if(error && error.response.statusCode !== 200) { console.log('Request error.'); }
            if(result.body.length > 0){
                getValuesEuro(result.body.toString());
                console.log("Grabbed Euro ", result.body.length, "bytes");
            }   
       }
    }]);
}

function getValuesDolar(resultString){
    var window = require('jsdom').jsdom(resultString, null, {
            FetchExternalResources: false,
            ProcessExternalResources: false,
            MutationEvents: false,
            QuerySelector: false
    }).createWindow();
    var $ = jquery.create(window);
    compraDolar = $('.bonosPrincipal.dolarPrincipal .floatleft .ultimo').text().split("COMPRA");
    ventaDolar = $('.bonosPrincipal.dolarPrincipal .floatleft .cierreAnterior').text().split("VENTA");
    saveVals();
}

function getValuesEuro(resultString){
    var window = require('jsdom').jsdom(resultString, null, {
            FetchExternalResources: false,
            ProcessExternalResources: false,
            MutationEvents: false,
            QuerySelector: false
    }).createWindow();
    var $ = jquery.create(window);
    compraEuro = $('#compra big').text();
    ventaEuro = $('#venta big').text();
    saveVals();
}

function saveVals(){
    try{
        if (compraDolar !== undefined && ventaDolar !== undefined && compraEuro !== undefined && ventaEuro !== undefined){
            
            var dolarTarjeta;
            var valoresDolarHoyObj;
            var dateBA = new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" );
            
            dolarTarjeta = parseFloat(ventaDolar[0].replace(",",".")) + (parseFloat(ventaDolar[0].replace(",",".")) * 20 /100);
            dolarTarjeta = dolarTarjeta.toFixed(3);
            
            valoresDolarHoyObj = new Valores ({
                dolarCompra : compraDolar[0].replace(",","."),
                dolarVenta : ventaDolar[0].replace(",","."),
                dolarBlueCompra : compraDolar[1].replace(",","."),
                dolarBlueVenta : ventaDolar[1].replace(",","."),
                dolarTarjeta : dolarTarjeta,
                euroCompra : compraEuro.replace(",","."),
                euroVenta : ventaEuro.replace(",","."),
                date : dateBA
            });
            
            Valores.findOne()
            .select('dolarCompra dolarVenta dolarBlueCompra dolarBlueVenta dolarTarjeta euroCompra euroVenta date')
            .sort('-date')
            .exec(
            function (err, doc) {
                if (err) return onError(err);
                if( doc.dolarCompra != valoresDolarHoyObj.dolarCompra ||
                doc.dolarVenta != valoresDolarHoyObj.dolarVenta ||
                doc.dolarBlueCompra != valoresDolarHoyObj.dolarBlueCompra ||
                doc.dolarBlueVenta != valoresDolarHoyObj.dolarBlueVenta ||
                doc.euroCompra != valoresDolarHoyObj.euroCompra ||
                doc.euroVenta != valoresDolarHoyObj.euroVenta ) {
                valoresDolarHoyObj.save( function (err) { 
                    if (err) { onError('Error on save!'); }
                    else {
                        console.log ('Saved!');
                        compraDolar = undefined;
                        ventaDolar = undefined;
                        compraEuro = undefined;
                        ventaEuro = undefined; 
                    }
                        
                }
                )} 
            });
        }
    }
    catch(err){ onError(err); }
    //finally { mongoose.connection.close();}
}

function onError(err) {
    mail.mailOptions.subject = 'DolarHoyServer Info: Error';
    mail.mailOptions.html = 'ERROR connecting to: ' + uristring + '. ' + err;
    mail.sendMail();
    console.log(err);
}

app.get('/',function(req, res){
  res.render('index', { title: 'Express' });
});

app.get('/start/:pass', function(req, res) {
    if(req.params.pass != 'Hola123!'){return res.send('Error: Wrong password...');}
    try{
        work = true;
        main();
        return res.send('Starting the server stand by...');
    } catch(err) { onError(err); }
});
    
app.get('/forcestart/:pass', function(req, res) {
    if (req.params.pass != 'Hola123!') { return res.send('Error: Wrong password...'); }
    try{
        worker();
        return res.send('Done...');  
    } catch(err) { onError(err); }
});

app.get('/stop/:pass', function(req, res) {
    if(req.params.pass != 'Hola123!') { return res.send('Error: Wrong password...'); }
    try{
        work = false;
        main();
        return res.send('Stoping the server...');
    } catch(err) { onError(err); }
});

app.listen(process.env.PORT);

console.log('Server HTTP Listening on port ' + process.env.PORT + '...');
