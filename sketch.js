//declaración de variables globales
var PLAY = 1;
var END = 0;
var gameState = PLAY;
var score = 0;

var trex, trex_running, trex_collided;
var ground, invisibleGround;

var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4;
var backgroundImg, sunAnimation; 
var gameOver, restart, gameOverImg, restartImg;

var jumpSound , checkPointSound, dieSound;


function preload(){
  trex_running = loadAnimation("trex_1.png", "trex_2.png", "trex_3.png");
  trex_collided = loadImage("trex_collided.png");

  groundImage = loadImage("ground.png");
  cloudImage = loadImage("cloud.png");

  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");

  gameOverImg = loadImage("gameOver.png");
  restartImg = loadImage("restart.png");

  backgroundImg = loadImage("backgroundImg.png")
  sunAnimation = loadImage("sun.png");

  jumpSound = loadSound("jump.mp3");
  dieSound = loadSound("die.mp3");
  checkPointSound = loadSound("checkpoint.mp3");

}

function setup(){
  createCanvas(windowWidth, windowHeight);
  
  //crear sprite de suelo
  ground = createSprite(width/2, height, width, 2);
  ground.addAnimation("ground", groundImage);
  ground.x = width/2;
  
  //crear sprite de suelo invisible
  invisibleGround = createSprite(width/2, height, width, 125);
  invisibleGround.visible = false;

  //crear sprite de trex
  trex = createSprite(50, height-70, 20, 50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.scale = 0.1;
  //establecer su radio de colisión
  trex.setCollider('circle', 0, 0, 350);
  
  //crear sprite de sol
  sun = createSprite(width-50, 100, 10, 10);
  sun.addAnimation("sun", sunAnimation);
  sun.scale = 0.15;
  
  //crear sprite de fin de juego
  gameOver = createSprite(width/2, height/2 -50);
  gameOver.addImage(gameOverImg);
  gameOver.scale = 0.5;
  
   //crear sprite de reiniciar juego
  restart = createSprite(width/2, height/2);
  restart.addImage(restartImg);
  restart.scale = 0.1;
  
  //crear grupo de obstáculos y nubes
  cloudsGroup = new Group();
  obstaclesGroup = new Group();
  
}

function draw(){
  background(backgroundImg);

  //dar tamaño y color al score
  textSize(20);
  fill("black");
  text("Puntuación: " + score, 30, 30);
  
  //instrucciones del estado PLAY
  if (gameState === PLAY) {
    gameOver.visible = false;
    restart.visible = false;
    
    //aumentar velocidad del suelo
    ground.velocityX = -(6 + 3* score/100);
    
    //puntuación usando getFrameRate
    score = score + Math.round(getFrameRate()/60);

    //establecer sonido cada 100 puntos
    if (score > 0 && score % 100 === 0) {
      checkPointSound.play();

    }

    //restablecer el suelo al centro
    if(ground.x < 0) {
      ground.x = ground.width / 2;

    }

    //condición para el salto del trex
    if ((touches.length > 0 || keyDown("space")) && trex.y >= height-120) {
      //agregar sonido al salto
      trex.velocityY = -12;
      touches = [];
      jumpSound.play();
      //vaciar el arreglo de toques

    }

    //crear gravedad
    trex.velocityY = trex.velocityY + 0.8;

    //aparecer nubes
    spawnClouds();
  
    //aparecer obstáculos
    spawnObstacles();

    //condición para cambiar el estado del juego
    if(obstaclesGroup.isTouching(trex)) {
      gameState = END;
      dieSound.play();

    }
  }

  //instrucciones del estado END
  else if (gameState === END) {
    gameOver.visible = true;
    restart.visible = true;

    //cambiar la animación del trex
    trex.changeAnimation("collided", trex_collided);

    //establecer lifetime de -1 a los grupos
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);

    //establecer velocidad cero a los sprites y grupos
    ground.velocityX = 0;
    trex.velocityY = 0;
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);

    //condición para llamar a la función reset
    if (touches.length>0 || mousePressedOver(restart)) {
      touches = [];
      reset();

    }
  }
  
  //hacer que Trex choque con el suelo invisible
  trex.collide(invisibleGround);

  drawSprites();

}

//función para crear nubes
function spawnClouds() {
  if (frameCount % 60 === 0) {
    //crear sprite de nubes
    var cloud = createSprite(width+20, height-300, 40, 10);
    cloud.addImage(cloudImage);
    cloud.y = Math.round(random(50,100));
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    
    //hacer que trex y el sol estén delante de las nubes
    cloud.depth = trex.depth;
    sun.depth = cloud.depth;
    trex.depth = trex.depth + 1;
    sun.depth = sun.depth + 1; 
    
    //establecer tiempo de vida para las nubes
    cloud.lifetime = Math.round(width/3);
    
    //agregar cada nube a su grupo
    cloudsGroup.add(cloud);

  }
}

//función para crear obstáculos
function spawnObstacles() {
  if (frameCount % 60 === 0) {
    //crear sprite de obstáculo
    var obstacle = createSprite(2*width/3, height-90, 20, 30);
    obstacle.velocityX = - (6 + score/100);
    
    //establecer animaciones al azar y su escala
    var rand = Math.round(random(1, 4));
    switch(rand) {
      case 1: obstacle.addImage(obstacle1);
      obstacle.scale = 0.4;
      break;
      case 2: obstacle.addImage(obstacle2);
      obstacle.scale = 0.4;
      break;
      case 3: obstacle.addImage(obstacle3);
      obstacle.scale = 0.2;
      break;
      case 4: obstacle.addImage(obstacle4);
      obstacle.scale = 0.2;
      break;
      default: break;

    }
    
    //asignar su tiempo de vida y radio de colisión
    obstacle.setCollider('circle', 0, 0, 80);
    obstacle.lifetime = 300;
    
    //agregar profundidad
    obstacle.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //agregar cada obstáculo a su grupo
    obstaclesGroup.add(obstacle);
    
  }
}

//función para reiniciar el juego
function reset() {
  //cambiar de estado
  gameState = PLAY;

  //destruir obstáculos y nubes
  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();

  //cambiar animación del trex
  trex.changeAnimation('running', trex_running);

  //reiniciar score
  score = 0;

}