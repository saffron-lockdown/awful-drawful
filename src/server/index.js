const app = require('express')();
const serveStatic = require('serve-static');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const session = require('express-session');

const sesh = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { path: '/', httpOnly: true, secure: false, maxAge: null },
});

const getPrompt = require('./prompt.js');

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
