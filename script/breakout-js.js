// -------------------------------------------
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
// ---------------------------------------------------

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var fps = 60;
// paddle variables
var paddleHeight = 12;
var paddleWidth = 120;
var paddleXPosition = (canvas.width-paddleWidth)/2;
var paddleXVelocity = 8;
// ball info
var ballRadius = 12;
var x = canvas.width/2;
var y = canvas.height - paddleHeight - ballRadius;
var startSpeed = 10;
var startY = getRandomIntRange(30,70);
var dx = Math.round(startSpeed * (100 - startY) / 100);
var dy = Math.round(startSpeed * startY / 100);
// keyboard controls
var rightPressed = false;
var leftPressed = false;
// bricks variables
var brickRowCount = 5;
var brickColumnCount = 7;
var brickWidth = 100;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 20;
var bricks = [];
for(col=0; col<brickColumnCount; col++) {
    bricks[col] = [];
    for(row=0; row<brickRowCount; row++) {
        bricks[col][row] = { x: 0, y: 0, status: 1 };
    }
}
var score = 0;
var lives = 3;

function getRandomIntRange(min, max) {
    /* random number generator in int range (min, max) */
    return Math.floor(Math.random() * (max - min) + min);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleXPosition, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// collision detection for walls
function collisionDetectionWalls() {
    if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if(y + dy < ballRadius) {
        dy = -dy;
    } else if(y + dy > canvas.height - ballRadius - paddleHeight) {
        var circle = {
            x: x + dx,
            y: y + dy,
            r: ballRadius
        };
        var rect = {
            x: paddleXPosition,
            y: canvas.height - paddleHeight,
            w: paddleWidth,
            h: paddleHeight
        };
        collision = RectCircleColliding(circle, rect);
        if(collision == "horizontal") {
            dy = -dy;
            // randomization of direction!
            var dxDirection = (dx > 0 ? 1 : -1);
            var dyDirection = (dy > 0 ? 1 : -1);
            var currSpeed = Math.abs(dx) + Math.abs(dy);
            var currDir = Math.abs(dx) / currSpeed * 100;
            var newDir = getRandomIntRange(Math.max(30, currDir - 15),Math.min(70, currDir + 15));
            // console.log("old dx = "+dx+" old dy = "+dy);
            dx = currSpeed * (100-newDir) / 100 * 1.03 * dxDirection;
            dy = currSpeed * newDir / 100 * 1.03 * dyDirection;
            //console.log("new dx = "+dx+" new dy = "+dy);
        } else if(collision == "vertical" || collision == "edge") {
            dx = -dx;
            dy = -dy;
            // randomization of direction!
            var dxDirection = (dx > 0 ? 1 : -1);
            var dyDirection = (dy > 0 ? 1 : -1);
            var currSpeed = Math.abs(dx) + Math.abs(dy);
            var currDir = Math.abs(dx) / currSpeed * 100;
            var newDir = getRandomIntRange(Math.max(30, currDir - 15),Math.min(70, currDir + 15));
            // console.log("old dx = "+dx+" old dy = "+dy);
            dx = currSpeed * (100-newDir) / 100 * 1.03 * dxDirection;
            dy = currSpeed * newDir / 100 * 1.03 * dyDirection;
        }
        if(y + dy > canvas.height - ballRadius / 2) {
            lives--;
            if(lives<=0) {
                alert("Game over!");
                newGame();
                document.location.reload();
            } else {
                x = canvas.width/2;
                y = canvas.height - paddleHeight - ballRadius;
                startSpeed = 10;
                startY = getRandomIntRange(30,70);
                dx = Math.round(startSpeed * (100 - startY) / 100);
                dy = Math.round(startSpeed * startY / 100);
                paddleXPosition = (canvas.width-paddleWidth)/2;
            }
        }
    }
}

// drawing bricks
function drawBricks() {
    for(col=0; col<brickColumnCount; col++) {
        for(row=0; row<brickRowCount; row++) {
            if(bricks[col][row].status == 1) {
                var brickX = (col*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (row*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[col][row].x = brickX;
                bricks[col][row].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// move paddle function
function movePaddle() {
    if(rightPressed && paddleXPosition < canvas.width-paddleWidth) {
        paddleXPosition += paddleXVelocity;
    }
    if(leftPressed && paddleXPosition > 0) {
        paddleXPosition -= paddleXVelocity;
    }
}

// keyboard handlers
function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}
// end of keyboard handlers

// collision detection for other objects
function collisionDetection() {
    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status == 1) {
                var circle = {
                    x: x + dx,
                    y: y + dy,
                    r: ballRadius
                };
                var rect = {
                    x: b.x,
                    y: b.y,
                    w: brickWidth,
                    h: brickHeight
                };
                collision = RectCircleColliding(circle, rect);
                if(collision == "horizontal") {
                    dy = -dy;
                    b.status = 0;
                    scorePoint();
                } else if(collision == "vertical") {
                    dx = -dx;
                    b.status = 0;
                    scorePoint();
                } else if(collision == "edge") {
                    dx = -dx;
                    dy = -dy;
                    b.status = 0;
                    scorePoint();
                }
            }
        }
    }
}

function scorePoint() {
    score++;
    if(score == brickRowCount*brickColumnCount) {
        alert("YOU WIN, CONGRATULATIONS!");
        newGame(); // in case reload fails
        document.location.reload();
    }
}

// function copied from here: http://jsfiddle.net/m1erickson/n6U8D/
function RectCircleColliding(circle, rect) {
    var distX = Math.abs(circle.x - rect.x - rect.w / 2);
    var distY = Math.abs(circle.y - rect.y - rect.h / 2);

    if (distX > (rect.w / 2 + circle.r)) {
        return "none";
    }
    if (distY > (rect.h / 2 + circle.r)) {
        return "none";
    }

    if (distX <= (rect.w / 2)) {
        return "horizontal";
    }
    if (distY <= (rect.h / 2)) {
        return "vertical";
    }

    var deltaX = distX - rect.w / 2;
    var deltaY = distY - rect.h / 2;
    var result = (deltaX * deltaX + deltaY * deltaY <= (circle.r * circle.r));
    if(result) return "edge";
    return "none";
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

function draw() {
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    setTimeout(function() {
        requestAnimationFrame(draw);
        // Drawing code goes here
    }, 1000 / fps);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    movePaddle();
    collisionDetectionWalls();
    collisionDetection();
    drawBricks();
    y += dy;
    x += dx;
    drawScore();
    drawLives();
}

// reset all variables
function newGame() {
    paddleXPosition = (canvas.width-paddleWidth)/2;
    x = canvas.width/2;
    y = canvas.height - paddleHeight - ballRadius;
    startSpeed = 10;
    startY = getRandomIntRange(30,70);
    dx = Math.round(startSpeed * (100 - startY) / 100);
    dy = Math.round(startSpeed * startY / 100);
    rightPressed = false;
    leftPressed = false;
    for(col=0; col<brickColumnCount; col++) {
        for(row=0; row<brickRowCount; row++) {
            bricks[col][row] = { x: 0, y: 0, status: 1 };
        }
    }
    score = 0;
    lives = 3;
}

draw();