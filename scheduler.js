let request = require('request');
request({
  uri: 'http://dolarhoyscraper.herokuapp.com/start/Hola123!',
}, function(error, response, body) {
  console.log(body);
});
