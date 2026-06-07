// Input handling
window.addEventListener('keydown', (e) => {
    GameState.keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    GameState.keys[e.key] = false;
});

// Initialization
document.getElementById('btn-start').onclick = () => {
    GameState.stats.startTime = Date.now();
    initLevel1();
};

document.getElementById('btn-restart').onclick = () => {
    location.reload(); // Simple restart
};

// Global Level Transition Hooks
window.startLevel2 = function() {
    initLevel2();
};

window.startLevel3 = function() {
    initLevel3();
};

window.startLevel4 = function() {
    initLevel4();
};

window.showWinScreen = function() {
    GameState.switchScreen('win');
    GameState.stats.endTime = Date.now();
    
    let timeDiff = GameState.stats.endTime - GameState.stats.startTime;
    let seconds = Math.floor((timeDiff / 1000) % 60);
    let minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    
    document.getElementById('stat-time').innerText = `${minutes}m ${seconds}s`;
    document.getElementById('stat-ciphers').innerText = GameState.stats.ciphersSolved;
    document.getElementById('stat-items').innerText = GameState.stats.itemsCollected;
    document.getElementById('stat-answers').innerText = GameState.stats.correctFirewallAnswers;
};
