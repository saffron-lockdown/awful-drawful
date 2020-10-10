var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

app.use(function (req, res, next) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});

app.get('/', function(req, res, next){
  console.log('get route', req.testing);
  res.end();
});



app.ws('/', function (ws, req) {
  const id = String(Math.random());
  ws.on('message', function(msg) {
    console.log(`from id ${id}: ${msg}`);
  });

  console.log('id: ', id);
});

app.listen(3000);
