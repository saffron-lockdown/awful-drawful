import { Round } from './round';
import { Turn } from './turn';
import { createLogger } from './logger';
import { getUniquePrompts } from './promptGenerator';

const DEFAULT_COUNTDOWN = Number(process.env.DEFAULT_COUNTDOWN || 30);

const PHASES = {
  LOBBY: 'LOBBY',
  DRAW: 'DRAW',
  CAPTION: 'CAPTION',
  GUESS: 'GUESS',
  REVEAL: 'REVEAL',
  SCORE: 'SCORE',
  FINALSCORE: 'FINALSCORE',
};

// return a plan of the game based on the number
// of rounds and players.
// each round has one object per player. The object contains
// the player id, prompt, and spaces for the image and captions.
export function gameplan(players, nRounds) {
  // Prompts are ensured to be unique over the whole game
  const prompts = getUniquePrompts(Object.keys(players).length * nRounds);
  const rounds = [];

  for (let i = 0, promptIndex = 0; i < nRounds; i += 1) {
    // for each round, create a set of turns equal to the number of players
    const turns = [];
    for (let j = 0; j < players.length; j += 1) {
      turns.push(new Turn(players.length, players[j], prompts[promptIndex]));
      promptIndex += 1;
    }
    const round = new Round(turns);

    rounds.push(round);
  }
  return rounds;
}

