let level10State = {
    boss: { x: 400, y: 300, w: 100, h: 100, hp: 3, maxHp: 3, state: 'idle', timer: 0 },
    powerButton: { x: 450, y: 20, w: 100, h: 40, active: false, timer: 0 },
    projectiles: [],
    patches: [],
    patchesCollected: 0,
    startTime: 0
};

function initLevel10() {
    GameState.switchScreen('canvas');
    document.getElementById('level-indicator').innerText = "FINAL LEVEL: The OS Core";
    
    GameState.player.x = 450;
    GameState.player.y = 700;
    
    level10State.boss.hp = 3;
    level10State.boss.state = 'idle';
    level10State.powerButton.active = false;
    level10State.powerButton.timer = 0;
    level10State.projectiles = [];
    level10State.patches = [];
    level10State.patchesCollected = 0;
    level10State.startTime = Date.now();
    
    if(GameState.animationFrameId) cancelAnimationFrame(GameState.animationFrameId);
    GameState.updateUI();
    loopLevel10();
}

function loopLevel10() {
    if (updateLevel10() === false) return;
    drawLevel10();
    GameState.animationFrameId = requestAnimationFrame(loopLevel10);
}

function updateLevel10() {
    let speed = GameState.player.speed;
    if(GameState.inventory.boots > 0) speed *= 1.5;
    
    let oldX = GameState.player.x;
    let oldY = GameState.player.y;

    if(GameState.keys['w'] || GameState.keys['ArrowUp']) GameState.player.y -= speed;
    if(GameState.keys['s'] || GameState.keys['ArrowDown']) GameState.player.y += speed;
    if(GameState.keys['a'] || GameState.keys['ArrowLeft']) GameState.player.x -= speed;
    if(GameState.keys['d'] || GameState.keys['ArrowRight']) GameState.player.x += speed;
    
    GameState.player.x = Math.max(0, Math.min(GameState.canvas.width - GameState.player.w, GameState.player.x));
    GameState.player.y = Math.max(0, Math.min(GameState.canvas.height - GameState.player.h, GameState.player.y));
    
    let playerRect = {x: GameState.player.x, y: GameState.player.y, w: GameState.player.w, h: GameState.player.h};

    // Power Button Logic (Escape Ending)
    level10State.powerButton.timer++;
    if(level10State.powerButton.timer > 600) { // ~10 seconds
        level10State.powerButton.active = true;
    }
    
    if(level10State.powerButton.active && checkCollision(playerRect, level10State.powerButton)) {
        cancelAnimationFrame(GameState.animationFrameId);
        showWinScreen('escape');
        return false;
    }

    // Boss AI
    let boss = level10State.boss;
    boss.timer++;
    
    if(boss.timer > 100 && boss.hp > 0) {
        boss.timer = 0;
        // Attack
        let attackType = Math.random();
        if(attackType < 0.33) {
            // Throw Virus
            level10State.projectiles.push({
                type: 'virus', x: boss.x + boss.w/2, y: boss.y + boss.h/2, 
                w: 30, h: 30, vx: (Math.random()-0.5)*10, vy: Math.random()*5 + 2
            });
        } else if(attackType < 0.66) {
            // Throw Ad
            level10State.projectiles.push({
                type: 'ad', x: Math.random()*GameState.canvas.width, y: -50, 
                w: 60, h: 40, vx: 0, vy: 4
            });
        } else {
            // Throw Window
            level10State.projectiles.push({
                type: 'window', x: -100, y: Math.random()*GameState.canvas.height, 
                w: 80, h: 60, vx: 5, vy: 0
            });
        }
        
        // Spawn Patch occasionally
        if(Math.random() > 0.7 && level10State.patches.length < 3) {
            level10State.patches.push({
                x: Math.random() * (GameState.canvas.width - 20),
                y: Math.random() * (GameState.canvas.height - 20),
                w: 20, h: 20
            });
        }
    }

    // Projectiles
    for(let i = level10State.projectiles.length - 1; i >= 0; i--) {
        let p = level10State.projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        if(checkCollision(playerRect, p)) {
            GameState.takeDamage(5);
            level10State.projectiles.splice(i, 1);
            continue;
        }
        
        // Remove offscreen
        if(p.x > GameState.canvas.width + 100 || p.x < -100 || p.y > GameState.canvas.height + 100) {
            level10State.projectiles.splice(i, 1);
        }
    }

    // Patches
    for(let i = level10State.patches.length - 1; i >= 0; i--) {
        if(checkCollision(playerRect, level10State.patches[i])) {
            level10State.patchesCollected++;
            level10State.patches.splice(i, 1);
        }
    }

    // Boss Interaction
    if(checkCollision(playerRect, boss)) {
        if(level10State.patchesCollected >= 3) {
            // Repair Ending
            cancelAnimationFrame(GameState.animationFrameId);
            showWinScreen('protect');
            return false;
        } else if(GameState.keys[' ']) {
            // Attack Boss
            boss.hp--;
            GameState.player.x = oldX; // Bounce back
            GameState.player.y += 50;
            GameState.keys[' '] = false; // Prevent multiple hits
            
            if(boss.hp <= 0) {
                // Defeat Ending
                cancelAnimationFrame(GameState.animationFrameId);
                showWinScreen('control');
                return false;
            }
        } else {
            // Normal collision damage
            GameState.takeDamage(1);
            GameState.player.x = oldX;
            GameState.player.y = oldY;
        }
    }

    if(GameState.player.hp <= 0) {
        // Respawn and reset level 10
        GameState.player.hp = GameState.player.maxHp;
        initLevel10();
        return false;
    }

    return true;
}

