const socket = io();

const canvas = new fabric.Canvas('c', {
  isDrawingMode: true,
});
canvas.freeDrawingBrush.width = 10;

const app = new Vue({
  el: '#app',
  data() {
    return {
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
      console.log('displaying drawing');
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
});

socket.on('sync', (data) => {
  Object.entries(data).forEach(([key, val]) => {
    app[key] = val;
  });
});
