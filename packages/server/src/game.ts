import { Round } from './round';
import { TEST_GAME_ID } from './constants';
import { Turn } from './turn';
import { createLogger, Logger } from './logger';
import { getUniquePrompts } from './promptGenerator';
import { Player } from './player';

const DEFAULT_COUNTDOWN = Number(process.env.DEFAULT_COUNTDOWN || 60);

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
export function gameplan(players: Player[], nRounds: number) {
  // Prompts are ensured to be unique over the whole game
  const prompts = getUniquePrompts(Object.keys(players).length * nRounds);
  const rounds: Round[] = [];

  for (let i = 0, promptIndex = 0; i < nRounds; i += 1) {
    // for each round, create a set of turns equal to the number of players
    const turns: Turn[] = [];
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
  _id: string;
  _players: Player[];
  _scores: {
    [playerId: string]: {
      playerName: string;
      currentScore: number;
      previousScore: number;
    };
  };
  _phase: string;
  _roundNum: number;
  _nRounds: number;
  _timerDuration: number;
  _timeRemaining: number;
  _gameplan?: Round[];
  _timer?: NodeJS.Timeout;
  log: Logger;

  constructor(id) {
    this._id = id;
    this._players = [];
    this._scores = {};
    this._phase = PHASES.LOBBY; // defines which phase of the game we're in
    this._roundNum = 0; // defines which round is currently being played
    this._nRounds = 3;
    this._timerDuration = 0;
    this._timeRemaining = 0;
    this.log = createLogger(this._id);
  }

  getId() {
    return this._id;
  }

  addPlayer(player: Player) {
    this._players.push(player);
    this.sync();
  }

  removePlayer(player: Player) {
    this._players = this._players.filter((p) => p !== player);
    this.sync();
  }

  // output a list of all the players in the specified game
  getPlayers() {
    return this._players.map((player) => ({
      name: player.getName(),
      connected: !!player.getSocket(),
    }));
  }

  getPhase() {
    return this._phase;
  }

  getCurrentRound() {
    if (!this._gameplan) {
      return null;
    }
    return this._gameplan[this._roundNum];
  }

  getCurrentTurn() {
    return this.getCurrentRound()?.getCurrentTurn();
  }

  // get the prompt for a specific player for the current round
  getPrompt(player) {
    const round = this.getCurrentRound();
    if (!round) {
      return undefined;
    }
    const turn = round.getTurnByArtist(player);
    return turn?.getPrompt();
  }

  // get the current drawing to be either captioned or guessed for the current turn
  getViewDrawing() {
    this.log('getViewDrawing');
    const round = this.getCurrentRound();
    if (!round) {
      this.log('getViewDrawing:getCurrentRound returned null');
      return null;
    }
    return round.getCurrentTurn().getDrawing();
  }

  // get the captions from the current turn
  getCaptions() {
    if (this.getCurrentRound()) {
      return this.getCurrentTurn()
        ?.getCaptions()
        .map((caption) => {
          return {
            playerName: caption.getPlayer().getName(),
            text: caption.getText(),
            chosenBy: caption.getChosenBy().map((chooser) => chooser.getName()),
            isOriginal:
              this.getPhase() === PHASES.REVEAL && caption.isOriginal(),
          };
        });
    }
    return null;
  }

  getScores() {
    // return array of sorted player scores and names ready to be displayed
    return Object.values(this._scores).sort(
      (a, b) => b.previousScore - a.previousScore
    );
  }

  // returns true if the player has completed their actions for the current game phase
  isPlayerWaiting(player) {
    const round = this.getCurrentRound();
    if (!round) {
      return false;
    }
    const phase = this.getPhase();
    if (phase === PHASES.DRAW) {
      return round.getTurnByArtist(player)?.isDrawingSubmitted();
    }
    if (phase === PHASES.CAPTION) {
      return this.getCurrentTurn()?.hasPlayerSubmittedCaption(player);
    }
    // player should wait if they have selected a caption
    if (phase === PHASES.GUESS) {
      return this.getCurrentTurn()?.hasPlayerChosenCaption(player);
    }
    // otherwise PHASE.REVEAL
    return false;
  }

  getState(player) {
    return {
      gameId: this.getId(),
      players: this.getPlayers(),
      scores: this.getScores(),
      phase: this.getPhase(),
      isWaiting: this.isPlayerWaiting(player),
      timerDuration: this._timerDuration,
      timeRemaining: this._timeRemaining,
      prompt: this.getPrompt(player),
      viewDrawing: this.getViewDrawing(),
      captions: this.getCaptions(),
    };
  }

  isPermanent() {
    return this._id === TEST_GAME_ID;
  }

  start() {
    if (this._players.length > 6) {
      this._nRounds = 1;
    } else if (this._players.length > 4) {
      this._nRounds = 2;
    }

    this._gameplan = gameplan(this._players, this._nRounds);

    this.initialiseScores();

    this.log('starting game');
    this.log(this._gameplan);

    this.startDrawPhase();
  }

  initialiseScores() {
    this._players.forEach((player) => {
      this._scores[player.getId()] = {
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
    this._timerDuration = seconds;
    this._timeRemaining = seconds;
    this.sync();

    // cancel any existing countdown
    this.cancelCountdown();

    // this timer should be cancelled whenever starting a new phase
    this._timer = setInterval(() => {
      this._timeRemaining -= 1;
      this.sync();

      if (this._timeRemaining === 0) {
        final.call(this);
      }
    }, 1000);
  }

  cancelCountdown() {
    if (this._timer) {
      clearInterval(this._timer);
    }
  }

  destroy() {
    this.log('destroying game');
    this.cancelCountdown();
  }

  startDrawPhase() {
    this.cancelCountdown();
    this._phase = PHASES.DRAW;
    this.startCountdown(this.startCaptionPhase);
  }

  // submit a drawing for a player in the current round
  postDrawing(player: Player, drawing: string) {
    const round = this.getCurrentRound();
    const turn = round?.getTurnByArtist(player);
    if (!turn) {
      return {
        error: 'current turn does not exist',
      };
    }
    turn.submitDrawing(drawing);

    this.log(`wow ${player.getId().substring(1, 6)}, thats beautiful!`);
    if (round?.allDrawingsIn()) {
      this.log('all the artwork has been collected');
      this.startCaptionPhase();
    }
    return {};
  }

  startCaptionPhase() {
    this.cancelCountdown();

    if (!this.getCurrentRound()?.allDrawingsIn()) {
      this.log('Caption phase started but not all drawings in');
    }
    this._phase = PHASES.CAPTION;
    this.startCountdown(this.startGuessPhase);
  }

  // submit a caption for a player in the current turn
  postCaption(caption) {
    const turn = this.getCurrentTurn();
    if (!turn) {
      return {
        error: 'invalid turn',
      };
    }
    const { error } = turn.submitCaption(caption);
    if (error) {
      return { error };
    }

    if (turn.allCaptionsIn()) {
      this.log('all captions are in: ', turn._captions);
      this.startGuessPhase();
    }

    return {};
  }

  startGuessPhase() {
    this.cancelCountdown();
    this._phase = PHASES.GUESS;
    this.startCountdown(this.startRevealPhase);
  }

  chooseCaption(player: Player, captionText: string) {
    this.log('chooseCaption');
    const turn = this.getCurrentTurn();
    if (!turn) {
      return {};
    }
    const res = turn.chooseCaptionByText(player, captionText);

    if (turn.allPlayersChosen()) {
      this.startRevealPhase();
    }

    return res;
  }

  startRevealPhase() {
    this.cancelCountdown();
    this._phase = PHASES.REVEAL;
    const captions = this.getCaptions();
    if (!captions) {
      throw new Error('No captions found');
    }

    // Calculate time required to display the animation; make it a multiple of 5
    const animationDuration = captions.length * 4 + this._players.length + 1;
    const timerDuration = 5 * Math.ceil(animationDuration / 5);

    this.startCountdown(this.startScorePhase, timerDuration);
  }

  startScorePhase() {
    this.cancelCountdown();
    this._phase = PHASES.SCORE;

    // save each players previous score
    Object.entries(this._scores).forEach(([playerId, row]) => {
      this._scores[playerId].previousScore = row.currentScore;
    });

    // assign points
    const turn = this.getCurrentTurn();
    if (!turn) {
      throw new Error('Turn does not exist');
    }
    turn.getCaptions().forEach((caption) => {
      const choosers = caption.getChosenBy();

      // caption is correct, award points to artist for every chooser, and every chooser
      if (caption.isOriginal()) {
        if (choosers.length > 0) {
          const artist = turn.getArtist();
          this._scores[artist.getId()].currentScore += 1000;
        }

        choosers.forEach((chooser) => {
          this._scores[chooser.getId()].currentScore += 500;
        });
      } else {
        const captioner = caption.getPlayer();
        // caption is incorrect, award points to captioner for every chooser
        this._scores[captioner.getId()].currentScore +=
          500 * caption.getChosenBy().length;
      }
    });

    this.startCountdown(this.advance, 10);
  }

  startFinalScorePhase() {
    this.cancelCountdown();
    this._phase = PHASES.FINALSCORE;
    this.sync();
  }

  advance() {
    // advance to next turn or round
    const round = this.getCurrentRound();
    if (round) {
      if (round.isOver()) {
        round.advance();
        this.startCaptionPhase();
      } else if (this._roundNum === this._nRounds - 1) {
        this.startFinalScorePhase();
      } else {
        this._roundNum += 1;
        this.startDrawPhase();
      }
    }
  }

  // syncs players state for all players in the game
  sync() {
    this.log('syncing all players, current game plan:');
    this.log(this._gameplan);

    this._players.forEach((player) => {
      player.sync();
    });
  }
}
