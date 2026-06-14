let level8State = {
    tokens: [
        { x: 100, y: 100, w: 20, h: 20, collected: false },
        { x: 700, y: 600, w: 20, h: 20, collected: false },
        { x: 500, y: 200, w: 20, h: 20, collected: false }
    ],
    bridges: [
        { x: 300, y: 300, w: 200, h: 50, repaired: false },
        { x: 600, y: 400, w: 50, h: 200, repaired: false }
    ],
    viruses: [
        { x: 200, y: 500, w: 40, h: 40, speed: 2, glitchTimer: 0 },
        { x: 800, y: 300, w: 40, h: 40, speed: 2.5, glitchTimer: 0 },
        { x: 400, y: 700, w: 40, h: 40, speed: 1.5, glitchTimer: 0 }
    ],
    scanner: { x: 850, y: 100, w: 80, h: 80 },
    tokensCount: 0,
    glitchEffect: 0
};

function initLevel8() {
    GameState.switchScreen('canvas');
    document.getElementById('level-indicator').innerText = "Level 8: The Virus Zone";
    
    GameState.player.x = 50;
    GameState.player.y = 50;
    
    level8State.tokens.forEach(t => t.collected = false);
    level8State.bridges.forEach(b => b.repaired = false);
    level8State.tokensCount = 0;
    level8State.glitchEffect = 0;
    
    // Reset virus positions
    level8State.viruses[0].x = 200; level8State.viruses[0].y = 500;
    level8State.viruses[1].x = 800; level8State.viruses[1].y = 300;
    level8State.viruses[2].x = 400; level8State.viruses[2].y = 700;
    
    if(GameState.animationFrameId) cancelAnimationFrame(GameState.animationFrameId);
    GameState.updateUI();
    loopLevel8();
}

function loopLevel8() {
    if (updateLevel8() === false) return;
    drawLevel8();
    GameState.animationFrameId = requestAnimationFrame(loopLevel8);
}

function updateLevel8() {
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
    
    let playerRect = {x: GameState.player.x, y: GameState.player.y, w: GameState.player.w, h: GameState.player.h};

    // Tokens
    level8State.tokens.forEach(t => {
        if(!t.collected && checkCollision(playerRect, t)) {
            t.collected = true;
            level8State.tokensCount++;
        }
    });

    // Corrupted Bridges
    level8State.bridges.forEach(b => {
        if(checkCollision(playerRect, b)) {
            if(!b.repaired) {
                if(level8State.tokensCount > 0) {
                    level8State.tokensCount--;
                    b.repaired = true;
                } else {
                    // Block player and deal damage
                    GameState.player.x = oldX;
                    GameState.player.y = oldY;
                    GameState.takeDamage(0.5);
                }
            }
        }
    });

    // Viruses AI
    level8State.viruses.forEach(v => {
        v.glitchTimer++;
        if(v.glitchTimer > 60) {
            // Random teleport/glitch movement
            v.x += (Math.random() - 0.5) * 100;
            v.y += (Math.random() - 0.5) * 100;
            v.glitchTimer = 0;
        } else {
            // Chase
            let dx = GameState.player.x - v.x;
            let dy = GameState.player.y - v.y;
            let dist = Math.hypot(dx, dy);
            if(dist > 0) {
                v.x += (dx / dist) * v.speed;
                v.y += (dy / dist) * v.speed;
            }
        }

        // Clamp
        v.x = Math.max(0, Math.min(GameState.canvas.width - v.w, v.x));
        v.y = Math.max(0, Math.min(GameState.canvas.height - v.h, v.y));

        if(checkCollision(playerRect, v)) {
            GameState.takeDamage(2);
            GameState.player.x += (Math.random() - 0.5) * 20; // Player gets glitched back
            GameState.player.y += (Math.random() - 0.5) * 20;
        }
    });

    // Scanner
    if(checkCollision(playerRect, level8State.scanner)) {
        cancelAnimationFrame(GameState.animationFrameId);
        startLevel9();
        return false;
    }
    
    if(GameState.player.hp <= 0) {
        // Respawn
        GameState.player.hp = GameState.player.maxHp;
        GameState.player.x = 50;
        GameState.player.y = 50;
        GameState.updateUI();
    }
    
    level8State.glitchEffect = Math.random();
    
    return true;
}

function drawLevel8() {
    const ctx = GameState.ctx;
    
    // Background
    if(level8State.glitchEffect > 0.95) {
        ctx.fillStyle = '#ff00ff'; // Glitch flash
    } else {
        ctx.fillStyle = '#110011'; // Dark corrupt bg
    }
    ctx.fillRect(0, 0, GameState.canvas.width, GameState.canvas.height);
    
    // Grid lines for "code" feel
    ctx.strokeStyle = '#330033';
    for(let i=0; i<GameState.canvas.width; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, GameState.canvas.height); ctx.stroke();
    }
    
    // Bridges
    level8State.bridges.forEach(b => {
        if(b.repaired) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // Safe
        } else {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Corrupted
        }
        ctx.fillRect(b.x, b.y, b.w, b.h);
        
        if(!b.repaired && Math.random() > 0.8) {
            // Glitch bridge effect
            ctx.fillStyle = '#fff';
            ctx.fillRect(b.x + Math.random()*b.w, b.y + Math.random()*b.h, 10, 10);
        }
    });

    // Tokens
    level8State.tokens.forEach(t => {
        if(!t.collected) {
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(t.x + t.w/2, t.y + t.h/2, t.w/2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText("S", t.x + 6, t.y + 15);
        }
    });

    // Viruses
    level8State.viruses.forEach(v => {
        ctx.fillStyle = '#ff0000';
        let gx = v.x + (Math.random()-0.5)*10;
        let gy = v.y + (Math.random()-0.5)*10;
        ctx.fillRect(gx, gy, v.w, v.h);
        ctx.fillStyle = '#000';
        ctx.fillText("X", gx + 15, gy + 25);
    });

    // Scanner (Portal)
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(level8State.scanner.x, level8State.scanner.y, level8State.scanner.w, level8State.scanner.h);
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.fillText("ANTIVIRUS", level8State.scanner.x + 5, level8State.scanner.y + 45);

    // Player
    ctx.fillStyle = GameState.player.color;
    ctx.fillRect(GameState.player.x, GameState.player.y, GameState.player.w, GameState.player.h);
    
    // UI
    ctx.fillStyle = '#fff';
    ctx.font = '20px var(--font-code)';
    ctx.fillText("Security Tokens: " + level8State.tokensCount, 20, 30);
}

window.initLevel8 = initLevel8;
