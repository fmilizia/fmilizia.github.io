const svg = document.getElementById('svg');
const increaseSizeButton = document.getElementById("increaseSizeButton");
const decreaseSizeButton = document.getElementById("decreaseSizeButton");
const sizeEl = document.getElementById("sizeValue");
const startButton = document.getElementById("startButton");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const historyCount = document.getElementById("historyCount");

var new_N = 11;
var N = 13;

const cells = [];
var n_moves = 0;
const moves = [];
var finished = false;

sizeEl.innerHTML = new_N;
increaseSizeButton.onclick = function(){if(new_N < 20) new_N = new_N + 1; sizeEl.innerHTML = new_N;}
decreaseSizeButton.onclick = function(){if(new_N > 3) new_N = new_N - 1; sizeEl.innerHTML = new_N;}
startButton.onclick = function(){deleteGame(); N = new_N + 2; initGame();}
undoButton.onclick = function(){undoMove();}
redoButton.onclick = function(){redoMove();}


function updatePlayerIndicator(){
    //~ let next_col = (n_moves % 2 == 0) ? window.getComputedStyle(cells[0][1].hexagon).fill : window.getComputedStyle(cells[1][0].hexagon).fill;
    //~ turnInd.style.backgroundColor = next_col;
    let next_player = (n_moves % 2 == 0) ? "A" : "B";
    let prev_player = (n_moves % 2 == 0) ? "B" : "A";
    for(let i=0; i<N; i+=N-1) for(let j=0; j<N; j+=N-1){
        cells[i][j].hexagon.classList.remove("occupied-cell-" + prev_player);
        cells[i][j].hexagon.classList.add("occupied-cell-" + next_player);
    }
}
function updateHistoryLine(){
    undoButton.disabled = (n_moves == 0);
    redoButton.disabled = (n_moves == moves.length);
    historyCount.innerHTML = n_moves + " / " + moves.length;
}


class Cell{
    owner = "";       //Can be "", "A" or "B".
    enabled = true;
    
    constructor(i,j,hex){
        this.hexagon = hex;
        this.i = i;
        this.j = j;
        
        if (i == 0 || j == 0 || i == N - 1 || j == N - 1){
            this.enabled = false;
            if (i > 0 && i < N - 1) this.occupy("B");
            else if (j > 0 && j < N - 1) this.occupy("A");
            else this.hexagon.setAttribute("class", "corner-cell");
        }else{
            this.hexagon.setAttribute("class", "free-cell");
        }
        this.hexagon.addEventListener("click", this.handleCellClick.bind(this));
    }
    
    occupy(new_owner){
        this.owner = new_owner;
        this.enabled = false;
        this.hexagon.setAttribute("class", "occupied-cell-" + this.owner);
    }
    unoccupy(){
        this.owner = "";
        this.enabled = true;
        this.hexagon.setAttribute("class", "free-cell");
    }
    
    makeMove(){
        let current_player = (n_moves % 2 == 0) ? "A" : "B";
        this.occupy(current_player);
        n_moves++;
        checkGame(current_player);
    }
    handleCellClick(){
        if(finished) return;
        if(this.enabled == false) return;
        moves.length = n_moves;
        moves.push([this.i,this.j]);
        this.makeMove();
        updatePlayerIndicator();
        updateHistoryLine();
    }
    
    kill(){
        this.enabled = false;
        this.hexagon.classList.add("killed-cell");
    }
    resurrect(){
        this.hexagon.classList.remove("killed-cell");
        if(this.hexagon.classList.contains("free-cell")) this.enabled = true;
    }
}

function checkGame(owner){
    let visited = [];
    for(let i=0; i<N; i++){
        let vr = [];
        for(let j=0; j<N; j++) vr.push(0);
        visited.push(vr);
    }
    if(owner == "A") exploreColor(0,1,"A",visited);
    if(owner == "B") exploreColor(1,0,"B",visited);
}
function exploreColor(i,j,color,visited){
    if(i < 0 || i >= N || j < 0 || j >= N) return;
    if(visited[i][j] > 0) return;
    visited[i][j] = 1;
    if(cells[i][j].owner != color) return;
    if(color == "A" && i == N-1) endGame("A");
    if(color == "B" && j == N-1) endGame("B");
    exploreColor(i+1,j,color,visited);
    exploreColor(i+1,j+1,color,visited);
    exploreColor(i,j+1,color,visited);
    exploreColor(i-1,j-1,color,visited);
    exploreColor(i-1,j,color,visited);
    exploreColor(i,j-1,color,visited);
}
function endGame(winner){
    finished = true;
    for(let i=1; i<N-1; i++) for(let j=1; j<N-1; j++){
        if(cells[i][j].owner != winner) cells[i][j].kill();
    }
}

function undoMove(){
    if(n_moves <= 0) return;
    let i = moves[n_moves-1][0];
    let j = moves[n_moves-1][1];
    cells[i][j].unoccupy();
    n_moves--;
    if(finished){
        finished = false;
        for(let i=1; i<N-1; i++) for(let j=1; j<N-1; j++) cells[i][j].resurrect();
    }
    updatePlayerIndicator();
    updateHistoryLine();
}
function redoMove(){
    if(moves.length <= n_moves) return;
    let i = moves[n_moves][0];
    let j = moves[n_moves][1];
    cells[i][j].makeMove();
    updatePlayerIndicator();
    updateHistoryLine();
}

//Returns an hexagon, without appending it to the svg.
function newHexagon(x, y, rx, ry){
    let hex = document.createElementNS("http://www.w3.org/2000/svg","polygon");
    let pts = [ [4,1], [3,0], [1,0], [0,1], [1,2], [3,2] ];
    for(p of pts){
        let point = svg.createSVGPoint();
        point.x = 1.732 * rx * (x + p[0]);
        point.y = ry * (y + p[1]);
        hex.points.appendItem(point);
    }
    return hex;
}

function deleteGame(){
    for(let i=0; i<N; i++) for(let j=0; j<N; j++) svg.removeChild(cells[i][j].hexagon);
    cells.length = 0;
    moves.length = 0;
    n_moves = 0;
    finished = false;
}
function initGame(){
    N = new_N + 2;
    for(let i=0; i<N; i++){
        let cell_line = [];
        for(let j=0; j<N; j++){
            let hex = newHexagon(3 * (N + j - i - 1), i + j, 100.0/(6*N-2), 100.0/(2*N));
            let c = new Cell(i,j,hex);
            cell_line.push(c);
        }
        cells.push(cell_line);
    }
    
    for(let i=1; i<=N-1; i++) for(let j=1; j<=N-1; j++) svg.appendChild(cells[i][j].hexagon);
    for(let i=1; i<=N-1; i++){
        svg.appendChild(cells[0][i].hexagon);
        svg.appendChild(cells[i][0].hexagon);
        svg.appendChild(cells[N-1][i].hexagon);
        svg.appendChild(cells[i][N-1].hexagon);
    }
    svg.appendChild(cells[0][0].hexagon);
    svg.appendChild(cells[0][N-1].hexagon);
    svg.appendChild(cells[N-1][0].hexagon);
    svg.appendChild(cells[N-1][N-1].hexagon);
    
    updatePlayerIndicator();
    updateHistoryLine();
}

initGame();
