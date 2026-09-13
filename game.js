const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const traffic = document.getElementById("traffic");

const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const livesText = document.getElementById("lives");
const speedText = document.getElementById("speed");

const startScreen = document.getElementById("startScreen");
const gameOver = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const boostBtn = document.getElementById("boostBtn");

let running = false;
let score = 0;
let coins = 0;
let lives = 3;
let playerX = 0;
let gameSpeed = 4;
let boost = false;

let enemies = [];
let coinObjects = [];

let keys = {
  left: false,
  right: false
};

function setupPlayer() {
  playerX = gameArea.clientWidth / 2;
  player.style.left = playerX + "px";
}

function startGame() {

  startScreen.classList.add("hidden");
  gameOver.classList.add("hidden");

  score = 0;
  coins = 0;
  lives = 3;
  gameSpeed = 4;

  enemies.forEach(e => e.el.remove());
  coinObjects.forEach(c => c.el.remove());

  enemies = [];
  coinObjects = [];

  scoreText.textContent = "0";
  coinsText.textContent = "0";
  livesText.textContent = "3";
  speedText.textContent = "1";

  setupPlayer();

  running = true;
}

function endGame() {

  running = false;

  finalScore.textContent = score;

  gameOver.classList.remove("hidden");
}

function createEnemy() {

  const el = document.createElement("div");

  const colors = ["red", "blue", "yellow", "green"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  el.className = "traffic " + color;

  const roadLeft = gameArea.clientWidth * 0.10;
  const roadRight = gameArea.clientWidth * 0.90;

  const minX = roadLeft + 15;
  const maxX = roadRight - 65;

  const x = minX + Math.random() * (maxX - minX);

  el.style.left = x + "px";
  el.style.top = "-90px";

  traffic.appendChild(el);

  enemies.push({
    el: el,
    x: x,
    y: -90,
    hit: false
  });
}

function createCoin() {

  const el = document.createElement("div");

  el.className = "coin";
  el.textContent = "★";

  const roadLeft = gameArea.clientWidth * 0.10;
  const roadRight = gameArea.clientWidth * 0.90;

  const x =
    roadLeft +
    25 +
    Math.random() *
    (roadRight - roadLeft - 75);

  el.style.left = x + "px";
  el.style.top = "-40px";

  traffic.appendChild(el);

  coinObjects.push({
    el: el,
    x: x,
    y: -40
  });
}

function collision(a, b) {

  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function checkCollisions(enemy) {

  const p = player.getBoundingClientRect();
  const e = enemy.el.getBoundingClientRect();

  return collision(p, e);
}

function updateEnemies() {

  for (let i = enemies.length - 1; i >= 0; i--) {

    const enemy = enemies[i];

    enemy.y += boost ? gameSpeed + 3 : gameSpeed;

    enemy.el.style.top = enemy.y + "px";

    if (!enemy.hit && checkCollisions(enemy)) {

      enemy.hit = true;

      lives--;

      livesText.textContent = lives;

      enemy.el.remove();

      enemies.splice(i, 1);

      if (lives <= 0) {
        endGame();
        return;
      }

      continue;
    }

    if (enemy.y > gameArea.clientHeight + 100) {

      enemy.el.remove();
      enemies.splice(i, 1);

      score += 10;
      scoreText.textContent = score;
    }
  }
}

function updateCoins() {

  for (let i = coinObjects.length - 1; i >= 0; i--) {

    const coin = coinObjects[i];

    coin.y += boost ? gameSpeed + 3 : gameSpeed;

    coin.el.style.top = coin.y + "px";

    const p = player.getBoundingClientRect();
    const c = coin.el.getBoundingClientRect();

    if (collision(p, c)) {

      coins++;

      score += 25;

      coinsText.textContent = coins;
      scoreText.textContent = score;

      coin.el.remove();
      coinObjects.splice(i, 1);

      continue;
    }

    if (coin.y > gameArea.clientHeight + 50) {

      coin.el.remove();
      coinObjects.splice(i, 1);
    }
  }
}

function movePlayer() {

  const roadLeft = gameArea.clientWidth * 0.10 + 8;
  const roadRight = gameArea.clientWidth * 0.90 - 65;

  if (keys.left) {
    playerX -= 6;
  }

  if (keys.right) {
    playerX += 6;
  }

  if (playerX < roadLeft) {
    playerX = roadLeft;
  }

  if (playerX > roadRight) {
    playerX = roadRight;
  }

  player.style.left = playerX + "px";
}

function gameLoop() {

  if (!running) return;

  movePlayer();
  updateEnemies();
  updateCoins();

  if (Math.random() < 0.018) {
    createEnemy();
  }

  if (Math.random() < 0.008) {
    createCoin();
  }

  score++;

  scoreText.textContent = score;

  gameSpeed = Math.min(8, 4 + Math.floor(score / 1000));

  speedText.textContent = gameSpeed - 3;

  requestAnimationFrame(gameLoop);
}

function holdButton(button, direction) {

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    keys[direction] = true;
  });

  button.addEventListener("pointerup", e => {
    e.preventDefault();
    keys[direction] = false;
  });

  button.addEventListener("pointercancel", () => {
    keys[direction] = false;
  });

  button.addEventListener("pointerleave", () => {
    keys[direction] = false;
  });
}

holdButton(leftBtn, "left");
holdButton(rightBtn, "right");

boostBtn.addEventListener("pointerdown", e => {
  e.preventDefault();
  boost = true;
});

boostBtn.addEventListener("pointerup", e => {
  e.preventDefault();
  boost = false;
});

boostBtn.addEventListener("pointerleave", () => {
  boost = false;
});

document.addEventListener("keydown", e => {

  if (e.key === "ArrowLeft") {
    keys.left = true;
  }

  if (e.key === "ArrowRight") {
    keys.right = true;
  }

  if (e.key === " ") {
    boost = true;
  }
});

document.addEventListener("keyup", e => {

  if (e.key === "ArrowLeft") {
    keys.left = false;
  }

  if (e.key === "ArrowRight") {
    keys.right = false;
  }

  if (e.key === " ") {
    boost = false;
  }
});

startBtn.addEventListener("click", () => {

  startGame();

  requestAnimationFrame(gameLoop);
});

restartBtn.addEventListener("click", () => {

  startGame();

  requestAnimationFrame(gameLoop);
});

window.addEventListener("resize", () => {

  if (!running) {
    setupPlayer();
  }
});

setupPlayer();
