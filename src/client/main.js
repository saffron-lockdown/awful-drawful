const socket = io();

const app = new Vue({
  el: '#app',
  data: {
    name: '',
    roomId: '',
    prompt: '',
    playerList: '',
  },
  methods: {
    joinRoom() {
      socket.emit('join-room', this.roomId);
    },
    setName() {
      socket.emit('set-name', this.name);
    },
  },
});
const bindSocket = (event, prop) => {
  socket.on(event, (data) => {
    app[prop] = data;
  });
};

bindSocket('set-prompt', 'prompt');
bindSocket('set-name', 'name');
bindSocket('set-room-id', 'roomId');
bindSocket('set-player-list', 'playerList');

socket.on('update-feed', (data) => {
  console.log({ data });
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

  const canvas = new fabric.Canvas(c.id);
  canvas.loadFromJSON(data);
});

const canvas = new fabric.Canvas('c', {
  isDrawingMode: true,
});
canvas.freeDrawingBrush.width = 10;
document.querySelector('#post').onclick = () => {
  const out = JSON.stringify(canvas);
  console.log(out);
  socket.emit('post-drawing', out);
};
