let level7State = {
    platforms: [],
    ads: [],
    popups: [],
    portal: { x: 3000, y: 300, w: 60, h: 60 },
    checkpoint: { x: 50, y: 300 },
    cameraX: 0,
    gravity: 0.5,
    playerVy: 0,
    isGrounded: false
};

function initLevel7() {
    GameState.switchScreen('canvas');
    document.getElementById('level-indicator').innerText = "Level 7: The Internet Browser";
    
    level7State.platforms = [
        { x: 0, y: 500, w: 400, h: 20 }, // Start platform
        { x: 450, y: 450, w: 200, h: 20 },
        { x: 700, y: 350, w: 150, h: 20 },
        { x: 950, y: 250, w: 100, h: 20 },
        { x: 1200, y: 400, w: 300, h: 20 }, // Checkpoint platform
        { x: 1600, y: 350, w: 100, h: 20 },
        { x: 1800, y: 300, w: 100, h: 20 },
        { x: 2000, y: 450, w: 400, h: 20 },
        { x: 2500, y: 350, w: 200, h: 20 },
        { x: 2900, y: 400, w: 300, h: 20 }  // End platform
    ];

    level7State.ads = [
        { x: 500, y: -100, w: 50, h: 50, speedY: 3 },
        { x: 800, y: -200, w: 60, h: 40, speedY: 4 },
        { x: 1300, y: -50, w: 70, h: 70, speedY: 2.5 },
        { x: 1700, y: -300, w: 40, h: 80, speedY: 5 },
        { x: 2100, y: -150, w: 50, h: 50, speedY: 3.5 }
    ];

    level7State.popups = [
        { x: 1200, y: 350, w: 40, h: 40, speedX: 2, dir: 1, minX: 1200, maxX: 1460 },
        { x: 2000, y: 400, w: 40, h: 40, speedX: 3, dir: 1, minX: 2000, maxX: 2360 }
    ];

    level7State.checkpoint = { x: 50, y: 400 };
    GameState.player.x = level7State.checkpoint.x;
    GameState.player.y = level7State.checkpoint.y;
    level7State.playerVy = 0;
    level7State.cameraX = 0;
    
    if(GameState.animationFrameId) cancelAnimationFrame(GameState.animationFrameId);
    GameState.updateUI();
    loopLevel7();
}

function loopLevel7() {
    if (updateLevel7() === false) return;
    drawLevel7();
    GameState.animationFrameId = requestAnimationFrame(loopLevel7);
}

function updateLevel7() {
    let speed = GameState.player.speed;
    if(GameState.inventory.boots > 0) speed *= 1.5;
    
    // Horizontal movement
    if(GameState.keys['a'] || GameState.keys['ArrowLeft']) GameState.player.x -= speed;
    if(GameState.keys['d'] || GameState.keys['ArrowRight']) GameState.player.x += speed;
    
    // Jump
    if((GameState.keys['w'] || GameState.keys['ArrowUp'] || GameState.keys[' ']) && level7State.isGrounded) {
        level7State.playerVy = -12;
        level7State.isGrounded = false;
    }
    
    // Gravity
    level7State.playerVy += level7State.gravity;
    GameState.player.y += level7State.playerVy;
    
    level7State.isGrounded = false;
    
    // Platform collisions
    let pRect = {x: GameState.player.x, y: GameState.player.y, w: GameState.player.w, h: GameState.player.h};
    level7State.platforms.forEach(plat => {
        if(checkCollision(pRect, plat)) {
            // Landing on top
            if(level7State.playerVy > 0 && pRect.y + pRect.h - level7State.playerVy <= plat.y) {
                GameState.player.y = plat.y - GameState.player.h;
                level7State.playerVy = 0;
                level7State.isGrounded = true;
                
                // Update checkpoint if landing on specific platforms (e.g., middle one)
                if(plat.x === 1200) {
                    level7State.checkpoint = { x: 1250, y: 350 };
                }
            }
        }
    });

    // Death by falling off screen
    if(GameState.player.y > GameState.canvas.height) {
        respawnLevel7();
    }

    // Ads logic
    level7State.ads.forEach(ad => {
        ad.y += ad.speedY;
        if(ad.y > GameState.canvas.height) ad.y = -100; // loop
        
        if(checkCollision({x: GameState.player.x, y: GameState.player.y, w: GameState.player.w, h: GameState.player.h}, ad)) {
            GameState.takeDamage(10);
            respawnLevel7();
        }
    });

    // Popups logic
    level7State.popups.forEach(pop => {
        pop.x += pop.speedX * pop.dir;
        if(pop.x < pop.minX || pop.x > pop.maxX) pop.dir *= -1;
        
        if(checkCollision({x: GameState.player.x, y: GameState.player.y, w: GameState.player.w, h: GameState.player.h}, pop)) {
            GameState.takeDamage(5);
            respawnLevel7();
        }
    });

    // Portal collision
    if(checkCollision({x: GameState.player.x, y: GameState.player.y, w: GameState.player.w, h: GameState.player.h}, level7State.portal)) {
        cancelAnimationFrame(GameState.animationFrameId);
        startLevel8();
        return false;
    }
    
    // Update Camera
    level7State.cameraX = GameState.player.x - GameState.canvas.width / 3;
    if(level7State.cameraX < 0) level7State.cameraX = 0;
    
    return true;
}

function respawnLevel7() {
    GameState.player.x = level7State.checkpoint.x;
    GameState.player.y = level7State.checkpoint.y;
    level7State.playerVy = 0;
}

function drawLevel7() {
    const ctx = GameState.ctx;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, GameState.canvas.width, GameState.canvas.height);
    
    ctx.save();
    ctx.translate(-level7State.cameraX, 0);
    
    // Draw Platforms (Tabs)
    level7State.platforms.forEach(plat => {
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.fillStyle = '#7f8c8d';
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
        
        ctx.fillStyle = '#2c3e50';
        ctx.font = '10px Arial';
        ctx.fillText("New Tab", plat.x + 5, plat.y + 14);
    });
    
    // Draw Ads
    level7State.ads.forEach(ad => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(ad.x, ad.y, ad.w, ad.h);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText("BUY", ad.x + 5, ad.y + 20);
        ctx.fillText("NOW", ad.x + 5, ad.y + 35);
    });

    // Draw Popups
    level7State.popups.forEach(pop => {
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(pop.x, pop.y, pop.w, pop.h);
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText("VIRUS!", pop.x + 2, pop.y + 20);
    });

    // Draw Portal
    ctx.fillStyle = 'var(--neon-blue)';
    ctx.fillRect(level7State.portal.x, level7State.portal.y, level7State.portal.w, level7State.portal.h);
    ctx.fillStyle = '#fff';
    ctx.fillText("ESCAPE", level7State.portal.x + 5, level7State.portal.y + 35);

    // Draw Checkpoint Bookmark Flag
    ctx.fillStyle = '#3498db';
    ctx.fillRect(level7State.checkpoint.x, level7State.checkpoint.y - 40, 10, 40); // pole
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(level7State.checkpoint.x + 10, level7State.checkpoint.y - 40);
    ctx.lineTo(level7State.checkpoint.x + 30, level7State.checkpoint.y - 30);
    ctx.lineTo(level7State.checkpoint.x + 10, level7State.checkpoint.y - 20);
    ctx.fill();

    // Player
    ctx.fillStyle = GameState.player.color;
    ctx.fillRect(GameState.player.x, GameState.player.y, GameState.player.w, GameState.player.h);
    
    ctx.restore();
}

window.initLevel7 = initLevel7;
