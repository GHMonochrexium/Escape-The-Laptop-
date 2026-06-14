let level9State = {
    cpu: { x: 900, y: 100, w: 100, h: 100 }, // Portal
    fans: [
        { x: 300, y: 300, w: 80, h: 80, angle: 0, speed: 0.1 },
        { x: 700, y: 500, w: 100, h: 100, angle: 0, speed: 0.05 }
    ],
    arcs: [
        { x: 450, y: 150, w: 20, h: 200, active: false, timer: 0, interval: 100 },
        { x: 150, y: 450, w: 200, h: 20, active: true, timer: 50, interval: 80 }
    ],
    packets: [
        { x: 200, y: 650, w: 20, h: 20, speedX: 4, minX: 200, maxX: 800, dir: 1 },
        { x: 600, y: 250, w: 20, h: 20, speedY: 3, minY: 50, maxY: 600, dir: 1 }
    ],
    ramBlocks: [
        { x: 550, y: 550, w: 60, h: 40 },
        { x: 250, y: 200, w: 40, h: 60 }
    ],
    circuits: [
        { x: 650, y: 600, w: 50, h: 50, activated: false, targetArc: 1 }
    ] // if ram block pushed here, deactivate arc
};

function initLevel9() {
    GameState.switchScreen('canvas');
    document.getElementById('level-indicator').innerText = "Level 9: The Hardware Core";
    
    GameState.player.x = 50;
    GameState.player.y = 700;
    
    // Reset state
    level9State.ramBlocks[0].x = 550; level9State.ramBlocks[0].y = 550;
    level9State.ramBlocks[1].x = 250; level9State.ramBlocks[1].y = 200;
    level9State.circuits[0].activated = false;
    
    if(GameState.animationFrameId) cancelAnimationFrame(GameState.animationFrameId);
    GameState.updateUI();
    loopLevel9();
}

function loopLevel9() {
    if (updateLevel9() === false) return;
    drawLevel9();
    GameState.animationFrameId = requestAnimationFrame(loopLevel9);
}

function updateLevel9() {
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

    // Fans
    level9State.fans.forEach(fan => {
        fan.angle += fan.speed;
        // Simple bounding box collision for fans
        if(checkCollision(playerRect, fan)) {
            GameState.takeDamage(1);
            GameState.player.x = oldX;
            GameState.player.y = oldY;
        }
    });

    // RAM Blocks
    level9State.ramBlocks.forEach(ram => {
        if(checkCollision(playerRect, ram)) {
            let pdx = GameState.player.x - oldX;
            let pdy = GameState.player.y - oldY;
            ram.x += pdx;
            ram.y += pdy;
            
            ram.x = Math.max(0, Math.min(GameState.canvas.width - ram.w, ram.x));
            ram.y = Math.max(0, Math.min(GameState.canvas.height - ram.h, ram.y));
        }
    });

    // Circuits & Arcs
    level9State.circuits.forEach((circ, index) => {
        circ.activated = false;
        level9State.ramBlocks.forEach(ram => {
            if(checkCollision(circ, ram)) circ.activated = true;
        });
        
        if(circ.activated && circ.targetArc < level9State.arcs.length) {
            level9State.arcs[circ.targetArc].active = false;
        }
    });

    level9State.arcs.forEach((arc, index) => {
        // Toggle logic if not overridden by circuit
        let overridden = false;
        level9State.circuits.forEach(c => {
            if(c.activated && c.targetArc === index) overridden = true;
        });

        if(!overridden) {
            arc.timer++;
            if(arc.timer > arc.interval) {
                arc.active = !arc.active;
                arc.timer = 0;
            }
        }

        if(arc.active && checkCollision(playerRect, arc)) {
            GameState.takeDamage(2);
            GameState.player.x = oldX;
            GameState.player.y = oldY;
        }
    });

    // Data Packets
    level9State.packets.forEach(pkt => {
        if(pkt.speedX) {
            pkt.x += pkt.speedX * pkt.dir;
            if(pkt.x > pkt.maxX || pkt.x < pkt.minX) pkt.dir *= -1;
        }
        if(pkt.speedY) {
            pkt.y += pkt.speedY * pkt.dir;
            if(pkt.y > pkt.maxY || pkt.y < pkt.minY) pkt.dir *= -1;
        }
        if(checkCollision(playerRect, pkt)) {
            GameState.takeDamage(5);
            GameState.player.x = oldX;
            GameState.player.y = oldY;
        }
    });

    // CPU Portal
    if(checkCollision(playerRect, level9State.cpu)) {
        cancelAnimationFrame(GameState.animationFrameId);
        startLevel10();
        return false;
    }

    if(GameState.player.hp <= 0) {
        GameState.player.hp = GameState.player.maxHp;
        GameState.player.x = 50;
        GameState.player.y = 700;
        GameState.updateUI();
    }

    return true;
}

