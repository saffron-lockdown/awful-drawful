const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const expressWs = require('express-ws')(app);
const { v4: uuid } = require('uuid');
const serveStatic = require('serve-static');

const users = {};

app.use(
  cookieSession({
    name: 'session',
    secret: 'secret1234',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use((req, res, next) => {
  if (req.session.isNew) {
    req.session.id = uuid();
  }
  return next();
});

app.use(serveStatic('src/client/'));

app.ws('/', function (ws, req) {
  const id = req.session.id;
  console.log('user connected to websocket with id: ', id);

  console.log(
    `websocket is connecting, req.session.name is ${req.session.name}`
  );

  ws.on('message', function (msg) {
    console.log(`from id ${id}: ${msg}`);
    users[req.session.id].name = JSON.parse(msg).name;
  });

  if (!users[req.session.id]) {
    users[req.session.id] = { name: 'no name set ' };
  }
  const user = users[req.session.id];

  ws.send(user.name);
});

app.listen(3000);
