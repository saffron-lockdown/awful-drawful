const socket = io();

let canvas;

const app = new Vue({
  el: '#app',
  data() {
    return {
      state: {
        name: '',
        gameId: '',
        prompt: '',
        playerList: '',
        errorMessage: null,
        viewDrawing: null,
      },
      // local client state
      editName: true,
      localState: {
        name: '',
        gameId: '',
      },
    };
  },
  computed: {
    page() {
      // force player to set name
      if (!this.state.name.length || this.editName) {
        return 'set-name';
      }
      if (this.state.gameId) {
        if (this.state.prompt) {
          return 'ingame';
        }
        return 'waiting';
      }
      return 'landing';
    },
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
      socket.emit('join-game', this.localState.gameId);
    },
    leaveGame() {
      socket.emit('leave-game');
    },
    setName() {
      const { name } = this.localState;
      if (!name.length) {
        return;
      }
      socket.emit('set-name', name);
      this.toggleEditName();
    },
    startGame() {
      socket.emit('start-game');
    },
    postDrawing() {
      socket.emit('post-drawing', JSON.stringify(canvas));
    },
    toggleEditName() {
      this.editName = !this.editName;
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
    app.state[key] = val;
  });
  if (app.state.name) {
    app.localState.name = app.state.name;
  }
});
