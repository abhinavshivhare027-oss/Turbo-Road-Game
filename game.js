const game = document.getElementById("game");
const player = document.getElementById("player");
const objects = document.getElementById("objects");

const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const livesEl = document.getElementById("lives");
const speedEl = document.getElementById("speed");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const boostBtn = document.getElementById("boostBtn");

let running = false;
let paused = false;

let score = 0;
let coins = 0;
let lives = 3;

let playerX = 50;

let speed = 3;
let boost = false;

let spawnTimer = 0;
let lastTime = 0;

let invincibleUntil = 0;

const keys = {
  left: false,
  right: false
};


/* =========================
   CREATE PLAYER CAR
========================= */

player.innerHTML = `
  <div class="racing-car">
    <div class="car-window"></div>
    <div class="car-light left-light"></div>
    <div class="car-light right-light"></div>
    <div class="wheel left-wheel"></div>
    <div class="wheel right-wheel"></div>
  </div>
`;


/* =========================
   RESET
========================= */

function resetGame() {

  score = 0;
  coins = 0;
  lives = 3;

  playerX = 50;

  speed = 3;
  boost = false;

  spawnTimer = 25;
  invincibleUntil = 0;

  objects.innerHTML = "";

  player.style.left = playerX + "%";
  player.style.opacity = "1";

  updateHUD();
}


/* =========================
   HUD
========================= */

function updateHUD() {

  scoreEl.textContent = Math.floor(score);

  coinsEl.textContent = coins;

  livesEl.textContent = lives;

  speedEl.textContent =
    Math.max(1, Math.floor(speed / 3));
}


/* =========================
   START
========================= */

function startGame() {

  cancelAnimationFrame(lastFrame);

  resetGame();

  running = true;
  paused = false;

  startScreen.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  lastTime = performance.now();

  lastFrame =
    requestAnimationFrame(gameLoop);
}

let lastFrame;


/* =========================
   GAME OVER
========================= */

function gameOver() {

  running = false;

  boost = false;

  document.getElementById("finalScore").textContent =
    Math.floor(score);

  document.getElementById("finalCoins").textContent =
    coins;

  gameOverScreen.classList.remove("hidden");
}


/* =========================
   SPAWN TRAFFIC
========================= */

function spawnTraffic() {

  const car = document.createElement("div");

  car.className = "traffic-car";

  const colors = [
    "red",
    "blue",
    "yellow",
    "green"
  ];

  const color =
    colors[Math.floor(Math.random() * colors.length)];

  car.classList.add(color);

  car.innerHTML = `
    <div class="traffic-window"></div>
    <div class="traffic-wheel left-wheel"></div>
    <div class="traffic-wheel right-wheel"></div>
  `;

  /*
    3 lanes
  */

  const lane =
    Math.floor(Math.random() * 3);

  const lanePositions = [28, 50, 72];

  const x = lanePositions[lane];

  car.style.left = x + "%";
  car.style.top = "-90px";

  car.dataset.x = x;
  car.dataset.y = -90;

  car.dataset.type = "traffic";

  objects.appendChild(car);
}


/* =========================
   SPAWN COIN
========================= */

function spawnCoin() {

  const coin = document.createElement("div");

  coin.className = "game-coin";

  coin.textContent = "★";

  const lane =
    Math.floor(Math.random() * 3);

  const lanePositions = [28, 50, 72];

  const x = lanePositions[lane];

  coin.style.left = x + "%";
  coin.style.top = "-50px";

  coin.dataset.x = x;
  coin.dataset.y = -50;

  coin.dataset.type = "coin";

  objects.appendChild(coin);
}


/* =========================
   REAL COLLISION
========================= */

function isColliding(obj) {

  const gameWidth = game.clientWidth;
  const gameHeight = game.clientHeight;

  const playerWidth = 54;
  const playerHeight = 70;

  const playerLeft =
    (playerX / 100) * gameWidth -
    playerWidth / 2;

  const playerTop =
    gameHeight * 0.86;

  const objectX =
    (parseFloat(obj.dataset.x) / 100) *
    gameWidth;

  const objectY =
    parseFloat(obj.dataset.y);

  const objectWidth = 48;
  const objectHeight = 62;

  const objectLeft =
    objectX -
    objectWidth / 2;

  /*
    Simple rectangle collision
  */

  return (
    playerLeft <
      objectLeft + objectWidth - 8 &&

    playerLeft + playerWidth >
      objectLeft + 8 &&

    playerTop <
      objectY + objectHeight - 8 &&

    playerTop + playerHeight >
      objectY + 8
  );
}


/* =========================
   PLAYER HIT
========================= */

function playerHit() {

  const now = performance.now();

  /*
    Prevent instant repeated hits
  */

  if (now < invincibleUntil) {
    return;
  }

  lives--;

  invincibleUntil =
    now + 1000;

  /*
    Blink effect
  */

  player.style.opacity = "0.35";

  setTimeout(() => {

    if (running) {
      player.style.opacity = "1";
    }

  }, 180);

  setTimeout(() => {

    if (running) {
      player.style.opacity = "0.35";
    }

  }, 360);

  setTimeout(() => {

    if (running) {
      player.style.opacity = "1";
    }

  }, 540);

  updateHUD();

  if (lives <= 0) {

    gameOver();
  }
}


