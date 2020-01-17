const mongoose = require('mongoose'); // http://stackoverflow.com/questions/9119648/securing-my-node-js-apps-rest-api///http://comments.gmane.org/gmane.comp.lang.javascript.nodejs/55287///http://stackoverflow.com/questions/16159063/how-to-secure-restful-route-in-backbone-and-express
const uriString = process.env.MONGOLAB_URI;
const express = require('express');
const $ = require('cheerio');
const mail = require('./nodemail');
const valoresSchema = require('./model/mongoSchema').valoresDolarHoySchema;
const Valores = mongoose.model('ValoresDolarHoy', valoresSchema);
const offset = -3;
const rp = require('request-promise');
const intervalTime = 900000;
let dolarOficialCompra;
let dolarOficialVenta;
let dolarLibreCompra;
let dolarLibreVenta;
let dolarMayoristaCompra;
let dolarMayoristaVenta;
let dolarBolsaCompra;
let dolarBolsaVenta;
let dolarLiquiCompra;
let dolarLiquiVenta;
let euroCompra;
let euroVenta;
let realCompra;
let realVenta;
let pesoUruguayoCompra;
let pesoUruguayoVenta;
let pesoChilenoCompra;
let pesoChilenoVenta;
let work = true;

mongoose.connect(uriString, { useNewUrlParser: true }, 
  function (err, res) {
  if (err) {
    console.log(res);
    console.log('ERROR connecting to: ' + uriString + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uriString);
  }
});

let app = express();

function main() {
  if (work) {
    let day = new Date(new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, '' )).getDay(); // var day = new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, '' ).getDay();//;
    if (day !== 0 && day !==6) {
      let hour = new Date(new Date(new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, '' )).getHours();
      if (hour >= 9 && hour <= 18) {
        console.log('Working...');
        try {
          worker();
        } catch (Err) {
          onError(Err);
        }
      } else {
        console.log('Not working hours...');
      }
    } else {
      console.log('No working day...');
    }
  }
  setTimeout(main, intervalTime);
}

function worker() {
	let urlDollar = 'http://www.dolarhoy.com/';
	rp(urlDollar)
		.then(function (html) {
			//success!
			let dolarCompraHtml = $('.col-md-6.compra span', html);
			let dolarVentaHtml = $('.col-md-6.venta span', html);
			let tablesLower = $('.table-responsive td', html);

      dolarOficialCompra    = tablesLower[1].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      dolarOficialVenta     = tablesLower[2].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      dolarLibreCompra      = tablesLower[4].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      dolarLibreVenta       = tablesLower[5].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      dolarMayoristaCompra  = tablesLower[7].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      dolarMayoristaVenta   = tablesLower[8].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      dolarBolsaCompra      = tablesLower[10].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      dolarBolsaVenta       = tablesLower[11].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      dolarLiquiCompra      = tablesLower[13].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      dolarLiquiVenta       = tablesLower[14].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      euroCompra            = tablesLower[16].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      euroVenta             = tablesLower[17].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      realCompra            = tablesLower[19].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      realVenta             = tablesLower[20].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      pesoUruguayoCompra    = tablesLower[22].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      pesoUruguayoVenta     = tablesLower[23].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      pesoChilenoCompra     = tablesLower[25].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
      pesoChilenoVenta      = tablesLower[26].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');

      /*dolarCompra = dolarCompraHtml[0].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');*/
			/*dolarVenta  = dolarVentaHtml[0].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');*/
			/*euroCompra = tablesLower[13].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');*/
			/*euroVenta  = tablesLower[14].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');*/
			/*realCompra = tablesLower[16].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');*/
			/*realVenta  = tablesLower[17].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');*/

			saveVals();
		})
		.catch(function (err) {
			onError(err);
		});
}

