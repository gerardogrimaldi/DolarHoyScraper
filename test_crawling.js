var Crawler = require("crawler").Crawler;
var jsdom = require('jsdom');
var jquery = require('jquery');
var compraDolar;
var ventaDolar;
var compraEuro;
var ventaEuro;

app.listen(process.env.PORT);
console.log('server on Listening on port ' + process.env.PORT + '...');

var c = new Crawler({
    "maxConnections":10,

    // This will be called for each crawled page
    "callback":function(error,result,$) {

        // $ is a jQuery instance scoped to the server-side DOM of the page
        $("#content a").each(function(index,a) {
            c.queue(a.href);
            console.log(c.queue(a.href));
        });
    }
});

c.queue([{
    "uri":"http://ambito.com/economia/mercados/monedas/dolar/",
    "jQuery":false,
    // The global callback won't be called
    "callback":function(error,result) {
        if(error && error.response.statusCode !== 200){console.log('Request error.');}
        if(result.body.length > 0){
            returnValuesDolar(result.body.toString());
        }   
        //TODO grabar en mongo
        
        console.log("Grabbed Dolar",result.body.length,"bytes");
    }
}]);

c.queue([{
    "uri":"http://ambito.com/economia/mercados/monedas/euro/",
    "jQuery":false,
    // The global callback won't be called
    "callback":function(error,result) {
        if(error && error.response.statusCode !== 200){console.log('Request error.');}
        if(result.body.length > 0){
            returnValuesEuro(result.body.toString());
        }   
        console.log("Grabbed Euro",result.body.length,"bytes");
    }
}]);


function returnValuesDolar(resultString){
    var window = require('jsdom').jsdom(resultString, null, {
            FetchExternalResources: false,
            ProcessExternalResources: false,
            MutationEvents: false,
            QuerySelector: false
    }).createWindow();
        
    var $ = jquery.create(window);
     
    var compraDolar = $('.bonosPrincipal.dolarPrincipal .floatleft .ultimo').text().split("COMPRA");
    var ventaDolar = $('.bonosPrincipal.dolarPrincipal .floatleft .cierreAnterior').text().split("VENTA");
}

function returnValuesEuro(resultString){
    var window = require('jsdom').jsdom(resultString, null, {
            FetchExternalResources: false,
            ProcessExternalResources: false,
            MutationEvents: false,
            QuerySelector: false
    }).createWindow();
     
    var $ = jquery.create(window);
     
    compraEuro = $('#compra big').text();
    ventaEuro = $('#venta big').text();
}
 