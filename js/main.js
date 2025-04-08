import { GAME_MODE, DIFFICULTY, PLAYER } from './constants.js';

import {
  checkWinner,
  getRandomMove,
  getWinningMove,
  getBlockingMove,
  minimaxMove,
  getWinningCombination
} from './gameLogic.js';

import {
  toggleDarkMode,
  highlightWinningSequence,
  updateScoreBoard, 
  showEndGame
} from './ui.js';

// game mode and difficulty variables
let gameMode = GAME_MODE.PVP;
let aiDifficulty = DIFFICULTY.EASY;
let currentPlayer = PLAYER.X;

// player name and score variables
let player1Name = "";
let player2Name = "";
let humanName = "";
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

let boardState = []; // the board state is an array of 9 elements representing each cell

// game options (radio buttons and text inputs)
const gameModeInputs = document.querySelectorAll('input[name="gameMode"]');
const difficultyOptions = document.getElementById('difficultyOptions');
const startGameBtn = document.getElementById('startGameBtn');

// view sections
const setupScreen = document.getElementById('setup');
const gameplayScreen = document.getElementById('gameplay');
const endGameScreen = document.getElementById('endGame');

// game board elements
const statusDiv = document.getElementById('status');
const cells = document.querySelectorAll('.cell');

// end game element
const playAgainBtn = document.getElementById('playAgainBtn');
const backToOptionsBtn = document.getElementById('backToOptionsBtn');

// player name input
const pvpNames = document.getElementById('pvpNames');
const pveNames = document.getElementById('pveNames');

// dark mode toggle switch
const darkModeToggle = document.getElementById('darkModeToggle');
toggleDarkMode(darkModeToggle);

// listen for changes in the game mode radio buttons
gameModeInputs.forEach(input => {
  input.addEventListener('change', (e) => {
    // show difficulty options only for pve
    difficultyOptions.style.display = (e.target.value === GAME_MODE.PVE) ? 'block' : 'none';
    // toggle name fields based on game mode
    if (e.target.value === GAME_MODE.PVE) {
      pveNames.style.display = 'block';
      pvpNames.style.display = 'none';
    } else {
      pveNames.style.display = 'none';
      pvpNames.style.display = 'block';
    }
  });
});

// handle human player moves by clicking on cells
cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const index = cell.getAttribute('data-index');
    // ignore click if cell is taken or game is over
    if (boardState[index] || checkWinner(boardState)) return;
    // update board state and UI for human move
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    updateStatus();

    // process next steps based on game mode
    if (!checkWinner(boardState) && boardState.includes(null)) {
      if (gameMode === GAME_MODE.PVE) {
        // switch turn to AI and schedule the AI move after a delay
        currentPlayer = PLAYER.O;
        updateStatus();
        setTimeout(() => {aiMove();}, 500); // ai thinking delay 
      } else {
        // For pvp, switch player
        currentPlayer = (currentPlayer === PLAYER.X) ? PLAYER.O : PLAYER.X;
        updateStatus();
      }
    }
  });
});

// simulate click when enter is pressed on a cell
cells.forEach(cell => {
  cell.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      cell.click();
    }
  });
});

// start game button: initialize game state and switch screens
startGameBtn.addEventListener('click', () => {
  gameMode = document.querySelector('input[name="gameMode"]:checked').value;
  if (gameMode === GAME_MODE.PVE) {
    aiDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    // read one name only for pve
    humanName = document.getElementById('humanName').value || "Player";
  } else {
    // for pvp, read both player names
    player1Name = document.getElementById('player1Name').value || "Player 1";
    player2Name = document.getElementById('player2Name').value || "Player 2";
  }

  console.log('Game Mode:', gameMode);
  if (gameMode === GAME_MODE.PVE) {
    console.log('Difficulty:', aiDifficulty);
    console.log('Human Name:', humanName, 'Opponent: AI');
  } else {
    console.log('Player 1:', player1Name, 'Player 2:', player2Name);
  }
  updateScoreBoard(gameMode, humanName, player1Name, player2Name, scoreX, scoreO, scoreDraw)

  // initialize game state and transition to gameplay
  initializeBoard();
  setupScreen.style.display = 'none';
  gameplayScreen.style.display = 'block';
});