function saveVals(){
  try {
		console.log('dolar Oficial Compra ' + dolarOficialCompra);
    console.log('dolar Oficial Venta ' + dolarOficialVenta);
    console.log('dolar Libre Compra ' + dolarLibreCompra);
    console.log('dolar Libre Venta ' + dolarLibreVenta);
    console.log('dolar Mayorista Compra ' + dolarMayoristaCompra);
    console.log('dolar Mayorista Venta ' + dolarMayoristaVenta);
    console.log('dolar Bolsa Compra ' + dolarBolsaCompra);
    console.log('dolar Bolsa Venta ' + dolarBolsaVenta);
    console.log('dolar Liqui Compra ' + dolarLiquiCompra);
    console.log('dolar Liqui Venta ' + dolarLiquiVenta);
    console.log('euro Compra ' + euroCompra);
    console.log('euro Venta ' + euroVenta);
    console.log('real Compra ' + realCompra);
    console.log('real Venta ' + realVenta);
    console.log('peso Uruguayo Compra ' + pesoUruguayoCompra);
    console.log('peso Uruguayo Venta ' + pesoUruguayoVenta);
    console.log('peso Chileno Compra ' + pesoChilenoCompra);
    console.log('peso Chileno Venta ' + pesoChilenoVenta);

    if (
      dolarOficialCompra !== undefined &&
      dolarOficialVenta !== undefined &&
      dolarLibreCompra !== undefined &&
      dolarLibreVenta !== undefined &&
      dolarMayoristaCompra !== undefined &&
      dolarMayoristaVenta !== undefined &&
      dolarBolsaCompra !== undefined &&
      dolarBolsaVenta !== undefined &&
      dolarLiquiCompra !== undefined &&
      dolarLiquiVenta !== undefined &&
      euroCompra !== undefined &&
      euroVenta !== undefined &&
      realCompra !== undefined &&
      realVenta !== undefined &&
      pesoUruguayoCompra !== undefined &&
      pesoUruguayoVenta !== undefined &&
      pesoChilenoCompra !== undefined &&
      pesoChilenoVenta !== undefined
      ) {

      let valoresDolarHoyObj;
      let dateBA = new Date(new Date().getTime() + offset * 3600 * 1000).toUTCString().replace(/ GMT$/, '');

      valoresDolarHoyObj = new Valores({
        dolarOficialCompra: dolarOficialCompra,
        dolarOficialVenta: dolarOficialVenta,
        dolarLibreCompra: dolarLibreCompra,
        dolarLibreVenta: dolarLibreVenta,
        dolarMayoristaCompra: dolarMayoristaCompra,
        dolarMayoristaVenta: dolarMayoristaVenta,
        dolarBolsaCompra: dolarBolsaCompra,
        dolarBolsaVenta: dolarBolsaVenta,
        dolarLiquiCompra: dolarLiquiCompra,
        dolarLiquiVenta: dolarLiquiVenta,
        euroCompra: euroCompra,
        euroVenta: euroVenta,
        realCompra: realCompra,
        realVenta: realVenta,
        pesoUruguayoCompra: pesoUruguayoCompra,
        pesoUruguayoVenta: pesoUruguayoVenta,
        pesoChilenoCompra: pesoChilenoCompra,
        pesoChilenoVenta: pesoChilenoVenta,
        date: dateBA
      });

      Valores.findOne()
          .select('dolarCompra dolarVenta euroCompra euroVenta realCompra realVenta date')
          .sort('-date')
          .exec(
          function (err, doc) {
            if (err) {
              return onError(err);
            }
            if (
              doc.dolarOficialCompra !== valoresDolarHoyObj.dolarOficialCompra ||
              doc.dolarOficialVenta !== valoresDolarHoyObj.dolarOficialVenta ||
              doc.dolarLibreCompra !== valoresDolarHoyObj.dolarLibreCompra ||
              doc.dolarLibreVenta !== valoresDolarHoyObj.dolarLibreVenta ||
              doc.dolarMayoristaCompra !== valoresDolarHoyObj.dolarMayoristaCompra ||
              doc.dolarMayoristaVenta !== valoresDolarHoyObj.dolarMayoristaVenta ||
              doc.dolarBolsaCompra !== valoresDolarHoyObj.dolarBolsaCompra ||
              doc.dolarBolsaVenta !== valoresDolarHoyObj.dolarBolsaVenta ||
              doc.dolarLiquiCompra !== valoresDolarHoyObj.dolarLiquiCompra ||
              doc.dolarLiquiVenta !== valoresDolarHoyObj.dolarLiquiVenta ||
              doc.euroCompra !== valoresDolarHoyObj.euroCompra ||
              doc.euroVenta !== valoresDolarHoyObj.euroVenta ||
              doc.realCompra !== valoresDolarHoyObj.realCompra ||
              doc.realVenta !== valoresDolarHoyObj.realVenta ||
              doc.pesoUruguayoCompra !== valoresDolarHoyObj.pesoUruguayoCompra ||
              doc.pesoUruguayoVenta !== valoresDolarHoyObj.pesoUruguayoVenta ||
              doc.pesoChilenoCompra !== valoresDolarHoyObj.pesoChilenoCompra ||
              doc.pesoChilenoVenta !== valoresDolarHoyObj.pesoChilenoVenta
            ) {
              valoresDolarHoyObj.save(
                function (err) {
                  if (err) {
                    console.log('Error on save!');
                  } else {
                    console.log('Saved!');
                  }
                }
              )
            }
          }
      );
      dolarOficialCompra = '';
      dolarOficialVenta = '';
      dolarLibreCompra = '';
      dolarLibreVenta = '';
      dolarMayoristaCompra = '';
      dolarMayoristaVenta = '';
      dolarBolsaCompra = '';
      dolarBolsaVenta = '';
      dolarLiquiCompra = '';
      dolarLiquiVenta = '';
      euroCompra = '';
      euroVenta = '';
      realCompra = '';
      realVenta = '';
      pesoUruguayoCompra = '';
      pesoUruguayoVenta = '';
      pesoChilenoCompra = '';
      pesoChilenoVenta = '';
    }
  } catch(err) {
    onError(err);
  }
}

function onError(err) {
  mail.mailOptions.subject = 'DolarHoyServer Info: Error';
  mail.mailOptions.html = 'ERROR connecting to: ' + uriString + '. ' + err;
  // mail.sendMail();
  console.log(err);
}

app.get('/start/:pass', function(req, res) {
    if (req.params.pass !== 'Hola123!') {
      return res.send('Error: Wrong password...');
    }
    try {
      work = true;
      main();
      return res.send('Starting the server stand by...');
    } catch(err) {
      onError(err);
    }
});

app.get('/forcestart/:pass', function(req, res) {
  if (req.params.pass !== 'Hola123!') {
    return res.send('Error: Wrong password...');
  }
  try{
    worker();
    return res.send('Done...');
  } catch(err) {
    onError(err);
  }
});

app.get('/stop/:pass', function(req, res) {
  if(req.params.pass !== 'Hola123!') {
    return res.send('Error: Wrong password...');
  }
  try {
    work = false;
    main();
    return res.send('Stoping the server...');
  } catch (err) {
    onError(err);
  }
});

app.listen(process.env.PORT || 3000, process.env.IP);

main();

console.log('Server HTTP Listening on port ' + ( process.env.PORT || 3000 ) + '...');