function drawLevel9() {
    const ctx = GameState.ctx;
    
    // Background: Motherboard green
    ctx.fillStyle = '#0f380f';
    ctx.fillRect(0, 0, GameState.canvas.width, GameState.canvas.height);
    
    // Circuit lines
    ctx.strokeStyle = '#306230';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(100, 100); ctx.lineTo(100, 800);
    ctx.moveTo(300, 200); ctx.lineTo(800, 200);
    ctx.moveTo(500, 500); ctx.lineTo(500, 800);
    ctx.stroke();

    // Circuits (Sockets)
    level9State.circuits.forEach(circ => {
        ctx.fillStyle = circ.activated ? '#00ff00' : '#444';
        ctx.fillRect(circ.x, circ.y, circ.w, circ.h);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(circ.x, circ.y, circ.w, circ.h);
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText("SOCKET", circ.x+2, circ.y+25);
    });

    // Arcs
    level9State.arcs.forEach(arc => {
        if(arc.active) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            ctx.fillRect(arc.x, arc.y, arc.w, arc.h);
            // Zap effect
            ctx.beginPath();
            ctx.moveTo(arc.x + arc.w/2, arc.y);
            for(let i=0; i<arc.h; i+=10) {
                ctx.lineTo(arc.x + arc.w/2 + (Math.random()-0.5)*10, arc.y + i);
            }
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.fillRect(arc.x, arc.y, arc.w, arc.h);
        }
    });

    // RAM Blocks
    level9State.ramBlocks.forEach(ram => {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(ram.x, ram.y, ram.w, ram.h);
        ctx.fillStyle = '#f1c40f'; // Gold pins
        for(let i=0; i<ram.w; i+=10) {
            ctx.fillRect(ram.x + i, ram.y + ram.h - 5, 5, 5);
        }
        ctx.fillStyle = '#fff';
        ctx.fillText("RAM", ram.x+10, ram.y+20);
    });

    // Fans
    level9State.fans.forEach(fan => {
        ctx.save();
        ctx.translate(fan.x + fan.w/2, fan.y + fan.h/2);
        ctx.rotate(fan.angle);
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.arc(0, 0, fan.w/2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#bdc3c7';
        // Blades
        for(let i=0; i<4; i++) {
            ctx.rotate(Math.PI/2);
            ctx.fillRect(-5, -fan.w/2, 10, fan.w/2);
        }
        ctx.restore();
    });

    // Data Packets
    level9State.packets.forEach(pkt => {
        ctx.fillStyle = '#ff2a2a';
        ctx.fillRect(pkt.x, pkt.y, pkt.w, pkt.h);
        ctx.fillStyle = '#fff';
        ctx.fillText("DATA", pkt.x-5, pkt.y-5);
    });

    // CPU Tower (Portal)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(level9State.cpu.x, level9State.cpu.y, level9State.cpu.w, level9State.cpu.h);
    ctx.fillStyle = '#00ff00';
    ctx.font = '20px var(--font-code)';
    ctx.fillText("CPU", level9State.cpu.x + 30, level9State.cpu.y + 55);

    // Player
    ctx.fillStyle = GameState.player.color;
    ctx.fillRect(GameState.player.x, GameState.player.y, GameState.player.w, GameState.player.h);
}

window.initLevel9 = initLevel9;
