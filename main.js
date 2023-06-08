const GRID_WIDTH = 100;
const GRID_HEIGHT = 60;

let grid = new Array(GRID_WIDTH);
let writeGrid = new Array(GRID_WIDTH);

for (let i = 0; i < GRID_WIDTH; i++) {
    grid[i] = new Array(GRID_HEIGHT);
    writeGrid[i] = new Array(GRID_HEIGHT);
}

let canvas;

let mouseDown = false;
let mouseInDrawRegion = false;

function getDrawDims() {
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    let sizeForWidth = canvasWidth / GRID_WIDTH;
    let sizeForHeight = canvasHeight / GRID_HEIGHT;

    let cellSize = Math.min(sizeForWidth, sizeForHeight);

    let xOffset = (canvasWidth - cellSize * GRID_WIDTH) / 2;
    let yOffset = (canvasHeight - cellSize * GRID_HEIGHT) / 2;

    return {
        cellSize: cellSize,
        xOffset: xOffset,
        yOffset: yOffset
    };
}


    function base10ToBinary(base10) {
      let binary = "";
      for (let i = 0; i < 9; i++) {
        binary = (base10 % 2) + binary;
        base10 = Math.floor(base10 / 2);
      }
      return binary;
    }

function tryDrawAt(x, y, value) {
    if (value === undefined) value = true;

    let drawDims = getDrawDims();

    x = x - drawDims.xOffset - canvas.offsetLeft;
    y = y - drawDims.yOffset - canvas.offsetTop;

    let i = Math.floor(x / drawDims.cellSize);
    let j = Math.floor(y / drawDims.cellSize);

    if (i < 0 || i >= GRID_WIDTH || j < 0 || j >= GRID_HEIGHT) {
        return;
    }

    grid[i][j] = value;

    redraw();
}
    function binaryToBase10(binary) {
      let base10 = 0;
      for (let i = 0; i < binary.length; i++) {
        base10 += parseInt(binary[i]) * Math.pow(2, binary.length - i - 1);
      }
      return base10;
    }

function onLoad() {
    canvas = document.getElementById("canvas");

    // Randomly fill grid
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            grid[i][j] = Math.random() < 0.5;
        }
    }

    const body = document.getElementsByTagName("body")[0];

    const queryString = window.location.search;


    const urlParams = new URLSearchParams(queryString);

    let aliveRulesElement = document.getElementById("alive-rules");
    let deadRulesElement = document.getElementById("dead-rules");



    var alive = base10ToBinary(
      urlParams.get("alive") != undefined
        ? urlParams.get("alive")
        : binaryToBase10("001100000")
    );
    var dead = base10ToBinary(
      urlParams.get("dead") != undefined
        ? urlParams.get("dead")
        : binaryToBase10("000100000")
    );
    

    for (let i = 0; i < 9; i++) {
        aliveRulesElement.children[i].className = "rule-button" + (alive[i] === "1" ? " selected-rule" : "");
        deadRulesElement.children[i].className = "rule-button" + (dead[i] === "1" ? " selected-rule" : "");
    }



    body.addEventListener("mousedown", (e) => {
        mouseDown = true;
        tryDrawAt(e.clientX, e.clientY, !e.shiftKey);
    });
    body.addEventListener("mouseup", (e) => mouseDown = false);
    canvas.addEventListener("mousemove", (e) => {
        let drawDims = getDrawDims();

        let x = e.clientX - drawDims.xOffset - canvas.offsetLeft;
        let y = e.clientY - drawDims.yOffset - canvas.offsetTop;

        if (x < 0 || x >= drawDims.cellSize * GRID_WIDTH || y < 0 || y >= drawDims.cellSize * GRID_HEIGHT) {
            mouseInDrawRegion = false;
            return;
        }

        mouseInDrawRegion = true;

        if (!mouseDown) return;

        tryDrawAt(e.clientX, e.clientY, !e.shiftKey);
    });
    canvas.addEventListener("mouseenter", (e) => mouseInDrawRegion = true);
    canvas.addEventListener("mouseleave", (e) => mouseInDrawRegion = false);

    let buttons = document.getElementsByClassName("rule-button");

    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];

        button.addEventListener("click", (e) => {
            if (button.classList.contains("selected-rule")) {
                button.classList.remove("selected-rule");
            } else {
                button.classList.add("selected-rule");
            }
        });
    }

    const playButton = document.getElementsByClassName("play-button")[0];

    playButton.addEventListener("click", (e) => {
        if (playButton.classList.contains("pause")) {
            playButton.classList.remove("pause");
            playButton.classList.add("play");
        } else {
            playButton.classList.remove("play");
            playButton.classList.add("pause");
        }
    });

    [...document.getElementsByClassName("randomize-rule")].forEach((elem) => {
        elem.addEventListener("click", (e) => {
            const parent = elem.parentElement.parentElement;

            //Get all descendants of parent with class "rule-button"
            const buttons = parent.getElementsByClassName("rule-button");
            console.log(parent);
            console.log(buttons);

            [...buttons].forEach((button) => {
                button.classList.remove("selected-rule");

                if (Math.random() < 0.5) {
                    button.classList.add("selected-rule");
                }
            });
        });
    });

    redraw();
    setInterval(updateGOL, 1000 / 20);
}

