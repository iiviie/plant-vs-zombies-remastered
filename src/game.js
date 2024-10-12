window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
  
    canvas.width = 900;
    canvas.height = 600;
  
    //TODO setup the variable for the zombies and  the plants plant
  
    //global variables
      const cellSize = 100; //each cell will be 100px by 100px
      const cellGap = 3; //gap between each cell is 3px
      const gameGrid = []; 
      const plants = []; //plants
      let plantCost = 100;
      const zombies = []; //zombies
      // const ROWS = 5;
      // const COLS = 9;
  
    //mouse
      const mouse = {
          x: 10,
          y: 10,
          width: 0.1,
          height: 0.1
      }
      let canvasPosition = canvas.getBoundingClientRect();
      console.log(canvasPosition);
      canvas.addEventListener('mousemove', function(e){
          mouse.x = e.x - canvasPosition.left;
          mouse.y = e.y - canvasPosition.top;
      });
      canvas.addEventListener('mouseleave', function(){
          mouse.x = undefined;
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
  
          //FIXME:check which method for the grids is better, test it after constructing plants and zombies, the collision system for the grids should be funtional, the plants should snap into position when placed on the grid
  
          //FIXME:a potential bug to avoid is to not allow the plants to be placed on the same grid as the other plants
  
          // for (let i = 0; i < ROWS; i++) {
          //     for (let j = 0; j < COLS; j++) {
          //         ctx.strokeRect(j * GRID_SIZE, i * GRID_SIZE, GRID_SIZE, GRID_SIZE);
          //     }
          // }
  
          for (let y = cellSize; y < canvas.height; y += cellSize){
              for (let x = 0; x < canvas.width; x += cellSize){
                  gameGrid.push(new Cell(x, y));
              }
          }
      }
      createGrid()
      function handleGameGrid(){
          for (let i = 0; i < gameGrid.length; i++){
              gameGrid[i].draw();
          }
      }   
    //projectiles
    //plants  //TODO
    
    class Plant {
      constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
        this.shooting = false;
        this.health = 100;
        this.projectiles = [];
        this.timer=0;
      }
      update(){
      }
      draw(){
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
          ctx.font = '20px Arial';    
          ctx.fillText(Math.floor(this.health), this.x, this.y);
      }
    }
  
  
  
    //TODO
      //zombies (mrigank working on movement and behaviour)
      //resources
      //utilities
  
  
    function animate(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = 'blue';
      ctx.fillRect(0,0,controlsBar.width,controlsBar.height);
      handleGameGrid()
      requestAnimationFrame(animate);
    } 
  
    animate();
  });
  
  
  
  //collision detection btw rectangles
  function collision(first, second){
      if (   !(first.x > second.x + second.width || 
              first.x + first.width < second.x || 
              first.y > second.y + second.height || 
              first.y + first.height < second.y)
          ){
          return true;
      }; 
  }