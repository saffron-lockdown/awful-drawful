const express = require('express');
const cookieSession = require('cookie-session')
const app = express();
const expressWs = require('express-ws')(app);
const { v4: uuid } = require('uuid');

app.use(cookieSession({
  name: 'session',
  secret: 'secret1234',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use((req, res, next) => {
  if (req.session.isNew) {
    req.session.id = uuid();
  }
  return next();
})

app.get('/', function (req, res, next) {
  console.log(`GET on /, user id: ${req.session.id}`);
  res.end();
});

app.ws('/', function (ws, req) {
  const id = req.session.id;
  console.log('user connected to websocket with id: ', id);

  ws.on('message', function(msg) {
    console.log(`from id ${id}: ${msg}`);
  });

});

app.listen(3000);
