window.addEventListener('load', function() {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');


  canvas.width = 900;
  canvas.height = 600;

  const plantSelectionDiv = document.getElementById('plant-selection');

   const regularPlantButton = document.createElement('button');
   regularPlantButton.textContent = 'Plant (100)';
   regularPlantButton.addEventListener('click', () => selectedPlant = 'plant');
   const sunflowerButton = document.createElement('button');
   sunflowerButton.textContent = 'Sunflower (50)';
   sunflowerButton.addEventListener('click', () => selectedPlant = 'sunflower');
   plantSelectionDiv.appendChild(regularPlantButton);
   plantSelectionDiv.appendChild(sunflowerButton);

  //TODO setup the variable for the zombies and  the plants plant

  // global variables
  const cellSize = 100; //each cell will be 100px by 100px
  const cellGap = 3;   //gap between each cell is 3px
  const gameGrid = [];
  const plants = [];  //plants
  let numberOfSuns = 300;
  const zombies = []; //zombies

  // const ROWS = 5;
  // const COLS = 9;

  // mouse
  const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1
  }
  let canvasPosition = canvas.getBoundingClientRect();
  canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
  });
  canvas.addEventListener('mouseleave', function() {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  // game board
  const controlsBar = {
    width: canvas.width,
    height: cellSize,
  }

  class Cell {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = cellSize;
      this.height = cellSize;
    }
    draw() {
      if (mouse.x && mouse.y && collision(this, mouse)) {
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
      }
    }
  }

  function createGrid() {
       //FIXME:check which method for the grids is better, test it after constructing plants and zombies, the collision system for the grids should be funtional, the plants should snap into position when placed on the grid
    for (let y = cellSize; y < canvas.height; y += cellSize) {
      for (let x = 0; x < canvas.width; x += cellSize) {
        gameGrid.push(new Cell(x, y));
      }
    }
  }
  createGrid();

  function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
      gameGrid[i].draw();
    }
  }

  // plants
  class Plant {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = cellSize - cellGap * 2;
      this.height = cellSize - cellGap * 2;
      this.shooting = false;
      this.health = 100;
      this.projectiles = [];
      this.timer = 0;
    }
    draw() {
      ctx.fillStyle = 'blue';
      ctx.fillRect(this.x + cellGap, this.y + cellGap, this.width, this.height);
      ctx.fillStyle = 'gold';
      ctx.font = '20px Arial';
      ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
  }

  class Sunflower extends Plant {
    constructor(x, y) {
      super(x, y);
      this.timer = 0;
      this.sunProduction = 50;
      this.sunInterval = Math.random()*10000 + 5000; // Produce sun every 10 seconds
    }
    update() {
      this.timer += 16; 
      if (this.timer >= this.sunInterval) {
        numberOfSuns += this.sunProduction;
        this.timer = 0;
      }
    }
    draw() {
      ctx.fillStyle = 'yellow';
      ctx.fillRect(this.x + cellGap, this.y + cellGap, this.width, this.height);
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';    
      ctx.fillText('🌻', this.x + 25, this.y + 60);
    }
  }

  let selectedPlant = 'plant'; 

  canvas.addEventListener('click', function() {
    const gridPositionX = Math.floor(mouse.x / cellSize) * cellSize;
    const gridPositionY = Math.floor(mouse.y / cellSize) * cellSize;
    if (gridPositionY < cellSize) return;
    for (let i = 0; i < plants.length; i++) {
      if (plants[i].x === gridPositionX && plants[i].y === gridPositionY) return;
    }
    let plantCost = selectedPlant === 'sunflower' ? 50 : 100;
    if (numberOfSuns >= plantCost) {
      if (selectedPlant === 'sunflower') {
        plants.push(new Sunflower(gridPositionX, gridPositionY));
      } else {
        plants.push(new Plant(gridPositionX, gridPositionY));
      }
      numberOfSuns -= plantCost;
    }
  });

  function handlePlants() {
    for (let i = 0; i < plants.length; i++) {
      plants[i].draw();
      if (plants[i] instanceof Sunflower) {
        plants[i].update();
      }
    }
  }


    //TODO
  //zombies (mrigank working on movement and behaviour)
  //resources
  //utilities


  function handleGameStatus() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Suns: ' + numberOfSuns, 20, 40);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handlePlants();
    handleGameStatus();
    requestAnimationFrame(animate);
  }

  animate();



function collision(first, second) {
  if (!(first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y)
  ) {
    return true;
  }
  return false;
}
});