import express from 'express';
import { getPrompt } from './prompt.js';
import serveStatic from 'serve-static';
import session from 'express-session';
import sio from 'socket.io';

const app = express();
const http = require('http').createServer(app);
const io = sio(http);

const sesh = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { path: '/', httpOnly: true, secure: false, maxAge: null },
});

const users = {};

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

app.use(sesh);
io.use(wrap(sesh));

io.on('connect', (socket) => {
  const prompt = getPrompt();
  socket.emit('set-prompt', prompt);
  socket.emit('set-name', socket.request.session.name || 'no name set');

  socket.on('set-name', (name) => {
    socket.request.session.name = name;
    socket.request.session.save((err) => {
      if (err) {
        throw err;
      }
      socket.emit('set-name', socket.request.session.name);
    });
  });
});

app.use(serveStatic('src/client/'));

http.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
