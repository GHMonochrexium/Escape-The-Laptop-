const wordList = [
    "CAT", "DOG", "BIRD", "FISH", "TREE", "BOOK", "PEN", "CODE", 
    "GAME", "PLAY", "RUN", "JUMP", "STAR", "MOON", "SUN", "FIRE", 
    "WATER", "EARTH", "WIND", "ROCK", "PAPER", "CHAIR", "DESK", 
    "DOOR", "WALL", "ROOF", "HOME", "HOUSE", "CITY", "TOWN", 
    "ROAD", "CAR", "BUS", "TRAIN", "BIKE", "SHIP", "BOAT", "PLANE", 
    "BEAR", "LION", "TIGER", "WOLF", "FOX", "DEER", "FROG", "SNAKE"
];

let ciphers = [];
let currentCipherIndex = 0;

function generateCiphers() {
    ciphers = [];
    for(let i=0; i<3; i++) {
        const word = wordList[Math.floor(Math.random() * wordList.length)];
        const shift = Math.floor(Math.random() * 5) + 1; // shift 1 to 5
        let coded = "";
        for(let j=0; j<word.length; j++) {
            let charCode = word.charCodeAt(j);
            let newCode = charCode + shift;
            if(newCode > 90) newCode -= 26; // wrap around Z
            coded += String.fromCharCode(newCode);
        }
        ciphers.push({ coded: coded, answer: word, shift: shift });
    }
}

function initLevel1() {
    GameState.switchScreen('level-1');
    currentCipherIndex = 0;
    generateCiphers();
    loadCipher();
    
    document.getElementById('btn-submit-cipher').onclick = () => {
        const input = document.getElementById('cipher-input').value.toUpperCase().trim();
        const feedback = document.getElementById('cipher-feedback');
        
        if (input === ciphers[currentCipherIndex].answer) {
            feedback.style.color = 'var(--neon-green)';
            feedback.innerText = "ACCESS GRANTED.";
            GameState.stats.ciphersSolved++;
            currentCipherIndex++;
            
            setTimeout(() => {
                if (currentCipherIndex < ciphers.length) {
                    loadCipher();
                } else {
                    feedback.innerText = "SYSTEM UNLOCKED. PORTAL OPENING...";
                    setTimeout(startLevel2, 2000);
                }
            }, 1000);
        } else {
            feedback.style.color = 'var(--neon-red)';
            feedback.innerText = "ACCESS DENIED. INCORRECT CIPHER.";
        }
    };
    
    document.getElementById('cipher-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById('btn-submit-cipher').click();
        }
    });
}

function loadCipher() {
    const cipher = ciphers[currentCipherIndex];
    document.getElementById('cipher-question').innerText = `DECODE: ${cipher.coded} (Shift: ${cipher.shift})`;
    document.getElementById('cipher-input').value = '';
    document.getElementById('cipher-feedback').innerText = '';
    document.getElementById('cipher-input').focus();
}

window.initLevel1 = initLevel1;
