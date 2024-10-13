const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// global variables
const cellSize = 100;
const cellGap = 3;
let sunEnergy = 300;
const sunValue = 50;
let zombiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;

const gameTime = 2 * 60 * 1000;
let startTime;
let finalWaveStarted = false;
let finalWaveMessageTimer = 0;


const gameGrid = [];
const plants = [];
const zombies = [];
const zombiePositions = [];
const peas = [];
const suns = [];

// plant selection
const plantTypes = [
    { name: 'Peashooter', cost: 100, imageSrc: 'p-images/peashooter.webp' },
    { name: 'Sunflower', cost: 50, imageSrc: 'p-images/sunflower.png' },
    { name: 'wall_nut', cost: 50, imageSrc: 'p-images/wall_nut.png' },
    { name: 'chilly', cost: 150, imageSrc: 'p-images/chilly-fire.png' },
];

for (let i = 0; i < plantTypes.length; i++) {
    let img = new Image();
    img.src = plantTypes[i].imageSrc;
    plantTypes[i].image = img;  
}

let selectedPlant = 0;

//zombies selection
const zombieTypes = [
    { name: 'nzombie', level: 1},
    { name: 'cone_zombie', level :2 },
    { name: 'bucket_zombie', level :3 }
];
// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function(){
    mouse.y = undefined;
    mouse.y = undefined;
});

// game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid(){
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = cellSize; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid(){
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}

// plants

//TODO: add animated sprites for plants
//TODO: add more plant types
class Plant {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.health = 100;
        this.timer = 0;
    }
    draw(){
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '20px Arial';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
}
//images of plant

const peashooterImage = new Image();
peashooterImage.src = 'p-images/peashooter.webp';

const sunflowerImage = new Image();
sunflowerImage.src = 'p-images/sunflower.png';

const chillyImage = new Image();
chillyImage.src = 'p-images/chilly-fire.png';

const wallImage = new Image();
wallImage.src = 'p-images/wall_nut.png';


//peashooter
class Peashooter extends Plant {
    constructor(x, y){
        super(x, y);
        this.cost = 100;
    }
    draw(){
        ctx.drawImage(peashooterImage, this.x, this.y, this.width, this.height);
    }
    update(){
        if (this.shooting){
            this.timer++;
            if (this.timer % 100 === 0){
                peas.push(new Pea(this.x + 70, this.y + 35));
            }
        } else {
            this.timer = 0;
        }
    }
}
//sunflower
class Sunflower extends Plant {
    constructor(x, y){
        super(x, y);
        this.cost = 50;
        this.sunTimer = 0;
    }
    draw(){
        ctx.drawImage(sunflowerImage, this.x, this.y, this.width, this.height);
    }
    update(){
        this.sunTimer++;
        if (this.sunTimer % 700 === 0){
            suns.push(new Sun(this.x + this.width / 2, this.y));
        }
    }
}
//chilly
class chilly extends Plant {
    constructor(x, y) {
        super(x, y);
        this.cost = 150; 
    }
    draw(){
        ctx.drawImage(chillyImage, this.x, this.y, this.width, this.height);
    }
    update() {
        for (let i = zombies.length - 1; i >= 0; i--) {
            if (zombies[i].y === this.y) {
                const findThisIndex = zombiePositions.indexOf(zombies[i].y);
                zombiePositions.splice(findThisIndex, 1); 
                zombies.splice(i, 1); 
            }
        }
        plants.splice(plants.indexOf(this), 1);
    }
}
//sunflower
class wall_nut extends Plant {
    constructor(x, y){
        super(x, y);
        this.cost = 50;
        this.health= 2000;
    }
    draw(){
        ctx.drawImage(wallImage, this.x, this.y, this.width, this.height);
    }
    update(){
        if (this.health <= 0) {
            const index = plants.indexOf(this);
            if (index > -1) {
                plants.splice(index, 1); 
            }
        }
    }
    }

function handlePlants(){
    for (let i = 0; i < plants.length; i++){
        plants[i].draw();
        plants[i].update();
        if (plants[i] instanceof Peashooter) {
            if (zombiePositions.indexOf(plants[i].y) !== -1){
                plants[i].shooting = true;
            } else {
                plants[i].shooting = false;
            }
        }
        for (let j = 0; j < zombies.length; j++){
            if (plants[i] && collision(plants[i], zombies[j])){
                zombies[j].movement = 0;
                plants[i].health -= 0.5;
            }
            if (plants[i] && plants[i].health <= 0){
                plants.splice(i, 1);
                i--;
                zombies[j].movement = zombies[j].speed;
            }
        }
    }
}

