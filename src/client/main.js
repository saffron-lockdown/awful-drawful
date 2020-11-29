const socket = io();

let easel = null;
let gallery = null;

function setCanvasSize(canvas) {
  // expand canvas to fill remaining screen real estate
  canvas.setDimensions({ width: '100%', height: 'auto' }, { cssOnly: true });

  canvas.setDimensions({ width: 500, height: 500 }, { backstoreOnly: true });
}

async function sleep(time) {
  await new Promise((res) => setTimeout(res, time));
}

const app = new Vue({
  el: '#app',
  data() {
    return {
      state: {
        name: '',
        errorMessage: null,
        gameId: '',
        players: [],
        scores: [],
        phase: null,
        isWaiting: null,
        timerDuration: null,
        timeRemaining: null,
        prompt: '',
        viewDrawing: null,
        captions: [],
        realPrompt: null,
      },
      // local client state
      editName: false,
      name: '',
      gameId: '',
      caption: '',
      isDrawingPosted: false,
      scores: [], // for local animation
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
    animatedScores() {
      return this.scores.map((data) => ({
        ...data,
        score: data.score.toFixed(0),
      }));
    },
  },
  watch: {
    async state(newState, oldState) {
      // if they haven't posted a drawing but the phase moves from DRAW to CAPTION
      // just submit whatever they've got so far
      if (
        !this.isDrawingPosted &&
        oldState.phase === 'DRAW' &&
        newState.phase === 'CAPTION'
      ) {
        console.log('submitting whatever you have');
        this.postDrawing();
      }

      if (oldState.phase === 'REVEAL' && newState.phase === 'SCORE') {
        console.log('running animation');
        console.log(this.state.scores);

        // sequentially push each score to the scores array
        this.scores = [];
        await this.state.scores.reduce(async (acc, row) => {
          await acc;
          this.scores.push({
            ...row,
            score: row.previousScore,
          });
          await sleep(500);
        }, Promise.resolve());

        await sleep(1000);

        // sequentially update each row that has changed
        await this.scores
          .filter((row) => row.currentScore !== row.previousScore)
          .reduce(async (acc, row) => {
            await acc;
            gsap.to(row, {
              duration: 1,
              score: row.currentScore,
            });
            await sleep(500);
          }, Promise.resolve());

        await sleep(1000);

        this.scores.sort((a, b) => b.score - a.score);
      } else if (this.state.scores && !this.scores.length) {
        // only set scores if animation is not in progress
        this.scores = this.state.scores.map((row) => ({
          ...row,
          score: row.currentScore,
        }));
      }
    },
  },
  methods: {
    setGameId(val) {
      this.gameId = val.toUpperCase();
    },
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
      this.isDrawingPosted = true;
      socket.emit('post-drawing', JSON.stringify(easel));
    },
    postCaption() {
      socket.emit('post-caption', this.caption);
    },
    chooseCaption(caption) {
      socket.emit('choose-caption', caption.text);
    },
    answerVariant(caption) {
      if (caption.text !== this.state.realPrompt) {
        return 'danger';
      }
      return 'success';
    },
    playerVariant(player) {
      return player.connected ? 'success' : 'danger';
    },
    message() {
      if (this.state.phase === 'DRAW') {
        if (this.state.isWaiting) {
          return 'Waiting for other players to finish drawing';
        }
        return `Your prompt to draw is: ${this.state.prompt}`;
      }

      if (this.state.phase === 'CAPTION') {
        if (this.state.isWaiting) {
          return 'Waiting for other players to caption the drawing';
        }
        return 'Write what you think this could be';
      }

      if (this.state.phase === 'GUESS') {
        if (this.state.isWaiting) {
          return 'Waiting for other players to guess the real prompt';
        }
        return 'Choose what you think was the real prompt';
      }

      if (this.state.phase === 'REVEAL') {
        return "Let's see what you all guessed!";
      }

      if (this.state.phase === 'SCORE') {
        return 'Here are the scores so far';
      }

      if (this.state.phase === 'FINALSCORE') {
        return 'What a game!';
      }

      return '';
    },
  },
  updated() {
    // every time the DOM is updated, check if there are any canvases that need to be hooked up to
    // fabric.js. Ensure that there is only ever one fabric.Canvas instance per canvas DOM node
    const el = document.querySelector('#easel');
    if (el) {
      if (!easel) {
        easel = new fabric.Canvas(el, {
          isDrawingMode: true,
        });
        setCanvasSize(easel);
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
          gallery = new fabric.Canvas(ref, {
            interactive: false,
          });
          setCanvasSize(gallery);
        }
        gallery.clear();
        gallery.loadFromJSON(this.state.viewDrawing);
      }
    } else {
      gallery = null;
    }
  },
});

Vue.component('drawing', {
  props: ['id'],
  template: `
    <div :key="id" class="d-flex flex-grow-1 mb-2">
      <canvas :id="id"></canvas>
    </div>
  `,
});

socket.on('sync', (data) => {
  app.state = data;
  if (app.state.name) {
    app.name = app.state.name;
  }
});
