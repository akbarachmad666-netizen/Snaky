const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
const size = 600;

let snake, direction, food, score, level, game, speed;
let obstacles = [];

// START GAME
function startGame() {
  snake = [{ x: 300, y: 300 }];
  direction = "RIGHT";
  score = 0;
  level = 1;

  obstacles = generateMap(level);
  food = spawnFood();

  speed = parseInt(document.getElementById("difficulty").value);

  clearInterval(game);
  game = setInterval(draw, speed);

  document.addEventListener("keydown", changeDirection);
}

// FOOD (aman, gak nabrak apa-apa)
function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * (size / box)) * box,
      y: Math.floor(Math.random() * (size / box)) * box
    };
  } while (collision(pos, snake) || collision(pos, obstacles));

  return pos;
}

// MAP DESIGN (SELALU ADA GAP)
function generateMap(level) {
  let obs = [];

  // Level 2: vertical wall
  if (level === 2) {
    let gap = randomGrid();
    for (let y = 0; y < size; y += box) {
      if (y !== gap) obs.push({ x: 300, y });
    }
  }

  // Level 3: horizontal wall
  if (level === 3) {
    let gap = randomGrid();
    for (let x = 0; x < size; x += box) {
      if (x !== gap) obs.push({ x, y: 300 });
    }
  }

  // Level 4–6: cross
  if (level >= 4 && level <= 6) {
    let gap1 = randomGrid();
    let gap2 = randomGrid();

    for (let i = 0; i < size; i += box) {
      if (i !== gap1) obs.push({ x: 300, y: i });
      if (i !== gap2) obs.push({ x: i, y: 300 });
    }
  }

  // Level 7+: maze ringan
  if (level >= 7) {
    for (let x = 100; x <= 500; x += 200) {
      let gap = randomGrid();
      for (let y = 0; y < size; y += box) {
        if (y !== gap) obs.push({ x, y });
      }
    }
  }

  return obs;
}

function randomGrid() {
  return Math.floor(Math.random() * (size / box)) * box;
}

// DRAW
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, size, size);

  // obstacles
  ctx.fillStyle = "gray";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, box, box));

  // snake
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    ctx.fillRect(seg.x, seg.y, box, box);

    // HEAD WITH DIRECTION 👀
    if (i === 0) {
      ctx.fillStyle = "black";

      if (direction === "RIGHT") {
        ctx.fillRect(seg.x + 12, seg.y + 5, 3, 3);
        ctx.fillRect(seg.x + 12, seg.y + 12, 3, 3);
      }
      if (direction === "LEFT") {
        ctx.fillRect(seg.x + 5, seg.y + 5, 3, 3);
        ctx.fillRect(seg.x + 5, seg.y + 12, 3, 3);
      }
      if (direction === "UP") {
        ctx.fillRect(seg.x + 5, seg.y + 5, 3, 3);
        ctx.fillRect(seg.x + 12, seg.y + 5, 3, 3);
      }
      if (direction === "DOWN") {
        ctx.fillRect(seg.x + 5, seg.y + 12, 3, 3);
        ctx.fillRect(seg.x + 12, seg.y + 12, 3, 3);
      }
    }
  });

  // food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "UP") headY -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "DOWN") headY += box;

  // eat
  if (headX === food.x && headY === food.y) {
    score++;
    food = spawnFood();

    if (score % 10 === 0 && level < 10) {
      level++;
      obstacles = generateMap(level);

      speed = Math.max(60, speed - 5); // smooth increase
      clearInterval(game);
      game = setInterval(draw, speed);
    }
  } else {
    snake.pop();
  }

  let newHead = { x: headX, y: headY };

  // collision
  if (
    headX < 0 || headY < 0 ||
    headX >= size || headY >= size ||
    collision(newHead, snake) ||
    collision(newHead, obstacles)
  ) {
    clearInterval(game);
    alert("Game Over! Score: " + score);
  }

  snake.unshift(newHead);

  document.getElementById("info").innerText =
    "Level: " + level + " | Score: " + score;
}

// collision
function collision(head, arr) {
  return arr.some(o => o.x === head.x && o.y === head.y);
}

// control
function changeDirection(e) {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}
