const canvas = document.getElementById("cnvs");

const gameState = {};

function onMouseMove(e) {
    gameState.pointer.x = e.pageX;
    gameState.pointer.y = e.pageY
}

function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick = gameState.lastTick + gameState.tickLength;
        update(gameState.lastTick);
    }
}

function draw(tFrame) {
    const context = canvas.getContext('2d');

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawPlatform(context)
    drawBall(context)
    drawScore(context)
    if (gameState.candy.x != -100 && gameState.candy.y != -100) 
    {
        drawCandy(context, gameState.candy.x, gameState.candy.y)
    }
}


function run(tFrame) {
    gameState.stopCycle = window.requestAnimationFrame(run);

    const nextTick = gameState.lastTick + gameState.tickLength;
    let numTicks = 0;

    if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
    }
    queueUpdates(numTicks);
    draw(tFrame);
    gameState.lastRender = tFrame;
}

function stopGame() {
    window.cancelAnimationFrame(gameState.stopCycle);
}



function drawPlatform(context) {
    const {x, y, width, height} = gameState.player;
    context.beginPath();
    context.rect(x - width / 2, y - height / 2, width, height);
    context.fillStyle = "#FF0000";
    context.fill();
    context.closePath();
}

function drawBall(context) {
    const {x, y, radius} = gameState.ball;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = "#0000FF";
    context.fill();
    context.closePath();
}

function drawScore(context) {
	context.fillStlye = "black";
	context.font = "16px Arial, sans-serif";
	context.textAlign = "left";
	context.textBaseline = "top";
	context.fillText("Score: " + gameState.score, 20, 20 );
}

function drawCandy(context, paramx, paramy)
{
    context.beginPath();
    context.moveTo(50 + paramx, 50 + paramy);
    context.lineTo(150 + paramx, 50 + paramy); 
    context.lineTo(150 + paramx, 150 + paramy); 
    context.lineTo(50 + paramx, 150 + paramy); 
    context.closePath(); 
    context.strokeStyle = '#1a2edb';
    context.lineWidth = 5; 
    context.stroke();
}

function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener('mousemove', onMouseMove, false);

    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    gameState.tickLength = 15; //ms

    const platform = {
        width: 400,
        height: 50,
    };

    gameState.player = {
        x: 100,
        y: canvas.height - platform.height / 2,
        width: platform.width,
        height: platform.height
    };
    gameState.pointer = {
        x: 0,
        y: 0,
    };
    gameState.ball = {
        x: canvas.width / 2,
        y: 0,
        radius: 25,
        vx: 0,
        vy: 5,
        angle : 0
    }

    gameState.candy = {
        x: -100,
        y: -100,
        vy: 10
    }

    gameState.particlePos = {}
    gameState.score = 0
}

setInterval(incScore, 1000);
setInterval(helperDraw, 15000);
setInterval(incSpeed, 30000);

function incScore() {
    gameState.score += 1
}

function incSpeed()
{
    if (gameState.ball.vy > 0) 
        gameState.ball.vy += 4

    if (gameState.ball.vy < 0) 
        gameState.ball.vy -= 4
}

function helperDraw()
{
    const context = canvas.getContext('2d');
    let random = getRandomArbitrary(50, canvas.width - 100)
    drawCandy(context, random, 50)
    gameState.candy.x = 50 + random
    gameState.candy.y = 50

}

function update(tick) {
    
    
    const vx = (gameState.pointer.x - gameState.player.x) // 10
    gameState.player.x += vx

    gameState.candy.y += gameState.candy.vy

    if (collisionCandy(gameState.candy, gameState.player)) {
        gameState.candy.x = -100
        gameState.candy.y = -100
        gameState.score += 15
        gameState.candy.y += 200
    }

    const ball = gameState.ball

    if ((collision(gameState.ball, gameState.player) && ball.vy > 0)) {
        collideAction(gameState.ball, gameState.player)
    }

    ball.y += ball.vy
    ball.x += ball.vx

    if(ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        stopGame();
    } 
        
    if(ball.y < 0) {
        ball.vy = -ball.vy;
        ball.y = ball.radius;
    }

    if(ball.x + ball.radius > canvas.width) {
        ball.vx = -ball.vx;
        ball.x = canvas.width - ball.radius;
    }
    
    else if(ball.x -ball.radius < 0) {
        ball.vx = -ball.vx;
        ball.x = ball.radius;
    }
    
}

function collision(b, p) {
    if(b.x + gameState.ball.radius >= p.x - p.width/2
        && b.x - gameState.ball.radius <=(p.x - p.width/2 + p.width)) {
		if(b.y >= (p.y - p.height) && p.y > 0){
			
			return true;
		}
		
		else
			return (b.y <= p.height && p.y == 0) ;

	}
}

function collisionCandy(b, p) {
    if(b.x + 50 >= p.x - p.width/2
        && b.x - 50 <=(p.x - p.width/2 + p.width)) {
		if(b.y >= (p.y - p.height - 100) && p.y > 0){
			
			return true;
		}
		
		else 
			return b.y <= p.height && p.y == 0;
	}
}

function collideAction(ball, p) {
    //ball.vy = -ball.vy;    
    
    ball.y = p.y - p.height;
    gameState.particlePos.y = ball.y + ball.radius;
    gameState.particlePos.x = ball.x;
    
    changeAngle(90 - ball.angle); 

}


  


function changeAngle(angle) {
    if(angle == 0) angle = 1; 
    angle = angle;
    radians = angle / (180 * Math.PI) * 10;
    
    let tmpSpeed = gameState.ball.vy
    gameState.ball.vx = -(Math.cos(radians) * gameState.ball.vx) + getRandomArbitrary(-5, 5);
    gameState.ball.vy = -(Math.sin(radians) * gameState.ball.vy);
  }

 function angleTo(x, y) {
    changeAngle(Math.atan2(y - y, x - x));
  }

  function getRandomArbitrary(min, max) {
      
      let a = Math.random() * (max - min) + min
    return a
  }

setup();
run();
