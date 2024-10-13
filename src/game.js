const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// global variables
const cellSize = 100;
const cellGap = 3;
let sunEnergy = 300;
const sunValue = 25;
let zombiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 100;
const gameTime = 4 * 60 * 1000; // 4 minutes in milliseconds
let startTime;

const gameGrid = [];
const plants = [];
const zombies = [];
const zombiePositions = [];
const peas = [];
const suns = [];

// plant selection
const plantTypes = [
    { name: 'Peashooter', cost: 100 },
    { name: 'Sunflower', cost: 50 }
];
let selectedPlant = 0;

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

//TODO: add sprites for plants
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

class Peashooter extends Plant {
    constructor(x, y){
        super(x, y);
        this.cost = 100;
    }
    draw(){
        super.draw();
        ctx.fillStyle = 'darkgreen';
        ctx.font = '20px Arial';
        ctx.fillText('PS', this.x + 15, this.y + 60);
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

class Sunflower extends Plant {
    constructor(x, y){
        super(x, y);
        this.cost = 50;
        this.sunTimer = 0;
    }
    draw(){
        super.draw();
        ctx.fillStyle = 'yellow';
        ctx.font = '20px Arial';
        ctx.fillText('SF', this.x + 15, this.y + 60);
    }
    update(){
        this.sunTimer++;
        if (this.sunTimer % 300 === 0){
            suns.push(new Sun(this.x + this.width / 2, this.y));
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
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
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
function handleZombies(){
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
    if (frame % zombiesInterval === 0 && score < winningScore){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        zombies.push(new Zombie(verticalPosition));
        zombiePositions.push(verticalPosition);
        if (zombiesInterval > 120) zombiesInterval -= 50;
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
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
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
class Sun {
    constructor(x, y){
        this.x = x || Math.random() * (canvas.width - cellSize);
        this.y = y || 0 - cellSize;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = sunValue;
        this.speed = Math.random() * 1 + 0.5;
    }
    update(){
        this.y += this.speed;
    }
    draw(){
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleSuns(){
    if (frame % 100 === 0 && Math.random() < 0.3){
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
        if (suns[i] && suns[i].y > canvas.height){
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
        ctx.fillRect(0, cellSize * (i + 1), cellSize, cellSize);
        
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(plantTypes[i].name, 10, cellSize * (i + 1) + 30);
        ctx.fillText(plantTypes[i].cost, 10, cellSize * (i + 1) + 60);
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

    if (gameOver){
        ctx.fillStyle = 'black';
        ctx.font = '90px Arial';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score >= winningScore && zombies.length === 0){
        ctx.fillStyle = 'black';
        ctx.font = '60px Arial';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Arial';
        ctx.fillText('You win with ' + score + ' points!', 134, 340);
    }
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0,controlsBar.width, controlsBar.height);
    handleGameGrid();
    handlePlants();
    handleSuns();
    handlePeas();
    handleZombies();
    handleGameStatus();
    drawPlantSelectionMenu();
    frame++;
    
    if (Date.now() - startTime > gameTime) {
        gameOver = true;
    }
    
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