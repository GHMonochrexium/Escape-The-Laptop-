let level5Entities = {
    portal: { x: 900, y: 100, w: 80, h: 80 }, // Recycle Bin
    cursor: { x: 500, y: 500, w: 30, h: 40, speed: 2 },
    windows: [
        { x: 300, y: 200, w: 150, h: 100, speedY: 3, dir: 1 },
        { x: 600, y: 400, w: 200, h: 150, speedY: -2, dir: 1 }
    ],
    folders: [
        { x: 200, y: 300, w: 60, h: 50, color: '#f39c12' },
        { x: 700, y: 100, w: 60, h: 50, color: '#f39c12' },
        { x: 400, y: 600, w: 60, h: 50, color: '#f39c12' }
    ]
};

function initLevel5() {
    GameState.switchScreen('canvas');
    document.getElementById('level-indicator').innerText = "Level 5: The Desktop";
    
    const canvas = GameState.canvas;
    
    // Setup Player
    GameState.player.x = 50;
    GameState.player.y = canvas.height - 100;
    
    // Reset entities to initial positions relative to canvas
    level5Entities.portal.x = canvas.width - 100;
    level5Entities.portal.y = 50;
    
    if(GameState.animationFrameId) cancelAnimationFrame(GameState.animationFrameId);
    GameState.updateUI();
    loopLevel5();
}

function loopLevel5() {
    if (updateLevel5() === false) return;
    drawLevel5();
    GameState.animationFrameId = requestAnimationFrame(loopLevel5);
}

function updateLevel5() {
    let speed = GameState.player.speed;
    if(GameState.inventory.boots > 0) speed *= 1.5;
    
    let oldX = GameState.player.x;
    let oldY = GameState.player.y;

    if(GameState.keys['w'] || GameState.keys['ArrowUp']) GameState.player.y -= speed;
    if(GameState.keys['s'] || GameState.keys['ArrowDown']) GameState.player.y += speed;
    if(GameState.keys['a'] || GameState.keys['ArrowLeft']) GameState.player.x -= speed;
    if(GameState.keys['d'] || GameState.keys['ArrowRight']) GameState.player.x += speed;
    
    // Bounds check
    GameState.player.x = Math.max(0, Math.min(GameState.canvas.width - GameState.player.w, GameState.player.x));
    GameState.player.y = Math.max(0, Math.min(GameState.canvas.height - GameState.player.h, GameState.player.y));
    
    // Cursor AI - chases player
    let dx = GameState.player.x - level5Entities.cursor.x;
    let dy = GameState.player.y - level5Entities.cursor.y;
    let dist = Math.hypot(dx, dy);
    if(dist > 0) {
        level5Entities.cursor.x += (dx / dist) * level5Entities.cursor.speed;
        level5Entities.cursor.y += (dy / dist) * level5Entities.cursor.speed;
    }

    // Cursor collision - push player
    if(checkCollision(GameState.player, level5Entities.cursor)) {
        GameState.player.x += (dx / dist) * 10;
        GameState.player.y += (dy / dist) * 10;
        GameState.takeDamage(0.5); // Minor constant damage while touching
    }

    // Windows update & collision
    level5Entities.windows.forEach(win => {
        win.y += win.speedY * win.dir;
        if(win.y <= 0 || win.y + win.h >= GameState.canvas.height) {
            win.dir *= -1;
        }
        if(checkCollision(GameState.player, win)) {
            GameState.takeDamage(1);
            // Bounce player back
            GameState.player.x = oldX;
            GameState.player.y = oldY;
        }
    });

    // Folders - pushable blocks
    level5Entities.folders.forEach(folder => {
        if(checkCollision(GameState.player, folder)) {
            // Determine push direction
            let pdx = GameState.player.x - oldX;
            let pdy = GameState.player.y - oldY;
            folder.x += pdx;
            folder.y += pdy;
            
            // Constrain folder
            folder.x = Math.max(0, Math.min(GameState.canvas.width - folder.w, folder.x));
            folder.y = Math.max(0, Math.min(GameState.canvas.height - folder.h, folder.y));
        }
        
        // Windows block folders
        level5Entities.windows.forEach(win => {
            if(checkCollision(folder, win)) {
                // simple block
                folder.x -= GameState.player.x - oldX;
                folder.y -= GameState.player.y - oldY;
            }
        });
    });

    // Portal collision
    if(checkCollision(GameState.player, level5Entities.portal)) {
        cancelAnimationFrame(GameState.animationFrameId);
        startLevel6();
        return false;
    }
    
    if(GameState.player.hp <= 0) {
        // Simple respawn
        GameState.player.hp = GameState.player.maxHp;
        GameState.player.x = 50;
        GameState.player.y = GameState.canvas.height - 100;
        GameState.updateUI();
    }
    
    return true;
}

function drawLevel5() {
    const ctx = GameState.ctx;
    
    // Background: Windows 95 teal
    ctx.fillStyle = '#008080';
    ctx.fillRect(0, 0, GameState.canvas.width, GameState.canvas.height);
    
    // Draw Windows
    level5Entities.windows.forEach(win => {
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(win.x, win.y, win.w, win.h);
        ctx.fillStyle = '#000080'; // title bar
        ctx.fillRect(win.x, win.y, win.w, 20);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText("Error.exe", win.x + 5, win.y + 14);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(win.x, win.y, win.w, win.h);
    });
    
    // Draw Folders
    level5Entities.folders.forEach(folder => {
        ctx.fillStyle = folder.color;
        ctx.fillRect(folder.x, folder.y, folder.w, folder.h);
        ctx.fillStyle = '#f1c40f'; // tab
        ctx.fillRect(folder.x, folder.y - 10, folder.w / 2, 10);
    });
    
    // Draw Portal (Recycle Bin)
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(level5Entities.portal.x, level5Entities.portal.y, level5Entities.portal.w, level5Entities.portal.h);
    ctx.fillStyle = '#000';
    ctx.fillText("Recycle", level5Entities.portal.x + 15, level5Entities.portal.y + 40);
    ctx.fillText("Bin", level5Entities.portal.x + 30, level5Entities.portal.y + 55);
    
    // Draw Cursor
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(level5Entities.cursor.x, level5Entities.cursor.y);
    ctx.lineTo(level5Entities.cursor.x + 20, level5Entities.cursor.y + 20);
    ctx.lineTo(level5Entities.cursor.x + 10, level5Entities.cursor.y + 25);
    ctx.lineTo(level5Entities.cursor.x + 15, level5Entities.cursor.y + 40);
    ctx.lineTo(level5Entities.cursor.x + 5, level5Entities.cursor.y + 45);
    ctx.lineTo(level5Entities.cursor.x, level5Entities.cursor.y + 30);
    ctx.lineTo(level5Entities.cursor.x - 10, level5Entities.cursor.y + 35);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    
    // Player
    ctx.fillStyle = GameState.player.color;
    ctx.fillRect(GameState.player.x, GameState.player.y, GameState.player.w, GameState.player.h);
}

// Ensure checkCollision is globally accessible or we redefine it. 
// It's defined in level2.js, but let's make a global utility or just use it assuming level2.js loaded.
// Actually, checkCollision in level2.js is NOT global, it's scoped to the file if it was a module, but it's loaded via <script>.
// Wait, level2.js declares `function checkCollision(r1, r2) { ... }` in the global scope. So it's accessible!
window.initLevel5 = initLevel5;