// play again button that keeps same settings
playAgainBtn.addEventListener('click', () => {
  document.getElementById('banner').style.display = 'none';
  document.getElementById('dimmer').style.display = 'none';
  initializeBoard();
});

// back to options button: return to the setup screen and reset scores
backToOptionsBtn.addEventListener('click', () => {
  // hide the banner and dimmer overlay
  document.getElementById('banner').style.display = 'none';
  document.getElementById('dimmer').style.display = 'none';
  // hide the gameplay screen
  gameplayScreen.style.display = 'none';
  // show the setup screen (main options)
  setupScreen.style.display = 'block';
  // reset the scores
  scoreX = 0;
  scoreO = 0;
  scoreDraw = 0;
  updateScoreBoard(gameMode, humanName, player1Name, player2Name, scoreX, scoreO, scoreDraw)
});

// updates the game status display
// checks for a winner or draw and updates the status message
function updateStatus() {
  const winner = checkWinner(boardState);
  // if there's a winner, highlight the winning combination and show end game
  if (winner) 
  {
    highlightWinningSequence(boardState, getWinningCombination);
    let winnerName;
    if (gameMode === GAME_MODE.PVE) {
      // in pve, X is human, O is AI
      winnerName = (winner === PLAYER.X) ? humanName : "AI";
    } else {
      // in pvp, use player1Name for X and player2Name for O
      winnerName = (winner === PLAYER.X) ? player1Name : player2Name;
    }
    statusDiv.textContent = `Winner: ${winnerName}`;
    statusDiv.className = '';
    setTimeout(() => {
      ({ scoreX, scoreO, scoreDraw } = showEndGame(winnerName, boardState, scoreX, scoreO, scoreDraw));
      updateScoreBoard(gameMode, humanName, player1Name, player2Name, scoreX, scoreO, scoreDraw);
    }, 1000);
  } 
  // if no cells are null, it's a draw
  else if (!boardState.includes(null)) 
  {
    statusDiv.textContent = 'Draw!';
    statusDiv.className = '';
    setTimeout(() => {
      ({ scoreX, scoreO, scoreDraw } = showEndGame('Draw', boardState, scoreX, scoreO, scoreDraw));
      updateScoreBoard(gameMode, humanName, player1Name, player2Name, scoreX, scoreO, scoreDraw);
    }, 1000);
  }
  //  update status message for next move
  else 
  {
    let currentName;
    if (gameMode === GAME_MODE.PVE) {
      currentName = (currentPlayer === PLAYER.X) ? humanName : "AI";
    } else {
      currentName = (currentPlayer === PLAYER.X) ? player1Name : player2Name;
    }
    statusDiv.textContent = `Waiting for ${currentName}'s move...`;
    statusDiv.className = '';
    // add styling based on current player
    if (currentPlayer === PLAYER.X) {
      statusDiv.classList.add('x-turn');
    } 
    else {
      statusDiv.classList.add('o-turn');
    }
  }
}

// resets the board state and UI for a new game
function initializeBoard() {
  boardState = Array(9).fill(null);
  currentPlayer = PLAYER.X; // human always starts as X
  cells.forEach(cell => {
    cell.textContent = '';
    cell.setAttribute('tabindex', '0'); // make each cell focusable
    cell.classList.remove('x', 'o', 'winning-cell'); // remove old color classes
  });
  updateStatus();
}

// determines and executes the AI's move
// uses different strategies based on selected difficulty
function aiMove() {
  if (gameMode !== GAME_MODE.PVE) return;

  let move;
  if (aiDifficulty === DIFFICULTY.EASY) {
    move = getRandomMove(boardState);
  } else if (aiDifficulty === DIFFICULTY.MEDIUM) {
    move = getWinningMove(boardState, currentPlayer) ||
      getBlockingMove(boardState, currentPlayer) ||
      getRandomMove(boardState);
  } else if (aiDifficulty === DIFFICULTY.HARD) {
    move = minimaxMove(boardState);
  }

  if (move !== undefined && boardState[move] === null) {
    boardState[move] = currentPlayer;
    const cell = document.querySelector(`.cell[data-index="${move}"]`);
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    updateStatus();
    // after the AI moves, revert back to the human player if game continues
    if (!checkWinner(boardState) && boardState.includes(null)) {
      currentPlayer = PLAYER.X;
      updateStatus();
    }
  }
}