function isPaused() {
    if (mouseDown && mouseInDrawRegion) return true;
    return !document.getElementsByClassName("play-button")[0].classList.contains("play");
}

function redraw() {
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    let sizeForWidth = canvasWidth / GRID_WIDTH;
    let sizeForHeight = canvasHeight / GRID_HEIGHT;

    let cellSize = Math.min(sizeForWidth, sizeForHeight);

    let xOffset = (canvasWidth - cellSize * GRID_WIDTH) / 2;
    let yOffset = (canvasHeight - cellSize * GRID_HEIGHT) / 2;

    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "#000000";

    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            if (grid[i][j]) {
                ctx.fillRect(xOffset + i * cellSize, yOffset + j * cellSize, cellSize, cellSize);
            }
        }
    }
}

function clickedCopy() {
    let aliveRulesElement = document.getElementById("alive-rules");
    let deadRulesElement = document.getElementById("dead-rules");

    let aliveRules = new Array(9).fill("0");
    let deadRules = new Array(9).fill("0");

    for (let i = 0; i < 9; i++) {
        aliveRules[i] = aliveRulesElement.children[i].classList.contains("selected-rule")? "1" : "0";
        deadRules[i] = deadRulesElement.children[i].classList.contains("selected-rule")? "1" : "0";
    }

    let alive = binaryToBase10(aliveRules.join(""));
    let dead = binaryToBase10(deadRules.join(""));

    let url = window.location.href.split("?")[0] + "?alive=" + alive + "&dead=" + dead;

    navigator.clipboard.writeText(url);
}

function updateGOL() {
    if (isPaused()) return;

    

    let aliveRulesElement = document.getElementById("alive-rules");
    let deadRulesElement = document.getElementById("dead-rules");

    let aliveRules = new Array(9).fill(false);
    let deadRules = new Array(9).fill(false);

    for (let i = 0; i < 9; i++) {
        aliveRules[i] = aliveRulesElement.children[i].classList.contains("selected-rule");
        deadRules[i] = deadRulesElement.children[i].classList.contains("selected-rule");
    }
    
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            let neighbors = 0;

            for (let x = i - 1; x <= i + 1; x++) {
                for (let y = j - 1; y <= j + 1; y++) {
                    if (x === i && y === j) {
                        continue;
                    }

                    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
                        continue;
                    }

                    if (grid[x][y]) {
                        neighbors++;
                    }
                }
            }

            writeGrid[i][j] = grid[i][j];

            if (grid[i][j]) {
                writeGrid[i][j] = aliveRules[neighbors];
            } else {
                writeGrid[i][j] = deadRules[neighbors];
            }
        }
    }

    let temp = grid;
    grid = writeGrid;
    writeGrid = temp;

    redraw();
}

function clearGrid() {
    grid = new Array(GRID_WIDTH).fill(0).map(() => new Array(GRID_HEIGHT).fill(false));
    redraw();
}

function randomizeGrid() {
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            grid[i][j] = Math.random() < 0.5;
        }
    }
    redraw();
}