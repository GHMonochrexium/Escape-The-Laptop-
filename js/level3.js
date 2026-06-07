let enemies = [];
let level3Portal = {x: 900, y: 100, w: 60, h: 60};
let codeBlocks = [];

function initLevel3() {
    document.getElementById('level-indicator').innerText = "Level 3: The Computer Code";
    
    GameState.player.x = 50;
    GameState.player.y = GameState.canvas.height - 100;
    
    // Create more enemies with varying speeds and types
    enemies = [];
    for(let i=0; i<15; i++) {
        enemies.push({
            x: Math.random() * 800 + 100, // spawn away from player start
            y: Math.random() * 500 + 50,
            w: 30, h: 30,
            dx: (Math.random() - 0.5) * 8, // Faster baseline speed
            dy: (Math.random() - 0.5) * 8,
            type: Math.random() > 0.5 ? 'bouncer' : 'chaser'
        });
    }
    
    codeBlocks = [
        { text: "<div>", x: 200, y: 600 },
        { text: "function esc() {", x: 400, y: 400 },
        { text: "color: var(--neon-red);", x: 700, y: 250 },
        { text: "while(true) {", x: 150, y: 200 },
        { text: "throw new Error();", x: 800, y: 600 }
    ];
    
    if(GameState.animationFrameId) cancelAnimationFrame(GameState.animationFrameId);
    loopLevel3();
}

function loopLevel3() {
    if (updateLevel3() === false) return;
    drawLevel3();
    GameState.animationFrameId = requestAnimationFrame(loopLevel3);
}

function updateLevel3() {
    // Player movement
    let speed = GameState.player.speed;
    if(GameState.inventory.boots > 0) speed *= 1.5;
    
    if(GameState.keys['w'] || GameState.keys['ArrowUp']) GameState.player.y -= speed;
    if(GameState.keys['s'] || GameState.keys['ArrowDown']) GameState.player.y += speed;
    if(GameState.keys['a'] || GameState.keys['ArrowLeft']) GameState.player.x -= speed;
    if(GameState.keys['d'] || GameState.keys['ArrowRight']) GameState.player.x += speed;
    
    // Bounds check
    GameState.player.x = Math.max(0, Math.min(GameState.canvas.width - GameState.player.w, GameState.player.x));
    GameState.player.y = Math.max(0, Math.min(GameState.canvas.height - GameState.player.h, GameState.player.y));
    
    // Enemies
    enemies.forEach(e => {
        if(e.type === 'chaser') {
            // Move slowly towards player
            if(e.x < GameState.player.x) e.x += 1.5;
            if(e.x > GameState.player.x) e.x -= 1.5;
            if(e.y < GameState.player.y) e.y += 1.5;
            if(e.y > GameState.player.y) e.y -= 1.5;
        } else {
            // Bouncer logic
            e.x += e.dx;
            e.y += e.dy;
            if(e.x <= 0 || e.x + e.w >= GameState.canvas.width) e.dx *= -1;
            if(e.y <= 0 || e.y + e.h >= GameState.canvas.height) e.dy *= -1;
        }
        
        // Damage
        if(checkCollision(GameState.player, e)) {
            if(GameState.takeDamage(1)) { // Take 1 damage per frame touching
                // Respawn
                GameState.player.x = 50;
                GameState.player.y = GameState.canvas.height - 100;
                GameState.player.hp = 100;
                GameState.updateUI();
            }
        }
    });
    
    // Healing (Medkit usage with 'H' key)
    if(GameState.keys['h'] && GameState.inventory.medkit > 0 && GameState.player.hp < 100) {
        GameState.inventory.medkit--;
        GameState.heal(50);
        GameState.keys['h'] = false; // Prevent holding down
    }
    
    // Portal
    if(checkCollision(GameState.player, level3Portal)) {
        cancelAnimationFrame(GameState.animationFrameId);
        startLevel4();
        return false;
    }
    return true;
}

function drawLevel3() {
    const ctx = GameState.ctx;
    
    // Background
    ctx.fillStyle = '#0b0c10'; 
    ctx.fillRect(0, 0, GameState.canvas.width, GameState.canvas.height);
    
    // Flashlight logic (mask)
    if(GameState.inventory.flashlight > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(GameState.player.x + 15, GameState.player.y + 15, 200, 0, Math.PI * 2);
        ctx.clip();
    }
    
    // Grid / streams
    ctx.strokeStyle = '#1f2833';
    ctx.lineWidth = 1;
    for(let i=0; i<GameState.canvas.width; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, GameState.canvas.height); ctx.stroke();
    }
    for(let i=0; i<GameState.canvas.height; i+=50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(GameState.canvas.width, i); ctx.stroke();
    }
    
    // Code Blocks
    ctx.fillStyle = 'rgba(102, 252, 241, 0.3)';
    ctx.font = '24px var(--font-code)';
    codeBlocks.forEach(cb => {
        ctx.fillText(cb.text, cb.x, cb.y);
    });
    
    // Enemies
    ctx.fillStyle = 'var(--neon-red)';
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = '#fff';
        ctx.fillText("!ERR", e.x, e.y + 25);
        ctx.fillStyle = 'var(--neon-red)';
    });
    
    // Portal
    ctx.fillStyle = 'var(--neon-blue)';
    ctx.fillRect(level3Portal.x, level3Portal.y, level3Portal.w, level3Portal.h);
    ctx.fillStyle = '#000';
    ctx.fillText("CORE", level3Portal.x + 5, level3Portal.y + 35);
    
    // Player
    ctx.fillStyle = GameState.player.color;
    ctx.fillRect(GameState.player.x, GameState.player.y, GameState.player.w, GameState.player.h);
    
    if(GameState.inventory.flashlight > 0) {
        ctx.restore();
        // Draw dark overlay outside flashlight
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.beginPath();
        ctx.rect(0, 0, GameState.canvas.width, GameState.canvas.height);
        ctx.arc(GameState.player.x + 15, GameState.player.y + 15, 200, 0, Math.PI * 2, true);
        ctx.fill();
    }
}

window.initLevel3 = initLevel3;
