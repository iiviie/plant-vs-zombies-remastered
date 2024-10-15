const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

const backgroundMusic = new Audio('assets/music/pvzMusic.mp3');
backgroundMusic.loop = true;

function startBackgroundMusic() {
    backgroundMusic.play();
}



// global variables
const cellSize = 100;
const cellGap = 3;
let sunEnergy = 300;
const sunValue = 50;
let zombiesInterval = 600;
let frame = 0;
let gameOver = false;
let gameWon=false;
let score = 0;
let currentlevel = 1;

const gameTime = 2 * 60 * 1000;
let startTime;
let finalWaveStarted = false;
let finalWaveMessageTimer = 0;
let timeIsUp = false;


const gameGrid = [];
const plants = [];
const zombies = [];
const zombiePositions = [];
const peas = [];
const suns = [];

// plant selection
const plantTypes = [
    { name: 'Peashooter', cost: 100, imageSrc: 'assets/p-images/peashooter.webp' },
    { name: 'Sunflower', cost: 50, imageSrc: 'assets/p-images/sunflower.png' },
    { name: 'wall_nut', cost: 50, imageSrc: 'assets/p-images/wall_nut.png' },
    { name: 'chilly', cost: 150, imageSrc: 'assets/p-images/chilly-fire.png' },
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
   
}
//images of plant

const peashooterImage = new Image();
peashooterImage.src = 'assets/p-images/peashooter.webp';

const sunflowerImage = new Image();
sunflowerImage.src = 'assets/p-images/sunflower.png';

const chillyImage = new Image();
chillyImage.src = 'assets/p-images/chilly-fire.png';

const wallImage = new Image();
wallImage.src = 'assets/p-images/wall_nut.png';


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
//wall nut
class wall_nut extends Plant {
    constructor(x, y){
        super(x, y);
        this.cost = 50;
        this.health= 700;
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
        this.eating = false;
        
    }
    update(){
        this.x -= this.movement;
    }
   
}

//zombies images
const nzombieImage = new Image();
nzombieImage.src = 'assets/z-images/Zombie.png';

const cone_zombieImage = new Image();
cone_zombieImage.src = 'assets/z-images/conehead_zombie.png';

const bucket_zombieImage = new Image();
bucket_zombieImage.src = 'assets/z-images/buckethead_zombie.png';

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
        zombiesInterval = 200;
        finalWaveMessageTimer = 180; 
    }

    for (let i = 0; i < zombies.length; i++){
        zombies[i].update();
        zombies[i].draw();

        let collidingWithPlant = false;

        for (let j = 0; j < plants.length; j++) {
            if (plantZombieCollision(plants[j], zombies[i])) {
                collidingWithPlant = true;
                zombies[i].eating = true;
                zombies[i].movement = 0;
                plants[j].health -= zombies[i].damage / 60;

                if (plants[j].health <= 0) {
                    plants.splice(j, 1);
                    j--;
                    zombies[i].eating = false;
                    zombies[i].movement = zombies[i].speed;
                }
                break;
            }
        }

        if (!collidingWithPlant && zombies[i].eating) {
            zombies[i].eating = false;
            zombies[i].movement = zombies[i].speed;
        }

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

    if (!timeIsUp && frame % zombiesInterval === 0){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;

        // Randomly choose to spawn zombies
        let zombieType = Math.random();
        if (zombieType < 0.5) {  
            zombies.push(new nzombie(verticalPosition));
        } 
        else if(zombieType < 0.8 && zombieType >= 0.5) {  
            zombies.push(new cone_zombie(verticalPosition));
        }
        else {  
            zombies.push(new bucket_zombie(verticalPosition));
        }
        
        zombiePositions.push(verticalPosition);
    }

    if (timeIsUp) {
    setInterval=6000000;
}
        if(timeIsUp && zombies.length==0){gameWon = true;
        gameOver = true;{

        }
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
sunImage.src = 'assets/p-images/Sun.gif';

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
        this.y = this.bottomY; // Ensure trhatsun stops exactly at the bottom
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
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black'; 
       ctx.fillText(plantTypes[i].cost,cellSize/2,cellSize*(i+1.5),canvas.width);
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

const replayButton = {
    x: canvas.width / 2 - 100,
    y: canvas.height / 2,
    width: 200,
    height: 50,
    text: 'Replay',
};

//for level increase
const playButton = {
    x: canvas.width / 2 - 100,
    y: canvas.height / 2 + 60,
    width: 300,
    height: 50,
};

function resetGame() {
    gameOver = false;
    gameWon = false;
    score = 0;
    sunEnergy = 300;
    zombies.length = 0;  
    plants.length = 0;  
    peas.length = 0;  
    suns.length = 0; 
    zombiePositions.length = 0;  
    frame = 0;
    startTime = Date.now(); 
    finalWaveStarted = false;
    zombiesInterval = Math.max(100, zombiesInterval - (currentlevel-1) * 100);; 
    animate();
}

// Game Over overlay with blur effect
function drawGameOverOverlay() {
    ctx.save();
    ctx.filter = 'blur(5px)';
    handleGameGrid();
    handlePlants();
    handleSuns();
    handlePeas();
    handleZombies();
    ctx.restore();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '90px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 250, canvas.height / 2 - 100);

    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(replayButton.x, replayButton.y, replayButton.width, replayButton.height);
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.fillText(replayButton.text, replayButton.x + 30, replayButton.y + 40);
}

//level increased display
function drawLevelUpOverlay() {
    ctx.save();
    ctx.filter = 'blur(5px)';
    handleGameGrid();
    handlePlants();
    handleSuns();
    handlePeas();
    handleZombies();
    ctx.restore();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '90px Arial';
    ctx.fillText('LEVEL ' + (currentlevel), canvas.width / 2 - 230, canvas.height / 2 - 100);

    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.fillText('Play level ' + (currentlevel), playButton.x + 20, playButton.y + 40);
}

canvas.addEventListener('click', function(e) {
    const mouseX = e.x - canvasPosition.left;
    const mouseY = e.y - canvasPosition.top;

    if (gameOver && mouseX > replayButton.x && mouseY > replayButton.y && mouseX < replayButton.x + replayButton.width && mouseY < replayButton.y + replayButton.height) {
        resetGame();  
    }
    else if (gameOver  && mouseX > playButton.x && mouseY > playButton.y && mouseX < playButton.x + playButton.width && mouseY < playButton.y + playButton.height) {
        resetGame(); 
    }
});


// utilities
function handleGameStatus(){
    ctx.fillStyle = 'rgba(69, 52, 43, 0.7)';  
    ctx.fillRect(10, 10, 150, 50);  

    ctx.drawImage(sunImage, 15, 15, 50, 50);  

    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';  
    ctx.fillText('  :' + sunEnergy, 50, 50); 
    
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

  
  if (currentTime >= gameTime && !timeIsUp) {
    timeIsUp = true;
}

if(gameOver) {
    if (gameWon){
        drawGameOverOverlay();
    }else{
        drawGameOverOverlay();
    }
}
   
 }

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameOver) {
        handleGameGrid();
        handlePlants();
        handleSuns();
        handlePeas();
        handleZombies();
    }
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

function plantZombieCollision(plant, zombie) {
    const collisionThreshold = 0; // Collision up to 50px on the right of the cell
    return (
        plant.y === zombie.y &&
        zombie.x <= plant.x + plant.width + collisionThreshold &&
        zombie.x + zombie.width >= plant.x
    );
}


window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
});


startBackgroundMusic();
startTime = Date.now();
animate();