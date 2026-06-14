let level6Grid = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,3,0,0,1,0,0,0,1,0,0,0,0,4,1,1],
    [1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1],
    [1,0,1,0,0,0,2,0,0,0,1,0,2,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,3,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1],
    [1,3,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const tileSize = 50;
let keysCollected = 0;

function initLevel6() {
    GameState.switchScreen('canvas');
    document.getElementById('level-indicator').innerText = "Level 6: File Explorer Maze";
    
    // Setup Player
    GameState.player.x = 60;
    GameState.player.y = 60;
    keysCollected = 0;
    
    if(GameState.animationFrameId) cancelAnimationFrame(GameState.animationFrameId);
    GameState.updateUI();
    loopLevel6();
}

function loopLevel6() {
    if (updateLevel6() === false) return;
    drawLevel6();
    GameState.animationFrameId = requestAnimationFrame(loopLevel6);
}

function updateLevel6() {
    let speed = GameState.player.speed;
    if(GameState.inventory.boots > 0) speed *= 1.5;
    
    let nextX = GameState.player.x;
    let nextY = GameState.player.y;

    if(GameState.keys['w'] || GameState.keys['ArrowUp']) nextY -= speed;
    if(GameState.keys['s'] || GameState.keys['ArrowDown']) nextY += speed;
    if(GameState.keys['a'] || GameState.keys['ArrowLeft']) nextX -= speed;
    if(GameState.keys['d'] || GameState.keys['ArrowRight']) nextX += speed;
    
    // Check collisions with grid
    let playerRect = {x: nextX, y: nextY, w: GameState.player.w, h: GameState.player.h};
    let canMove = true;
    let hitPortal = false;
    
    for(let r=0; r<level6Grid.length; r++) {
        for(let c=0; c<level6Grid[r].length; c++) {
            let tile = level6Grid[r][c];
            if(tile !== 0) {
                let tileRect = {x: c*tileSize, y: r*tileSize, w: tileSize, h: tileSize};
                if(checkCollision(playerRect, tileRect)) {
                    if(tile === 1) {
                        canMove = false; // Wall
                    } else if(tile === 2) {
                        // Locked door
                        if(keysCollected > 0) {
                            keysCollected--;
                            level6Grid[r][c] = 0; // unlock
                        } else {
                            canMove = false;
                        }
                    } else if(tile === 3) {
                        // Key
                        keysCollected++;
                        level6Grid[r][c] = 0;
                    } else if(tile === 4) {
                        // Portal
                        hitPortal = true;
                    }
                }
            }
        }
    }
    
    if(canMove) {
        GameState.player.x = nextX;
        GameState.player.y = nextY;
    } else {
        // Try sliding
        playerRect = {x: GameState.player.x, y: nextY, w: GameState.player.w, h: GameState.player.h};
        let canMoveY = true;
        for(let r=0; r<level6Grid.length; r++) {
            for(let c=0; c<level6Grid[r].length; c++) {
                if(level6Grid[r][c] === 1 || level6Grid[r][c] === 2) {
                    if(checkCollision(playerRect, {x: c*tileSize, y: r*tileSize, w: tileSize, h: tileSize})) canMoveY = false;
                }
            }
        }
        if(canMoveY) GameState.player.y = nextY;
        
        playerRect = {x: nextX, y: GameState.player.y, w: GameState.player.w, h: GameState.player.h};
        let canMoveX = true;
        for(let r=0; r<level6Grid.length; r++) {
            for(let c=0; c<level6Grid[r].length; c++) {
                if(level6Grid[r][c] === 1 || level6Grid[r][c] === 2) {
                    if(checkCollision(playerRect, {x: c*tileSize, y: r*tileSize, w: tileSize, h: tileSize})) canMoveX = false;
                }
            }
        }
        if(canMoveX) GameState.player.x = nextX;
    }
    
    if(hitPortal) {
        cancelAnimationFrame(GameState.animationFrameId);
        startLevel7();
        return false;
    }
    
    return true;
}

function drawLevel6() {
    const ctx = GameState.ctx;
    
    // Background
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, GameState.canvas.width, GameState.canvas.height);
    
    // Draw Grid
    for(let r=0; r<level6Grid.length; r++) {
        for(let c=0; c<level6Grid[r].length; c++) {
            let tile = level6Grid[r][c];
            let tx = c * tileSize;
            let ty = r * tileSize;
            
            if(tile === 1) {
                // Wall / Folder
                ctx.fillStyle = '#f39c12';
                ctx.fillRect(tx, ty, tileSize, tileSize);
                ctx.strokeStyle = '#e67e22';
                ctx.strokeRect(tx, ty, tileSize, tileSize);
                // Folder detail
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(tx + 5, ty + 5, tileSize/2, 10);
            } else if(tile === 2) {
                // Locked door
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(tx, ty, tileSize, tileSize);
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.fillText("🔒", tx + 15, ty + 30);
            } else if(tile === 3) {
                // Key (Shortcut)
                ctx.fillStyle = '#3498db';
                ctx.fillRect(tx + 10, ty + 10, tileSize - 20, tileSize - 20);
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.fillText("🔗", tx + 15, ty + 35);
            } else if(tile === 4) {
                // Portal (System Access)
                ctx.fillStyle = 'var(--neon-purple)';
                ctx.fillRect(tx, ty, tileSize, tileSize);
                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.fillText("ACCESS", tx + 2, ty + 20);
                ctx.fillText("FILE", tx + 10, ty + 35);
            }
        }
    }
    
    // Draw Key Count
    ctx.fillStyle = '#000';
    ctx.font = '20px var(--font-code)';
    ctx.fillText("Shortcuts (Keys): " + keysCollected, 20, 30);
    
    // Player
    ctx.fillStyle = GameState.player.color;
    ctx.fillRect(GameState.player.x, GameState.player.y, GameState.player.w, GameState.player.h);
}

window.initLevel6 = initLevel6;