function drawLevel10() {
    const ctx = GameState.ctx;
    
    // Background: Pulsing core
    let pulse = Math.abs(Math.sin(Date.now() / 500));
    ctx.fillStyle = `rgba(${Math.floor(pulse * 50)}, 0, ${Math.floor(pulse * 100)}, 1)`;
    ctx.fillRect(0, 0, GameState.canvas.width, GameState.canvas.height);
    
    // Power Button
    if(level10State.powerButton.active) {
        ctx.fillStyle = '#2ecc71';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#2ecc71';
    } else {
        ctx.fillStyle = '#7f8c8d';
        ctx.shadowBlur = 0;
    }
    ctx.fillRect(level10State.powerButton.x, level10State.powerButton.y, level10State.powerButton.w, level10State.powerButton.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(level10State.powerButton.active ? "ESCAPE" : "LOCKED", level10State.powerButton.x + 10, level10State.powerButton.y + 25);

    // Boss AI Core
    if(level10State.boss.hp > 0) {
        ctx.fillStyle = '#e74c3c';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#e74c3c';
        ctx.beginPath();
        ctx.arc(level10State.boss.x + level10State.boss.w/2, level10State.boss.y + level10State.boss.h/2, level10State.boss.w/2 + pulse*10, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px var(--font-code)';
        ctx.fillText("AI CORE", level10State.boss.x + 10, level10State.boss.y + 55);
        
        // HP Bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(level10State.boss.x, level10State.boss.y - 20, level10State.boss.w, 10);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(level10State.boss.x, level10State.boss.y - 20, (level10State.boss.hp / level10State.boss.maxHp) * level10State.boss.w, 10);
    }

    // Patches
    level10State.patches.forEach(p => {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#000';
        ctx.fillText("+", p.x+5, p.y+15);
    });

    // Projectiles
    level10State.projectiles.forEach(p => {
        if(p.type === 'virus') {
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(p.x, p.y, p.w, p.h);
        } else if(p.type === 'ad') {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#000';
            ctx.fillText("AD", p.x+5, p.y+25);
        } else if(p.type === 'window') {
            ctx.fillStyle = '#bdc3c7';
            ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(p.x, p.y, p.w, 15);
        }
    });

    // Player
    ctx.fillStyle = GameState.player.color;
    ctx.fillRect(GameState.player.x, GameState.player.y, GameState.player.w, GameState.player.h);

    // UI Instructions
    ctx.fillStyle = '#fff';
    ctx.font = '16px var(--font-code)';
    ctx.fillText("Patches Collected: " + level10State.patchesCollected + "/3", 20, 30);
    ctx.fillText("Survive to Escape. Hit Space near core to Attack. Collect Patches to Repair.", 20, 60);
}

window.initLevel10 = initLevel10;
