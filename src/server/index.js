import { createServer } from 'http';
import express from 'express';
import { Game, getPrompt } from './game.js';
import serveStatic from 'serve-static';
import session from 'express-session';
import sio from 'socket.io';

const app = express();
const server = createServer(app);
const io = sio(server);

const sesh = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { path: '/', httpOnly: true, secure: false, maxAge: null },
});

class Player {
  constructor(id) {
    this.id = id;
    this.socket;
    this.name = 'No name set';
  }

  update() {
    this.emit('set-name', this.name);
  }

  emit(tag, message) {
    this.socket.emit(tag, message);
    console.log(
      'sending player ' +
        this.id.substring(1, 6) +
        ' the message ' +
        tag +
        ': ' +
        message
    );
  }
}

class Manager {
  constructor() {
    this.games = {}; // id to game object dictionary (games have references to player ids)
    this.players = {}; // id to player object dictionary
  }

  // given an id, return the game object if it exists in the manager
  // otherwise create/store a new game object and return that
  getOrCreateGame(gameId) {
    if (gameId in this.games) {
      console.log('getting existing game ' + gameId);
      return this.games[gameId];
    } else {
      var game = new Game(gameId);
      this.games[gameId] = game;
      return game;
    }
  }

  // given an id, return the player object if it exists in the manager
  // otherwise create/store a new player object and return that
  getOrCreatePlayer(id) {
    if (id in this.players) {
      console.log('seen you before');
      return this.players[id];
    } else {
      console.log('hello noob');
      var player = new Player(id);
      this.players[id] = player;
      return player;
    }
  }

  // emit a message to all players in a game
  messageGame(gameId, tag, message) {
    var game = this.games[gameId];

    game.players.forEach((playerId) => {
      this.players[playerId].emit(tag, message);
    });
  }

  // output a list of all the players in the specified game
  listPlayersInGame(gameId) {
    var playerList = '';
    this.games[gameId].players.forEach((element) => {
      playerList += this.players[element].name + ', ';
    });
    return playerList;
  }
}

var mgr = new Manager();

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

app.use(sesh);
io.use(wrap(sesh));

io.on('connect', (socket) => {
  const { session: user } = socket.request;
  console.log('User ' + user.id.substring(1, 6) + '... connected');

  var player = mgr.getOrCreatePlayer(user.id);
  player.socket = socket;

  socket.on('set-name', (name) => {
    console.log('nice name - ' + name);
    player.name = name;
    player.update();

    // If the player is in a game, update the list of players on everyones screen
    if (player.gameId) {
      mgr.messageGame(
        player.gameId,
        'set-player-list',
        mgr.listPlayersInGame(player.gameId)
      );
    }
  });

  socket.on('join-room', (gameId) => {
    // TODO: if player is already in game, then leave it

    // Record which game this player is in
    player.gameId = gameId;
    player.update();

    // Create game if doesn't exist
    var game = mgr.getOrCreateGame(gameId);

    // Add user if not in game
    if (!game.players.includes(player.id)) {
      game.addPlayer(player.id);
    }

    // Update list of player names
    mgr.messageGame(gameId, 'set-player-list', mgr.listPlayersInGame(gameId));
  });

  socket.on('post-drawing', (drawing) => {
    mgr.messageGame(player.gameId, 'update-feed', drawing);
  });
});

app.use(serveStatic('src/client/'));

server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
