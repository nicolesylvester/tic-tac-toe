import { GAME_MODE, PLAYER} from './constants.js'
import { checkWinner } from './gameLogic.js';

// toggle dark mode style
export function toggleDarkMode(toggleElement) {
    toggleElement.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode', toggleElement.checked);
    });
}

// highlights the cells that form the winning combination
export function highlightWinningSequence(boardState, getWinningCombination) {
  const winCombo = getWinningCombination(boardState);
  if (winCombo) {
    winCombo.forEach(index => {
      const cell = document.querySelector(`.cell[data-index="${index}"]`);
      if (cell) {
        cell.classList.add('winning-cell');
      }
    });
  }
}

// updates the UI scoreboard with current scores
export function updateScoreBoard(gameMode, humanName, player1Name, player2Name, scoreX, scoreO, scoreDraw) {
  if (gameMode === GAME_MODE.PVE) {
    document.getElementById('scoreXValue').textContent = `${humanName}: ${scoreX}`;
    document.getElementById('scoreOValue').textContent = `AI: ${scoreO}`;
  } else {
    document.getElementById('scoreXValue').textContent = `${player1Name}: ${scoreX}`;
    document.getElementById('scoreOValue').textContent = `${player2Name}: ${scoreO}`;
  }
  document.getElementById('scoreDrawValue').textContent = `Draws: ${scoreDraw}`;
}

// shows the end game banner with the result and updates the scores
export function showEndGame(result, boardState, scoreX, scoreO, scoreDraw) {
  const winnerSymbol = checkWinner(boardState);
  if (winnerSymbol === PLAYER.X) {
    scoreX++;
  } else if (winnerSymbol === PLAYER.O) {
    scoreO++;
  } else {
    scoreDraw++;
  }
  const resultDisplay = document.getElementById('result');
  resultDisplay.textContent = (result === 'Draw') ? "It's a Draw!" : `Winner: ${result}`;
  
  const dimmer = document.getElementById('dimmer');
  const banner = document.getElementById('banner');
  dimmer.style.display = 'block';
  banner.style.display = 'block';
  dimmer.classList.add('active');
  banner.classList.add('active');
  return { scoreX, scoreO, scoreDraw };
}