// zombies

//TODO: add zombie types
//FIXME: thee zombies stop moving when they react with a plant
class Zombie {
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = 0.44;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
        this.damage = 5; 
        
    }
    update(){
        this.x -= this.movement;
    }
    draw(){
        ctx.fillStyle = 'darkgrey';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Z', this.x + 15, this.y + 30);
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 60);
    }
}

//zombies images
const nzombieImage = new Image();
nzombieImage.src = 'z-images/Zombie.png';

const cone_zombieImage = new Image();
cone_zombieImage.src = 'z-images/conehead_zombie.png';

const bucket_zombieImage = new Image();
bucket_zombieImage.src = 'z-images/buckethead_zombie.png';

//normal zombie
class nzombie extends Zombie {
    constructor(x, y){
        super(x, y);
        this.level =1;
    }
    draw(){
        ctx.drawImage(nzombieImage, this.x, this.y, this.width, this.height);
    }
    
}

//cone head zombie
class cone_zombie extends Zombie {
    constructor(x, y){
        super(x, y);
        this.level =2;
        this.health = 150;
        this.maxHealth = this.health;
    }
    draw(){
        ctx.drawImage(cone_zombieImage, this.x, this.y, this.width, this.height);
    }
    
}

//buckethead zombie
class bucket_zombie extends Zombie {
    constructor(x, y){
        super(x, y);
        this.level =3;
        this.health = 200;
        this.maxHealth = this.health;
    }
    draw(){
        ctx.drawImage(bucket_zombieImage, this.x, this.y, this.width, this.height);
    }
    
}


function handleZombies(){
  const currentTime = Date.now() - startTime;
  const finalWaveTime = 90 * 1000; // 1 minute 30 seconds

  if (currentTime >= finalWaveTime && !finalWaveStarted) {
      finalWaveStarted = true;
      zombiesInterval = 200; // Increase spawn rate for final wave
      finalWaveMessageTimer = 180; // Show message for 3 seconds (60 frames per second)
  }

  for (let i = 0; i < zombies.length; i++){
      zombies[i].update();
      zombies[i].draw();
      if (zombies[i].x < 0){
          gameOver = true;
      }
      if (zombies[i].health <= 0){
          let gainedSuns = zombies[i].maxHealth / 10;
          sunEnergy += gainedSuns;
          score += gainedSuns;
          const findThisIndex = zombiePositions.indexOf(zombies[i].y);
          zombiePositions.splice(findThisIndex, 1);
          zombies.splice(i, 1);
          i--;
      }
  }

  if (frame % zombiesInterval === 0){
      let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;

  // Randomly choose to spawn zombies
  //FIXME: reduce the probability of the bucket zombies
  let zombieType = Math.random();
  if (zombieType < 0.5) {  
      zombies.push(new nzombie(verticalPosition));
  } 
  else if(zombieType<0.8 && zombieType>=0.5) {  
      zombies.push(new cone_zombie(verticalPosition));
  }
  else {  
    zombies.push(new bucket_zombie(verticalPosition));
}
        
        zombiePositions.push(verticalPosition);

      }
}

// peas
class Pea {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.fillStyle = 'limegreen';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width , 0, Math.PI * 2);
        ctx.fill();
    }
}
function handlePeas(){
    for (let i = 0; i < peas.length; i++){
        peas[i].update();
        peas[i].draw();

        for (let j = 0; j < zombies.length; j++){
            if (zombies[j] && peas[i] && collision(peas[i], zombies[j])){
                zombies[j].health -= peas[i].power;
                peas.splice(i, 1);
                i--;
            }
        }

        if (peas[i] && peas[i].x > canvas.width - cellSize){
            peas.splice(i, 1);
            i--;
        }
    }
}

// suns
//FIXME:the suns currletly fall from the top of the screen and do not stay on the lawn/field
const sunImage = new Image();
sunImage.src = 'p-images/Sun.gif';

