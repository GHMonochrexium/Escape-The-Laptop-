let level2Items = [];
let level2Portal = {x: 800, y: 500, w: 60, h: 60};

function initLevel2() {
    GameState.switchScreen('canvas');
    document.getElementById('level-indicator').innerText = "Level 2: Pixel Sanctuary";
    
    // Setup Canvas
    const canvas = document.getElementById('game-canvas');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    GameState.canvas = canvas;
    GameState.ctx = canvas.getContext('2d');
    
    // Setup Player
    GameState.player.x = 100;
    GameState.player.y = canvas.height / 2;
    GameState.player.w = 30;
    GameState.player.h = 30;
    GameState.player.color = '#fff';
    
    // Spawn items
    level2Items = [
        { type: 'medkit', x: 300, y: 200, w: 20, h: 20, color: '#ff2a2a' },
        { type: 'flashlight', x: 500, y: 600, w: 20, h: 20, color: '#f1c40f' },
        { type: 'boots', x: 700, y: 300, w: 20, h: 20, color: '#3498db' }
    ];
    
    if(GameState.animationFrameId) cancelAnimationFrame(GameState.animationFrameId);
    GameState.updateUI();
    loopLevel2();
}

function loopLevel2() {
    if (updateLevel2() === false) return;
    drawLevel2();
    GameState.animationFrameId = requestAnimationFrame(loopLevel2);
}

function updateLevel2() {
    // Player movement
    let speed = GameState.player.speed;
    if(GameState.inventory.boots > 0) speed *= 1.5; // Speedy boots effect
    
    if(GameState.keys['w'] || GameState.keys['ArrowUp']) GameState.player.y -= speed;
    if(GameState.keys['s'] || GameState.keys['ArrowDown']) GameState.player.y += speed;
    if(GameState.keys['a'] || GameState.keys['ArrowLeft']) GameState.player.x -= speed;
    if(GameState.keys['d'] || GameState.keys['ArrowRight']) GameState.player.x += speed;
    
    // Bounds check
    GameState.player.x = Math.max(0, Math.min(GameState.canvas.width - GameState.player.w, GameState.player.x));
    GameState.player.y = Math.max(0, Math.min(GameState.canvas.height - GameState.player.h, GameState.player.y));
    
    // Item collision
    for(let i = level2Items.length - 1; i >= 0; i--) {
        let item = level2Items[i];
        if(checkCollision(GameState.player, item)) {
            GameState.addItem(item.type);
            level2Items.splice(i, 1);
        }
    }
    
    // Portal collision
    if(checkCollision(GameState.player, level2Portal)) {
        cancelAnimationFrame(GameState.animationFrameId);
        startLevel3();
        return false;
    }
    return true;
}

function drawLevel2() {
    const ctx = GameState.ctx;
    
    // Background
    ctx.fillStyle = '#27ae60'; // Pixel green
    ctx.fillRect(0, 0, GameState.canvas.width, GameState.canvas.height);
    
    // Draw some pixel trees
    ctx.fillStyle = '#2ecc71';
    for(let i=0; i<5; i++) {
        ctx.fillRect(200 + i*150, 100 + (i%2)*200, 50, 50);
    }
    
    // Items
    level2Items.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(item.x, item.y, item.w, item.h);
    });
    
    // Portal
    ctx.fillStyle = 'var(--neon-purple)';
    ctx.fillRect(level2Portal.x, level2Portal.y, level2Portal.w, level2Portal.h);
    ctx.fillStyle = '#fff';
    ctx.font = '20px var(--font-code)';
    ctx.fillText("EXIT", level2Portal.x + 5, level2Portal.y + 35);
    
    // Player
    ctx.fillStyle = GameState.player.color;
    ctx.fillRect(GameState.player.x, GameState.player.y, GameState.player.w, GameState.player.h);
}

function checkCollision(r1, r2) {
    return r1.x < r2.x + r2.w &&
           r1.x + r1.w > r2.x &&
           r1.y < r2.y + r2.h &&
           r1.y + r1.h > r2.y;
}

window.initLevel2 = initLevel2;
