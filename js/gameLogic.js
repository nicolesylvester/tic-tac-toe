import { PLAYER } from "./constants.js";

// each sub-array represents a set of indices that form a winning line
export const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// checks the current board state for a winner
export function checkWinner(boardState) {
  // loop through each winning combination
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    // check if the board cells at these indices are equal and not null
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a]; // return the winner
    }
  }
  return null; // no winner found
}

// chooses a random move from the available cells
export function getRandomMove(boardState) {
  // map over boardState to get indices where cell is null (available)
  const availableMoves = boardState
    .map((val, index) => (val === null ? index : null))
    .filter(v => v !== null);
  // return a random index from available moves
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// finds a move that will allow the current player to win
export function getWinningMove(boardState, currentPlayer) {
  // loop through cells in the board
  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === null) {
      // temporarily set this cell for current player
      boardState[i] = currentPlayer;
      // check if this move causes the current player to win
      if (checkWinner(boardState) === currentPlayer) {
        boardState[i] = null; // reset cell
        return i;  // return this winning move index
      }
      boardState[i] = null; // reset cell if not a winning move
    }
  }
  return null; // no winning move
}

// finds a move that will block the opponent from winning
export function getBlockingMove(boardState, currentPlayer) {
  const opponent = currentPlayer === PLAYER.X ? PLAYER.O : PLAYER.X;
  // loop through cells in the board
  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === null) {
      // temporarily set this cell for the opponent
      boardState[i] = opponent;
      // check if the opponent would win with this move
      if (checkWinner(boardState) === opponent) {
        boardState[i] = null; // reset the cell
        return i; // return this move as a blocking move
      }
      boardState[i] = null; // reset the cell if not blocking
    }
  }
  return null; // no blocking move found
}

// implements the minimax algorithm to determine the best move for AI
export function minimax(newBoard, player) {
  const availSpots = [];
  // collect all indices of available cells
  for (let i = 0; i < newBoard.length; i++) {
    if (newBoard[i] === null) availSpots.push(i);
  }

  // evaluate the board for a terminal state
  let winner = checkWinnerFromBoard(newBoard);
  if (winner === PLAYER.O) return { score: 10 };
  else if (winner === PLAYER.X) return { score: -10 };
  else if (availSpots.length === 0) return { score: 0 };

  const moves = [];
  // loop through available spots and simulate moves
  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player; // try the move

    // evaluate move for the opponent
    if (player === PLAYER.O) {
      const result = minimax(newBoard, PLAYER.X);
      move.score = result.score;
    } else {
      const result = minimax(newBoard, PLAYER.O);
      move.score = result.score;
    }
    newBoard[availSpots[i]] = null; // undo move
    moves.push(move);
  }

  // choose the best move based on the player
  let bestMove;
  if (player === PLAYER.O) {
    let bestScore = -Infinity;
    for (const move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }
  return bestMove;
}

// uses the minimax algorithm to get the best move index
export function minimaxMove(boardState) {
  // use copy of the board to avoid modifying the original state
  const bestMove = minimax(boardState.slice(), PLAYER.O);
  return bestMove.index;
}

// returns the winning combination indices if present
export function getWinningCombination(boardState) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return combo;
    }
  }
  return null;
}

// checks for a winner given a specific board 
export function checkWinnerFromBoard(board) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}