//fixed the issue of sunds fall off the screen , now they stopa at the bottom of the screen
class Sun {
    constructor(x, y){
        this.x = x || Math.random() * (canvas.width - cellSize);
        this.y = y || 0 - cellSize;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = sunValue;
        this.speed = Math.random() * 0.5 + 0.25;
        this.bottomY = canvas.height - this.height;
    }
    update(){
      if (this.y < this.bottomY) {
        this.y += this.speed;
    } else {
        this.y = this.bottomY; // Ensure sun stops exactly at the bottom
    }
    }
    draw(){
        ctx.drawImage(sunImage, this.x, this.y, this.width, this.height);
    }
}

function handleSuns(){
    if (frame % 200 === 0 && Math.random() < 0.3){
        suns.push(new Sun());
    }
    for (let i = 0; i < suns.length; i++){
        suns[i].update();
        suns[i].draw();
        if (suns[i] && mouse.x && mouse.y && collision(suns[i], mouse)){
            sunEnergy += suns[i].amount;
            suns.splice(i, 1);
            i--;
        }
        
    }
}

// plant selection menu
function drawPlantSelectionMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, cellSize, canvas.height);
    
    for (let i = 0; i < plantTypes.length; i++) {
        ctx.fillStyle = i === selectedPlant ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, cellSize * (i + 1), cellSize, cellSize/2);
        
        const img = plantTypes[i].image;
        if (img) {
            ctx.drawImage(img, 10, cellSize * (i + 1) + 5, 40, 40);  
        }

    }
}

canvas.addEventListener('click', function(e) {
    const x = e.x - canvasPosition.left;
    const y = e.y - canvasPosition.top;
    
    if (x < cellSize) {
        for (let i = 0; i < plantTypes.length; i++) {
            if (y > cellSize * (i + 1) && y < cellSize * (i + 2)) {
                selectedPlant = i;
                return;
            }
        }
    }

    const gridPositionX = x - (x % cellSize) + cellGap;
    const gridPositionY = y - (y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < plants.length; i++){
        if (plants[i].x === gridPositionX && plants[i].y === gridPositionY) return;
    }
    let plantCost = plantTypes[selectedPlant].cost;
    if (sunEnergy >= plantCost){
        if (plantTypes[selectedPlant].name === 'Peashooter'){
            plants.push(new Peashooter(gridPositionX, gridPositionY));
        } else if (plantTypes[selectedPlant].name === 'Sunflower'){
            plants.push(new Sunflower(gridPositionX, gridPositionY));
        } else if (plantTypes[selectedPlant].name === 'chilly') {
            plants.push(new chilly(gridPositionX, gridPositionY)); 
        }else if (plantTypes[selectedPlant].name === 'wall_nut') {
            plants.push(new wall_nut(gridPositionX, gridPositionY)); 
        }
        sunEnergy -= plantCost;
    }
});

// utilities
function handleGameStatus(){
    ctx.fillStyle = 'gold';
    ctx.font = '30px Arial';
    ctx.fillText('Sun Energy: ' + sunEnergy, 20, 40);
    ctx.fillText('Score: ' + score, 20, 80);
    
    const currentTime = Date.now() - startTime;
    const timeLeft = Math.max(0, gameTime - currentTime);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, canvas.width - 200, 40);

    if (finalWaveMessageTimer > 0) {
      ctx.fillStyle = 'red';
      ctx.font = '40px Arial';
      ctx.fillText('Final Wave! More zombies incoming!', canvas.width / 2 - 250, canvas.height / 2);
      finalWaveMessageTimer--;
  }

    if (gameOver){
        ctx.fillStyle = 'black';
        ctx.font = '90px Arial';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (currentTime >= gameTime && !gameOver){
      ctx.fillStyle = 'black';
      ctx.font = '60px Arial';
      ctx.fillText('YOU WIN!', 130, 300);
      ctx.font = '30px Arial';
      ctx.fillText('You survived with ' + score + ' points!', 134, 340);
      gameOver = true;
  }
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleGameGrid();
    handlePlants();
    handleSuns();
    handlePeas();
    handleZombies();
    handleGameStatus();
    drawPlantSelectionMenu();
    frame++;
    

    
    if (!gameOver) requestAnimationFrame(animate);
}

function collision(first, second){
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    };
};

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
});

startTime = Date.now();
animate();