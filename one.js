/***********************
  ELEMENTS
************************/
/***********************
  SOUND SYSTEM
************************/
const bgMusic = document.getElementById("bgMusic");
const muteBtn = document.getElementById("muteBtn");

let muted = false;
let musicStarted = false;

// initial volume
bgMusic.volume = 0.9;

// browser autoplay fix (start music on first click)
document.body.addEventListener(
  "click",
  () => {
    if (!musicStarted) {
      bgMusic.play().catch(() => {});
      musicStarted = true;
    }
  },
  { once: true }
);

// mute / unmute
muteBtn.addEventListener("click", () => {
  muted = !muted;
  bgMusic.muted = muted;
  muteBtn.textContent = muted ? "🔇" : "🔊";
});

const cells = document.querySelectorAll(".cell");
const resetBtn = document.getElementById("button");
const resetScoreBtn = document.getElementById("resetScore");
const modeBtn = document.getElementById("modeBtn");

const easyBtn = document.getElementById("easyBtn");
const hardBtn = document.getElementById("hardBtn");
const impossibleBtn = document.getElementById("impossibleBtn");

const scoreXEl = document.querySelector(".score span:nth-child(1) b");
const scoreOEl = document.querySelector(".score span:nth-child(2) b");
const highScoreEl = document.getElementById("highScoreValue");
const aiThinkingEl = document.getElementById("aiThinking");

/***********************
  GAME STATE
************************/
let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let gameMode = "AI"; // AI or PVP
let difficulty = "EASY";

/***********************
  SCORES (localStorage)
************************/
let xScore = Number(localStorage.getItem("xScore")) || 0;
let oScore = Number(localStorage.getItem("oScore")) || 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;

scoreXEl.textContent = xScore;
scoreOEl.textContent = oScore;
highScoreEl.textContent = highScore;

/***********************
  WIN PATTERNS
************************/
const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/***********************
  CELL CLICK
************************/
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (board[index] || gameOver) return;

    makeMove(index, currentPlayer);

    if (gameMode === "AI" && !gameOver) {
      currentPlayer = "O";
      showThinking();
      setTimeout(() => {
        aiMove();
        hideThinking();
      }, 500);
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
  });
});

/***********************
  MAKE MOVE
************************/
function makeMove(index, player) {
  board[index] = player;
  cells[index].value = player;
  cells[index].disabled = true;
  checkWinner();
}

/***********************
  AI CONTROLLER
************************/
function aiMove() {
  if (difficulty === "EASY") easyAI();
  else if (difficulty === "HARD") hardAI();
  else impossibleAI();

  currentPlayer = "X";
}

/***********************
  EASY AI
************************/
function easyAI() {
  const empty = board
    .map((v,i) => v === "" ? i : null)
    .filter(v => v !== null);

  makeMove(random(empty), "O");
}

/***********************
  HARD AI
************************/
function hardAI() {
  for (let [a,b,c] of winPatterns)
    if (board[a]==="O" && board[b]==="O" && board[c]==="")
      return makeMove(c,"O");

  for (let [a,b,c] of winPatterns)
    if (board[a]==="X" && board[b]==="X" && board[c]==="")
      return makeMove(c,"O");

  easyAI();
}

/***********************
  IMPOSSIBLE AI (MINIMAX)
************************/
function impossibleAI() {
  let bestScore = -Infinity;
  let move;

  board.forEach((v,i)=>{
    if(v===""){
      board[i]="O";
      let score = minimax(board,false);
      board[i]="";
      if(score > bestScore){
        bestScore = score;
        move = i;
      }
    }
  });

  makeMove(move,"O");
}

function minimax(newBoard, isMax) {
  let result = getResult(newBoard);
  if (result !== null) {
    return result === "O" ? 10 : result === "X" ? -10 : 0;
  }

  let best = isMax ? -Infinity : Infinity;

  newBoard.forEach((v,i)=>{
    if(v===""){
      newBoard[i] = isMax ? "O" : "X";
      let score = minimax(newBoard,!isMax);
      newBoard[i] = "";
      best = isMax ? Math.max(best,score) : Math.min(best,score);
    }
  });

  return best;
}

/***********************
  CHECK WINNER
************************/
function checkWinner() {
  for (let [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameOver = true;
      updateScore(board[a]);
      alert(board[a] + " Wins 🎉");
      return;
    }
  }

  if (board.every(v => v !== "")) {
    gameOver = true;
    alert("Draw 🤝");
  }
}

function getResult(b) {
  for (let [a,b1,c] of winPatterns)
    if (b[a] && b[a]===b[b1] && b[a]===b[c])
      return b[a];
  if (b.every(v=>v)) return "draw";
  return null;
}

/***********************
  SCORE
************************/
function updateScore(winner) {
  if (winner === "X") xScore++;
  else oScore++;

  scoreXEl.textContent = xScore;
  scoreOEl.textContent = oScore;

  localStorage.setItem("xScore",xScore);
  localStorage.setItem("oScore",oScore);

  highScore = Math.max(highScore, xScore, oScore);
  highScoreEl.textContent = highScore;
}

/***********************
  BUTTONS
************************/
resetBtn.onclick = resetBoard;

resetScoreBtn.onclick = () => {
  xScore = oScore = highScore = 0;
  localStorage.clear();
  scoreXEl.textContent = 0;
  scoreOEl.textContent = 0;
  resetBoard();
};

modeBtn.onclick = () => {
  gameMode = gameMode === "AI" ? "PVP" : "AI";
  modeBtn.textContent = gameMode === "AI" ? "PLAY VS AI" : "TWO PLAYERS";
  resetBoard();
};

easyBtn.onclick = () => { difficulty="EASY"; resetBoard(); };
hardBtn.onclick = () => { difficulty="HARD"; resetBoard(); };
impossibleBtn.onclick = () => { difficulty="IMPOSSIBLE"; resetBoard(); };

muteBtn.onclick = () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem("sound", soundEnabled ? "on" : "off");

  soundEnabled ? bgm.play() : bgm.pause();
};
muteBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  if (soundEnabled) {
    bgm.play().catch(() => {});
  } else {
    bgm.pause();
  }
});
/***********************
  RESET
************************/
function resetBoard() {
  board.fill("");
  cells.forEach(c=>{
    c.value="";
    c.disabled=false;
  });
  currentPlayer="X";
  gameOver=false;
  hideThinking();
}

/***********************
  AI UI
************************/
function showThinking() {
  aiThinkingEl.style.display="block";
  cells.forEach(c=>c.disabled=true);
}

function hideThinking() {
  aiThinkingEl.style.display="none";
  cells.forEach((c,i)=>{
    if(board[i]==="") c.disabled=false;
  });
}

function random(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}
function playSound(sound) {
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}