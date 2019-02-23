const mongoose = require ('mongoose'); // http://stackoverflow.com/questions/9119648/securing-my-node-js-apps-rest-api///http://comments.gmane.org/gmane.comp.lang.javascript.nodejs/55287///http://stackoverflow.com/questions/16159063/how-to-secure-restful-route-in-backbone-and-express
const uriString = process.env.MONGOLAB_URI;
const express = require('express');
const $ = require('cheerio');
const mail = require('./nodemail');
const Valores = mongoose.model('ValoresDolarHoy', valoresSchema);
const offset = -3;
const rp = require('request-promise');
const intervalTime = 900000;
let valoresSchema = require('./model/mongoSchema').valoresDolarHoySchema;
let dolarCompra;
let dolarVenta;
let euroCompra;
let euroVenta;
let realCompra;
let realVenta;
let work = false;


mongoose.connect(uriString, { useNewUrlParser: true }, 
  function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uriString + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uriString);
  }
});

var app = express();

app.set('port', process.env.PORT || 3000);

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

			dolarCompra = dolarCompraHtml[0].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
			dolarVenta = dolarVentaHtml[0].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
			euroCompra = tablesLower[13].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
			euroVenta  = tablesLower[14].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
			realCompra = tablesLower[16].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');
			realVenta  = tablesLower[17].children[0].data.replace('$', '').replace(',', '.').replace(' ', '');

			saveVals();
		})
		.catch(function (err) {
			onError(err);
		});
}

function saveVals(){
  try {
		console.log(dolarCompra);
		console.log(dolarVenta);
		console.log(euroCompra);
		console.log(euroVenta);
		console.log(realCompra);
		console.log(realVenta);

    if (dolarCompra !== undefined &&
      dolarVenta !== undefined &&
			euroCompra !== undefined &&
			euroVenta !== undefined &&
			realCompra !== undefined &&
			realVenta !== undefined) {

      let valoresDolarHoyObj;
      let dateBA = new Date(new Date().getTime() + offset * 3600 * 1000).toUTCString().replace(/ GMT$/, '');

      valoresDolarHoyObj = new Valores({
        dolarCompra: dolarCompra,
        dolarVenta: dolarVenta,
				euroCompra: euroCompra,
				euroVenta: euroVenta,
        realCompra: realCompra,
        realVenta: realVenta,
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
            if (doc.dolarCompra !== valoresDolarHoyObj.dolarCompra ||
                doc.dolarVenta !== valoresDolarHoyObj.dolarVenta ||
                doc.euroCompra !== valoresDolarHoyObj.euroCompra ||
                doc.euroVenta !== valoresDolarHoyObj.euroVenta ||
							  doc.realCompra !== valoresDolarHoyObj.realCompra ||
							  doc.realVenta !== valoresDolarHoyObj.realVenta) {
              valoresDolarHoyObj.save(
                  function (err) {
                    if (err) {
                      console.log('Error on save!');
                    }
                    else {
                      console.log('Saved!');
                    }
                  }
              )
            }
          }
      );
      dolarCompra = '';
      dolarVenta = '';
      euroCompra = '';
      euroVenta = '';
      realCompra = '';
      realVenta = '';
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

app.listen(process.env.PORT, process.env.IP);

console.log('Server HTTP Listening on port ' + process.env.PORT + '...');