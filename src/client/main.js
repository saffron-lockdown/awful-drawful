const socket = io();

let canvas;

const app = new Vue({
  el: '#app',
  data() {
    return {
      page: '',
      name: '',
      gameId: '',
      prompt: '',
      playerList: '',
      errorMessage: null,
      viewDrawing: null,
    };
  },
  watch: {
    viewDrawing(newDrawing) {
      const c = document.createElement('canvas');
      c.width = '500';
      c.height = '500';
      c.style = `border: 1px solid rgb(170, 170, 170);
          width: 500px;
          height: 500px;
          touch-action: none;
          user-select: none;`;
      c.id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      document.querySelector('#feed-container').appendChild(c);

      const drawing = new fabric.Canvas(c.id);
      drawing.loadFromJSON(newDrawing);
    },
  },
  methods: {
    createGame() {
      socket.emit('create-game');
    },
    joinGame() {
      socket.emit('join-game', this.gameId);
    },
    leaveGame() {
      socket.emit('leave-game');
    },
    setName() {
      socket.emit('set-name', this.name);
    },
    startGame() {
      socket.emit('start-game');
    },
    postDrawing() {
      socket.emit('post-drawing', JSON.stringify(canvas));
    },
  },
  updated() {
    const ref = this.$refs.easel;
    if (ref) {
      canvas = new fabric.Canvas(ref, {
        isDrawingMode: true,
      });
      canvas.freeDrawingBrush.color = 'purple';
      canvas.freeDrawingBrush.width = 10;
    }
  },
});

socket.on('sync', (data) => {
  Object.entries(data).forEach(([key, val]) => {
    app[key] = val;
  });
  if (app.gameId) {
    if (app.prompt) {
      app.page = 'ingame';
    } else {
      app.page = 'waiting';
    }
  } else {
    app.page = 'landing';
  }
});
