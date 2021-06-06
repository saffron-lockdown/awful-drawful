<template>
  <b-container class="d-flex flex-column pt-2 pb-2 h-100" v-cloak>
    <template v-if="page === 'set-name'">
      <b-form-group label="Name">
        <b-form-input
          name="name"
          v-model="name"
          @keyup.enter="setName"
        ></b-form-input>
      </b-form-group>
      <b-button
        id="set-name-button"
        key="set-name-button"
        class="mb-2"
        @click="setName"
        variant="primary"
      >
        Set name
      </b-button>
    </template>
    <template id="page-landing" v-if="page === 'landing'">
      <b-button
        id="name-display"
        @click="editName = true"
        variant="light"
        v-if="page === 'landing'"
        class="mb-2"
      >
        {{ state.name }} <b-badge variant="primary">tap to edit</b-badge>
      </b-button>
      <b-form-group label="Game ID">
        <b-form-input
          name="gameId"
          v-bind:value="gameId"
          @input="setGameId"
          @keyup.enter="joinGame"
          maxlength="4"
        >
        </b-form-input>
      </b-form-group>
      <error-display :error="error"></error-display>
      <b-button
        id="join-game-button"
        class="mb-2"
        @click="joinGame"
        variant="success"
        >Join game</b-button
      >
      <b-button
        id="create-game-button"
        class="mb-2"
        @click="createGame"
        variant="info"
        >Create game</b-button
      >
      <b-badge pill variant="light">Built {{ viteBuildId }}</b-badge>
    </template>
    <template id="page-lobby" v-else-if="page === 'lobby'">
      <div class="d-flex justify-content-end mb-2">
        <b-dropdown right variant="primary" id="game-id-display">
          <template #button-content> Game ID: {{ state.gameId }} </template>
          <b-dropdown-item>
            <b-button
              id="leave-game-button"
              key="leave-game-button"
              @click="leaveGame"
              variant="outline-danger"
            >
              Leave game
            </b-button>
          </b-dropdown-item>
        </b-dropdown>
      </div>
      <b-alert id="player-list-display" show>
        Players:
        <template v-for="player in state.players">
          <b-badge
            class="mr-1"
            :variant="playerVariant(player)"
            v-bind:key="player.name"
          >
            {{ player.name }}
            <b-icon-exclamation-triangle-fill
              v-if="playerVariant(player) === 'danger'"
            >
            </b-icon-exclamation-triangle-fill>
          </b-badge>
        </template>
      </b-alert>
      <b-button
        id="start-game-button"
        variant="success"
        class="mb-2"
        @click="startGame"
        >Everybody's in!</b-button
      >
    </template>
    <div
      id="page-ingame"
      v-else-if="page === 'ingame'"
      class="flex-grow-1 d-flex flex-column mb-2"
    >
      <div class="d-flex mb-2">
        <b-progress
          class="flex-grow-1 mr-2"
          height="auto"
          :value="state.timeRemaining"
          :max="state.timerDuration"
          striped
          animated
          variant="primary"
          show-value
        ></b-progress>
        <b-dropdown right variant="light">
          <template #button-content>
            <b-icon-gear-fill></b-icon-gear-fill>
          </template>
          <b-dropdown-item>
            <b-button
              id="leave-game-button"
              key="leave-game-button"
              @click="leaveGame"
              variant="outline-danger"
            >
              Leave game
            </b-button>
          </b-dropdown-item>
        </b-dropdown>
      </div>
      <b-alert id="display" show>{{ message }}</b-alert>
      <template v-if="!state.isWaiting">
        <template v-if="state.phase === 'DRAW'">
          <gallery-drawing id="easel"></gallery-drawing>
          <b-button id="post" @click="postDrawing" variant="success">
            Post
          </b-button>
        </template>
        <template v-if="state.phase === 'CAPTION'">
          <gallery-drawing id="gallery"></gallery-drawing>
          <b-form-group label="What is this?">
            <b-form-input
              id="caption-input"
              v-model="caption"
              @keyup.enter="postCaption"
            ></b-form-input>
          </b-form-group>
          <error-display :error="error"></error-display>
          <b-button
            id="caption-button"
            class="mb-2"
            @click="postCaption"
            variant="primary"
            >Submit</b-button
          >
        </template>
        <template v-if="state.phase === 'GUESS'">
          <gallery-drawing id="gallery"></gallery-drawing>
          <b-card no-body>
            <b-list-group flush>
              <b-list-group-item
                v-for="caption in state.captions"
                :key="caption.playerName"
                button
                @click="chooseCaption(caption)"
              >
                {{ caption.text }}
              </b-list-group-item>
            </b-list-group>
          </b-card>
          <error-display :error="error"></error-display>
        </template>
      </template>
      <template v-if="state.phase === 'REVEAL'">
        <gallery-drawing id="gallery"></gallery-drawing>
        <b-list-group flush key="reveal">
          <transition-group name="animated-list" appear>
            <b-list-group-item
              v-for="caption in captions"
              :variant="answerVariant(caption)"
              :key="caption.key"
              class="animated-list-item"
            >
              <span class="mb-1">{{ caption.text }}</span>
              <transition-group name="bounce" appear>
                <b-badge
                  v-for="chooserName in caption.chosenBy"
                  :key="chooserName"
                  variant="primary"
                >
                  {{ chooserName }}
                </b-badge>
              </transition-group>
              <transition name="bounce" appear>
                <template v-if="caption.playerName">
                  <b-badge v-if="caption.isOriginal" variant="success">
                    The Truth!
                  </b-badge>
                  <b-badge v-else variant="danger">
                    {{ caption.playerName }}'s Lie!
                  </b-badge>
                </template>
              </transition>
            </b-list-group-item>
          </transition-group>
        </b-list-group>
      </template>
      <template v-if="state.phase === 'SCORE'">
        <b-list-group flush key="score">
          <transition-group name="animated-list" appear>
            <b-list-group-item
              v-for="data in animatedScores"
              :key="data.playerName"
              class="d-flex justify-content-between align-items-center animated-list-item"
            >
              <span>{{ data.playerName }}</span>
              <b-badge variant="primary" pill>{{ data.score }}</b-badge>
            </b-list-group-item>
          </transition-group>
        </b-list-group>
      </template>
      <template v-if="state.phase === 'FINALSCORE'">
        <b-alert show variant="success">
          <div class="text-center">
            <h4 class="alert-heading" text-align="center">Congratulations</h4>
            <h1>{{ animatedScores[0].playerName }}!</h1>
          </div>
        </b-alert>
        <h1>Final Scoreboard</h1>
        <template v-for="data in animatedScores">
          <b-list-group-item
            class="d-flex justify-content-between align-items-center"
            v-bind:key="data.playerName"
          >
            {{ data.playerName }}
            <b-badge variant="primary" pill>{{ data.score }}</b-badge>
          </b-list-group-item>
        </template>
      </template>
    </div>
  </b-container>
