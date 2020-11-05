const socket = io();

let easel = null;
let gallery = null;

function createFabricCanvas(el, options = {}) {
  const canvas = new fabric.Canvas(el, options);
  // expand canvas to fill remaining screen real estate
  canvas.setDimensions({ width: '100%', height: '100%' }, { cssOnly: true });

  // set aspect ratio appropriate to screen
  canvas.setDimensions(
    { width: canvas.width, height: canvas.height },
    { backstoreOnly: true }
  );
  return canvas;
}

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
      editName: false,
      name: '',
      gameId: '',
      caption: '',
    };
  },
  computed: {
    page() {
      // force player to set name
      if (!this.state.name.length || this.editName) {
        return 'set-name';
      }
      if (this.state.gameId) {
        if (this.state.phase === 'LOBBY') {
          return 'lobby';
        }
        return 'ingame';
      }
      return 'landing';
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
      if (!this.name.length) {
        return;
      }
      socket.emit('set-name', this.name);
      this.editName = false;
    },
    startGame() {
      socket.emit('start-game');
    },
    postDrawing() {
      socket.emit('post-drawing', JSON.stringify(easel));
    },
    postCaption() {
      socket.emit('post-caption', this.caption);
    },
    chooseCaption(caption) {
      socket.emit('choose-caption', caption.text);
    },
  },
  updated() {
    // every time the DOM is updated, check if there are any canvases that need to be hooked up to
    // fabric.js. Ensure that there is only ever one fabric.Canvas instance per canvas DOM node
    const el = document.querySelector('#easel');
    if (el) {
      if (!easel) {
        easel = createFabricCanvas(el, {
          isDrawingMode: true,
        });
        easel.freeDrawingBrush.color = 'purple';
        easel.freeDrawingBrush.width = 10;
      }
    } else {
      easel = null;
    }
    const ref = document.querySelector('#gallery');
    if (ref) {
      if (this.state.viewDrawing) {
        if (!gallery) {
          gallery = createFabricCanvas(ref);
        }
        gallery.clear();
        gallery.loadFromJSON(this.state.viewDrawing);
      }
    } else {
      gallery = null;
    }
  },
});

Vue.component('gallery', {
  template: `
    <div key="gallery" class="flex-grow-1 mb-2">
      <canvas id="gallery" width="500" height="500"></canvas>
    </div>
  `,
});

socket.on('sync', (data) => {
  app.state = data;
  if (app.state.name) {
    app.name = app.state.name;
  }
});
