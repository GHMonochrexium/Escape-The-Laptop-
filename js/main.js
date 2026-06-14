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

window.startLevel5 = function() {
    initLevel5();
};

window.startLevel6 = function() {
    initLevel6();
};

window.startLevel7 = function() {
    initLevel7();
};

window.startLevel8 = function() {
    initLevel8();
};

window.startLevel9 = function() {
    initLevel9();
};

window.startLevel10 = function() {
    initLevel10();
};

window.showWinScreen = function(endingType = 'escape') {
    GameState.switchScreen('win');
    GameState.stats.endTime = Date.now();
    
    let timeDiff = GameState.stats.endTime - GameState.stats.startTime;
    let seconds = Math.floor((timeDiff / 1000) % 60);
    let minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    
    document.getElementById('stat-time').innerText = `${minutes}m ${seconds}s`;
    document.getElementById('stat-ciphers').innerText = GameState.stats.ciphersSolved;
    document.getElementById('stat-items').innerText = GameState.stats.itemsCollected;
    document.getElementById('stat-answers').innerText = GameState.stats.correctFirewallAnswers;

    let titleEl = document.getElementById('win-title');
    let descEl = document.getElementById('win-desc');
    let winContainer = document.getElementById('screen-win');
    
    // Clear old classes
    winContainer.classList.remove('control', 'protect');

    if (endingType === 'escape') {
        titleEl.innerText = 'MISSION COMPLETE';
        descEl.innerText = 'You escaped the laptop and entered the real world!';
    } else if (endingType === 'control') {
        titleEl.innerText = 'SYSTEM OVERRIDE';
        descEl.innerText = 'You defeated the AI and became the new ruler of the computer!';
        winContainer.classList.add('control');
    } else if (endingType === 'protect') {
        titleEl.innerText = 'CORE RESTORED';
        descEl.innerText = 'You repaired the system and became its secret protector!';
        winContainer.classList.add('protect');
    }
};