</template>

<script lang="ts">
import { gsap } from 'gsap';
import { fabric } from 'fabric';
import Vue from 'vue';

import ErrorDisplay from './components/ErrorDisplay.vue';
import GalleryDrawing from './components/GalleryDrawing.vue';

let easel: fabric.Canvas | null = null;
let gallery = null;

function setCanvasSize(canvas: fabric.Canvas) {
  // expand canvas to fill remaining screen real estate
  canvas.setDimensions({ width: '100%', height: 'auto' }, { cssOnly: true });

  canvas.setDimensions({ width: 500, height: 500 }, { backstoreOnly: true });
}

async function sleep(time: number) {
  await new Promise((res) => setTimeout(res, time));
}

type Player = {
  name: string;
};

export default Vue.extend({
  name: 'App',
  components: {
    ErrorDisplay,
    GalleryDrawing,
  },
  data() {
    return {
      state: {
        name: '',
        gameId: '',
        players: [] as Player[],
        scores: [],
        phase: null,
        isWaiting: null,
        timerDuration: null,
        timeRemaining: null,
        prompt: '',
        viewDrawing: null,
        captions: [],
      },
      // local client state
      editName: false,
      name: '',
      gameId: '',
      caption: '',
      isDrawingPosted: false,
      scores: [], // for local animation
      captions: [], // for local animation
      error: '',
      viteBuildId: import.meta.env.VITE_BUILD_ID,
    };
  },
  sockets: {
    sync(data) {
      this.state = data;
      if (this.state.name) {
        this.name = this.state.name;
      }
    },
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
        // clear old scoreboard
        this.scores = [];

        // sequentially push each score to the scores array
        for (let i = 0; i < this.state.scores.length; i += 1) {
          const row = this.state.scores[i];
          this.scores.push({
            ...row,
            score: row.previousScore,
          });
          await sleep(500);
        }

        await sleep(1000);

        // sequentially update each row that has changed
        const scoresToUpdate = this.scores.filter(
          (row) => row.currentScore !== row.previousScore
        );
        for (let i = 0; i < scoresToUpdate.length; i += 1) {
          const row = scoresToUpdate[i];
          gsap.to(row, {
            duration: 1,
            score: row.currentScore,
          });
          await sleep(500);
        }

        await sleep(1000);

        this.scores.sort((a, b) => b.score - a.score);
      } else if (this.state.scores && !this.scores.length) {
        // only set scores if animation is not in progress
        this.scores = this.state.scores.map((row) => ({
          ...row,
          score: row.currentScore,
        }));
      }

      if (oldState.phase === 'GUESS' && newState.phase === 'REVEAL') {
        // clear old captions list
        this.captions = [];

        // ensure real prompt is the last one
        const captions = this.state.captions.sort((a, b) => {
          if (a.isOriginal) {
            return 1;
          }
          if (b.isOriginal) {
            return -1;
          }
          return 0;
        });

        // reveal each caption separately
        for (let i = 0; i < captions.length; i += 1) {
          const row = captions[i];

          // reveal just the caption text
          const caption = {
            ...row,
            key: row.playerName, // for maintaining consistent DOM changes
            playerName: '', // don't reveal captioner yet
            chosenBy: [], // don't reveal choosers yet
          };
          this.captions.push(caption);

          await sleep(2000);

          // reveal choosers
          for (let j = 0; j < row.chosenBy.length; j += 1) {
            caption.chosenBy.push(row.chosenBy[j]);
            await sleep(1000);
          }

          await sleep(1000);

          // reveal captioner
          caption.playerName = row.playerName;

          await sleep(2000);
        }
      }
    },
    error() {
      // reset error after 5s
      setTimeout(() => {
        this.error = null;
      }, 5000);
    },
  },
  methods: {
    setGameId(val) {
      this.gameId = val.toUpperCase();
    },
    createGame() {
      this.$socket.client.emit('create-game');
    },
    joinGame() {
      this.$socket.client.emit('join-game', this.gameId, ({ error }) => {
        this.error = error;
      });
    },
    leaveGame() {
      this.$socket.client.emit('leave-game');
    },
    setName() {
      if (!this.name.length) {
        return;
      }
      this.$socket.client.emit('set-name', this.name);
      this.editName = false;
    },
    startGame() {
      this.$socket.client.emit('start-game');
    },
    postDrawing() {
      this.isDrawingPosted = true;
      this.$socket.client.emit(
        'post-drawing',
        JSON.stringify(easel),
        ({ error }) => {
          this.error = error;
        }
      );
    },
    postCaption() {
      this.$socket.client.emit('post-caption', this.caption, ({ error }) => {
        this.error = error;
      });
    },
    chooseCaption(caption) {
      this.$socket.client.emit('choose-caption', caption.text, ({ error }) => {
        this.error = error;
      });
    },
    answerVariant(caption) {
      // don't reveal colour until player is shown
      if (!caption.playerName) {
        return null;
      }
      if (caption.isOriginal) {
        return 'success';
      }
      return 'danger';
    },
    playerVariant(player) {
      return player.connected ? 'success' : 'danger';
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
</script>

<style scoped>
[v-cloak] {
  display: none;
}

.canvas-container {
  border: 1px solid rgb(170, 170, 170);
}

.upper-canvas,
.lower-canvas {
  height: 100% !important;
}

.animated-list-item {
  transition: all 1s;
  display: inline-block;
}
.animated-list-enter,
.animated-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.animated-list-leave-active {
  position: absolute;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
