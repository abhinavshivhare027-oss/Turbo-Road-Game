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


/* =========================
   GAME VARIABLES
========================= */

let gameRunning = false;
let gamePaused = false;

let score = 0;
let coins = 0;
let lives = 3;

let playerX = 50;

let speed = 3.2;
let boost = false;

let spawnTimer = 0;
let lastTime = 0;

let animationFrame;

const keys = {
  left: false,
  right: false
};


/* =========================
   ENEMY CARS
========================= */

const enemyCars = [
  "🚗",
  "🚙",
  "🚕",
  "🚓",
  "🚐"
];


/* =========================
   RESET GAME
========================= */

function resetGame() {

  score = 0;
  coins = 0;
  lives = 3;

  playerX = 50;

  speed = 3.2;

  spawnTimer = 0;

  boost = false;

  objects.innerHTML = "";

  player.style.left = playerX + "%";

  updateHUD();
}


/* =========================
   UPDATE HUD
========================= */

function updateHUD() {

  scoreEl.textContent = Math.floor(score);

  coinsEl.textContent = coins;

  livesEl.textContent = lives;

  speedEl.textContent =
    Math.max(1, Math.floor(speed / 3.2));
}


/* =========================
   START GAME
========================= */

function startGame() {

  cancelAnimationFrame(animationFrame);

  resetGame();

  gameRunning = true;

  gamePaused = false;

  startScreen.classList.add("hidden");

  pauseScreen.classList.add("hidden");

  gameOverScreen.classList.add("hidden");

  lastTime = performance.now();

  animationFrame =
    requestAnimationFrame(gameLoop);
}


/* =========================
   GAME OVER
========================= */

function gameOver() {

  gameRunning = false;

  boost = false;

  document.getElementById("finalScore").textContent =
    Math.floor(score);

  document.getElementById("finalCoins").textContent =
    coins;

  gameOverScreen.classList.remove("hidden");
}


/* =========================
   SPAWN OBJECT
========================= */

function spawnObject(type) {

  const element = document.createElement("div");

  if (type === "coin") {

    element.className = "car coin";

    element.textContent = "🪙";

  } else {

    element.className = "car enemy";

    const randomCar =
      enemyCars[
        Math.floor(Math.random() * enemyCars.length)
      ];

    element.textContent = randomCar;
  }


  /*
    THREE ROAD LANES
  */

  const lane =
    Math.floor(Math.random() * 3);


  /*
    Road is approximately
    12% to 88% of screen.
  */

  const lanePosition =
    12 + (lane + 0.5) * (76 / 3);


  element.style.left =
    (lanePosition - 4) + "%";


  element.style.top =
    "-90px";


  element.dataset.y = "-90";

  element.dataset.type = type;


  objects.appendChild(element);
}


/* =========================
   COLLISION
========================= */

function checkCollision(element1, element2) {

  const rect1 =
    element1.getBoundingClientRect();

  const rect2 =
    element2.getBoundingClientRect();


  return (
    rect1.left < rect2.right - 8 &&
    rect1.right > rect2.left + 8 &&
    rect1.top < rect2.bottom - 8 &&
    rect1.bottom > rect2.top + 8
  );
}


/* =========================
   GAME LOOP
========================= */