/* =========================
   GAME LOOP
========================= */

function gameLoop(time) {

  if (!running) {
    return;
  }

  if (paused) {

    lastTime = time;

    lastFrame =
      requestAnimationFrame(gameLoop);

    return;
  }

  let delta =
    (time - lastTime) / 16.67;

  delta =
    Math.min(delta, 2);

  lastTime = time;


  /* SCORE */

  score +=
    0.10 *
    delta *
    (boost ? 1.5 : 1);


  /* SPEED */

  speed +=
    0.001 *
    delta;

  speed =
    Math.min(speed, 7);


  const currentSpeed =
    boost
      ? speed * 1.6
      : speed;


  /* PLAYER */

  if (keys.left) {

    playerX -=
      1.0 *
      delta;
  }

  if (keys.right) {

    playerX +=
      1.0 *
      delta;
  }


  /*
    Keep car inside road
  */

  playerX =
    Math.max(
      19,
      Math.min(81, playerX)
    );

  player.style.left =
    playerX + "%";


  /* SPAWN */

  spawnTimer -= delta;

  if (spawnTimer <= 0) {

    /*
      Traffic is more common
    */

    if (Math.random() < 0.82) {

      spawnTraffic();

    } else {

      spawnCoin();
    }

    spawnTimer =
      Math.max(
        32,
        55 - speed * 3
      );
  }


  /* MOVE OBJECTS */

  [...objects.children].forEach(obj => {

    let y =
      parseFloat(obj.dataset.y);

    y +=
      currentSpeed *
      delta;

    obj.dataset.y = y;

    obj.style.top =
      y + "px";


    /* COLLISION */

    if (isColliding(obj)) {

      if (
        obj.dataset.type === "coin"
      ) {

        coins++;

        score += 10;

        obj.remove();

        return;
      }


      if (
        obj.dataset.type === "traffic"
      ) {

        playerHit();

        obj.remove();

        return;
      }
    }


    /*
      Remove when outside
    */

    if (
      y >
      game.clientHeight + 100
    ) {

      obj.remove();
    }

  });


  updateHUD();

  lastFrame =
    requestAnimationFrame(gameLoop);
}


/* =========================
   PAUSE
========================= */

function togglePause() {

  if (!running) {
    return;
  }

  paused = !paused;

  if (paused) {

    pauseScreen.classList.remove(
      "hidden"
    );

  } else {

    pauseScreen.classList.add(
      "hidden"
    );
  }
}


/* =========================
   MOBILE CONTROLS
========================= */

function holdButton(button, direction) {

  button.addEventListener(
    "pointerdown",
    function(event) {

      event.preventDefault();

      keys[direction] = true;
    }
  );

  button.addEventListener(
    "pointerup",
    function(event) {

      event.preventDefault();

      keys[direction] = false;
    }
  );

  button.addEventListener(
    "pointercancel",
    function() {

      keys[direction] = false;
    }
  );

  button.addEventListener(
    "pointerleave",
    function() {

      keys[direction] = false;
    }
  );
}

holdButton(leftBtn, "left");
holdButton(rightBtn, "right");


/* =========================
   BOOST
========================= */

boostBtn.addEventListener(
  "pointerdown",
  function(event) {

    event.preventDefault();

    boost = true;
  }
);

boostBtn.addEventListener(
  "pointerup",
  function(event) {

    event.preventDefault();

    boost = false;
  }
);

boostBtn.addEventListener(
  "pointercancel",
  function() {

    boost = false;
  }
);

boostBtn.addEventListener(
  "pointerleave",
  function() {

    boost = false;
  }
);


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
  "keydown",
  function(event) {

    const key =
      event.key.toLowerCase();

    if (
      key === "arrowleft" ||
      key === "a"
    ) {

      keys.left = true;
    }

    if (
      key === "arrowright" ||
      key === "d"
    ) {

      keys.right = true;
    }

    if (
      event.code === "Space"
    ) {

      boost = true;
    }

    if (
      key === "p"
    ) {

      togglePause();
    }
  }
);


document.addEventListener(
  "keyup",
  function(event) {

    const key =
      event.key.toLowerCase();

    if (
      key === "arrowleft" ||
      key === "a"
    ) {

      keys.left = false;
    }

    if (
      key === "arrowright" ||
      key === "d"
    ) {

      keys.right = false;
    }

    if (
      event.code === "Space"
    ) {

      boost = false;
    }
  }
);


/* =========================
   BUTTONS
========================= */

startBtn.onclick =
  startGame;

restartBtn.onclick =
  startGame;

pauseBtn.onclick =
  togglePause;

resumeBtn.onclick =
  togglePause;


/* INITIAL */

updateHUD();