export class Game {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.scores = {};
    this.phase = PHASES.LOBBY; // defines which phase of the game we're in
    this.roundNum = 0; // defines which round is currently being played
    this.nRounds = 3;
    this.log = createLogger(this.id);
    this.timer = null;
  }

  addPlayer(player) {
    this.players.push(player);
    this.sync();
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => p !== player);
    this.sync();
  }

  // output a list of all the players in the specified game
  getPlayers() {
    return this.players.map((player) => ({
      name: player.getName(),
      connected: !!player.getSocket(),
    }));
  }

  getPhase() {
    return this.phase;
  }

  getCurrentRound() {
    if (!this.gameplan) {
      return null;
    }
    return this.gameplan[this.roundNum];
  }

  getCurrentTurn() {
    this.log('getCurrentTurn');
    return this.getCurrentRound().getCurrentTurn();
  }

  getTimeRemaining() {
    return this.timeRemaining;
  }

  getTimerDuration() {
    return this.timerDuration;
  }

  // get the prompt for a specific player for the current round
  getPrompt(player) {
    this.log('getPrompt');
    const round = this.getCurrentRound();
    if (!round) {
      return null;
    }
    const turn = round.getTurnByArtist(player);
    return turn.getPrompt();
  }

  // get the current drawing to be either captioned or guessed for the current turn
  getViewDrawing() {
    this.log('getViewDrawing');
    const round = this.getCurrentRound();
    if (!round) {
      return null;
    }
    return this.getCurrentTurn().getDrawing();
  }

  // get the captions from the current turn
  getCaptions() {
    this.log('getCaptions');
    const round = this.getCurrentRound();
    if (!round) {
      return null;
    }
    return round
      .getCurrentTurn()
      .getCaptions()
      .map((caption) => {
        return {
          playerName: caption.getPlayer().getName(),
          text: caption.getText(),
          chosenBy: caption.getChosenBy().map((chooser) => chooser.getName()),
        };
      });
  }

  getRealPrompt() {
    this.log('getRealPrompt');
    const round = this.getCurrentRound();
    if (!round || this.getPhase() !== PHASES.REVEAL) {
      return null;
    }

    return round.getCurrentTurn().getPrompt();
  }

  getScores() {
    // return array of sorted player scores and names ready to be displayed
    return Object.values(this.scores).sort(
      (a, b) => b.previousScore - a.previousScore
    );
  }

  // returns true if the player has completed their actions for the current game phase
  isPlayerWaiting(player) {
    this.log('isPlayerWaiting');
    const round = this.getCurrentRound();
    if (!round) {
      return false;
    }
    const phase = this.getPhase();
    if (phase === PHASES.DRAW) {
      return round.getTurnByArtist(player).isDrawingSubmitted();
    }
    if (phase === PHASES.CAPTION) {
      return this.getCurrentTurn().hasPlayerSubmittedCaption(player);
    }
    // player should wait if they have selected a caption
    if (phase === PHASES.GUESS) {
      return this.getCurrentTurn().hasPlayerChosenCaption(player);
    }
    // otherwise PHASE.REVEAL
    return false;
  }

  start() {
    if (this.players.length > 6) {
      this.nrounds = 1;
    } else if (this.players.length > 4) {
      this.nrounds = 2;
    }

    this.gameplan = gameplan(this.players, this.nRounds);

    this.initialiseScores();

    this.log('starting game');
    this.log(this.gameplan);
    // this.startDrawingPhase();
    this.startRevealPhase();
  }

  initialiseScores() {
    this.players.forEach((player) => {
      this.scores[player.getId()] = {
        playerName: player.getName(),
        currentScore: 0,
        previousScore: 0,
      };
    });
  }

  // kicks off a countdown which calls sync every second, until either:
  // 1. the countdown is cancelled
  // 2. the countdown reaches 0. final is then executed
  startCountdown(final, seconds = DEFAULT_COUNTDOWN) {
    // start a timer
    this.timerDuration = seconds;
    this.timeRemaining = seconds;
    this.sync();

    // cancel any existing countdown
    this.cancelCountdown();

    // this timer should be cancelled whenever starting a new phase
    this.timer = setInterval(() => {
      this.timeRemaining -= 1;
      this.sync();

      if (this.timeRemaining === 0) {
        final.call(this);
      }
    }, 1000);
  }

  cancelCountdown() {
    clearInterval(this.timer);
  }

  startDrawingPhase() {
    this.phase = PHASES.DRAW;

    this.startCountdown(this.startCaptioningPhase);
  }

  // submit a drawing for a player in the current round
  postDrawing(player, drawing) {
    const round = this.getCurrentRound();
    const turn = round.getTurnByArtist(player);
    turn.submitDrawing(drawing);

    this.log(`wow ${player.getId().substring(1, 6)}, thats beautiful!`);
    if (round.allDrawingsIn()) {
      this.log('all the artwork has been collected');
      this.startCaptioningPhase();
    }
  }

  startCaptioningPhase() {
    this.cancelCountdown();
    this.phase = PHASES.CAPTION;
    this.log('Time to caption these masterpieces!');

    this.startCountdown(this.startGuessingPhase);
  }

  // submit a caption for a player in the current turn
  postCaption(caption) {
    const turn = this.getCurrentTurn();
    turn.submitCaption(caption);

    if (turn.allCaptionsIn()) {
      this.log('all captions are in: ', turn.captions);
      this.startGuessingPhase();
    }
  }

  startGuessingPhase() {
    this.cancelCountdown();
    this.phase = PHASES.GUESS;
    this.log('Guess the correct caption!');

    this.startCountdown(this.startRevealPhase);
  }

  chooseCaption(player, captionText) {
    this.log('chooseCaption');
    const turn = this.getCurrentTurn();
    turn.chooseCaptionByText(player, captionText);

    if (turn.allPlayersChosen()) {
      this.startRevealPhase();
    }
  }

  startRevealPhase() {
    this.cancelCountdown();
    this.phase = PHASES.REVEAL;
    this.log('revealing real prompt!');

    this.sync();
    // this.startCountdown(this.startScorePhase, 10);
  }

  startScorePhase() {
    this.cancelCountdown();
    this.phase = PHASES.SCORE;

    // save each players previous score
    Object.entries(this.scores).forEach(([playerId, row]) => {
      this.scores[playerId].previousScore = row.currentScore;
    });

    // assign points
    const turn = this.getCurrentTurn();
    turn.getCaptions().forEach((caption) => {
      const captioner = caption.getPlayer();
      const artist = turn.getArtist();
      const choosers = caption.getChosenBy();

      // caption is correct, award points to artist for every chooser, and every chooser
      if (captioner === artist) {
        if (choosers.length > 0) {
          this.scores[artist.getId()].currentScore += 1000;
        }

        choosers.forEach((chooser) => {
          this.scores[chooser.getId()].currentScore += 500;
        });
      } else {
        // caption is incorrect, award points to captioner for every chooser
        this.scores[captioner.getId()].currentScore +=
          500 * caption.getChosenBy().length;
      }
    });

    this.sync();
    this.startCountdown(this.advance, 10);
  }

  startFinalScorePhase() {
    this.phase = PHASES.FINALSCORE;
    this.cancelCountdown();
    this.sync();
  }

  advance() {
    // advance to next turn or round
    if (!this.getCurrentRound().isOver()) {
      this.getCurrentRound().advance();
      this.startCaptioningPhase();
    } else if (this.roundNum === this.nRounds - 1) {
      this.startFinalScorePhase();
    } else {
      this.roundNum += 1;
      this.startDrawingPhase();
    }
  }

  // syncs players state for all players in the game
  sync() {
    this.log('syncing all players, current game plan:');
    this.log(this.gameplan);
    this.players.forEach((player) => {
      player.sync();
    });
  }
}