function gameLoop(currentTime) {

  if (!gameRunning) {
    return;
  }


  if (gamePaused) {

    lastTime = currentTime;

    animationFrame =
      requestAnimationFrame(gameLoop);

    return;
  }


  /*
    Delta time
  */

  let delta =
    (currentTime - lastTime) / 16.67;


  delta =
    Math.min(delta, 2);


  lastTime = currentTime;


  /* =====================
     SCORE
  ===================== */

  score +=
    0.12 *
    delta *
    (boost ? 1.5 : 1);


  /* =====================
     SPEED
  ===================== */

  speed +=
    0.0015 * delta;


  speed =
    Math.min(speed, 8);


  const currentSpeed =
    boost
      ? speed * 1.65
      : speed;


  /* =====================
     PLAYER MOVEMENT
  ===================== */

  if (keys.left) {

    playerX -=
      0.9 *
      delta *
      (boost ? 1.25 : 1);
  }


  if (keys.right) {

    playerX +=
      0.9 *
      delta *
      (boost ? 1.25 : 1);
  }


  /*
    Keep car inside road
  */

  playerX =
    Math.max(
      18,
      Math.min(82, playerX)
    );


  player.style.left =
    playerX + "%";


  /* =====================
     SPAWN TRAFFIC
  ===================== */

  spawnTimer -= delta;


  if (spawnTimer <= 0) {

    const type =
      Math.random() < 0.72
        ? "enemy"
        : "coin";


    spawnObject(type);


    spawnTimer =
      Math.max(18, 42 - speed * 2)
      + Math.random() * 20;
  }


  /* =====================
     MOVE OBJECTS
  ===================== */

  const allObjects =
    [...objects.children];


  allObjects.forEach(element => {

    let y =
      parseFloat(element.dataset.y);


    y +=
      currentSpeed *
      delta;


    element.dataset.y =
      y;


    element.style.top =
      y + "px";


    /* ===================
       COLLISION
    =================== */

    if (
      checkCollision(
        player,
        element
      )
    ) {

      /*
        COIN
      */

      if (
        element.dataset.type === "coin"
      ) {

        coins += 1;

        score += 10;

        element.remove();

      }


      /*
        ENEMY
      */

      else {

        lives -= 1;

        element.remove();


        /*
          Small hit effect
        */

        player.style.transform =
          "translateX(-50%) scale(1.2)";


        setTimeout(() => {

          player.style.transform =
            "translateX(-50%) scale(1)";

        }, 150);


        if (lives <= 0) {

          updateHUD();

          gameOver();

          return;
        }
      }
    }


    /*
      Remove objects
      outside game
    */

    if (
      y >
      game.clientHeight + 100
    ) {

      element.remove();
    }

  });


  updateHUD();


  animationFrame =
    requestAnimationFrame(gameLoop);
}


/* =========================
   PAUSE
========================= */

function togglePause() {

  if (!gameRunning) {
    return;
  }


  gamePaused =
    !gamePaused;


  if (gamePaused) {

    pauseScreen.classList.remove("hidden");

  } else {

    pauseScreen.classList.add("hidden");
  }
}


/* =========================
   MOBILE LEFT BUTTON
========================= */

function holdButton(button, direction) {

  const start = event => {

    event.preventDefault();

    keys[direction] = true;
  };


  const stop = event => {

    event.preventDefault();

    keys[direction] = false;
  };


  button.addEventListener(
    "pointerdown",
    start
  );


  button.addEventListener(
    "pointerup",
    stop
  );


  button.addEventListener(
    "pointercancel",
    stop
  );


  button.addEventListener(
    "pointerleave",
    stop
  );
}


holdButton(
  leftBtn,
  "left"
);


holdButton(
  rightBtn,
  "right"
);


/* =========================
   BOOST BUTTON
========================= */

boostBtn.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

    boost = true;
  }
);


boostBtn.addEventListener(
  "pointerup",
  event => {

    event.preventDefault();

    boost = false;
  }
);


boostBtn.addEventListener(
  "pointercancel",
  () => {

    boost = false;
  }
);


boostBtn.addEventListener(
  "pointerleave",
  () => {

    boost = false;
  }
);


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
  "keydown",
  event => {

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
  event => {

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

startBtn.addEventListener(
  "click",
  startGame
);


restartBtn.addEventListener(
  "click",
  startGame
);


pauseBtn.addEventListener(
  "click",
  togglePause
);


resumeBtn.addEventListener(
  "click",
  togglePause
);


/* =========================
   INITIAL HUD
========================= */

updateHUD();
