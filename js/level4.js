const pygameQuestions = [
    {
        q: "Which function starts the main game loop in many python frameworks?",
        opts: ["run()", "start()", "loop()", "init()"],
        ans: 0
    },
    {
        q: "What command updates the screen in Pygame?",
        opts: ["pygame.display.flip()", "pygame.update()", "screen.draw()", "pygame.render()"],
        ans: 0
    },
    {
        q: "Which event is used to detect when the player closes the window?",
        opts: ["pygame.QUIT", "pygame.CLOSE", "pygame.EXIT", "pygame.END"],
        ans: 0
    }
];

let firewallQuestions = [];
let currentQuestionIndex = 0;

function initLevel4() {
    GameState.switchScreen('level-4');
    
    // Shuffle and pick 3 questions (we only have 3 so just use them)
    firewallQuestions = [...pygameQuestions];
    currentQuestionIndex = 0;
    
    loadFirewallQuestion();
}

function loadFirewallQuestion() {
    if(currentQuestionIndex >= firewallQuestions.length) {
        checkFirewallWin();
        return;
    }
    
    const qData = firewallQuestions[currentQuestionIndex];
    document.getElementById('quiz-question').innerText = qData.q;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    qData.opts.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'cyber-btn small';
        btn.innerText = opt;
        btn.onclick = () => {
            if(index === qData.ans) {
                GameState.stats.correctFirewallAnswers++;
                btn.style.background = 'var(--neon-green)';
                btn.style.color = '#000';
            } else {
                btn.style.background = 'var(--neon-red)';
                btn.style.color = '#fff';
            }
            
            // Disable all buttons
            Array.from(optionsContainer.children).forEach(b => b.disabled = true);
            
            setTimeout(() => {
                currentQuestionIndex++;
                loadFirewallQuestion();
            }, 1000);
        };
        optionsContainer.appendChild(btn);
    });
}

function checkFirewallWin() {
    if(GameState.stats.correctFirewallAnswers >= 1) {
        document.getElementById('firewall-dialogue').innerHTML = "<p style='color: var(--neon-green)'>YOU HAVE PROVEN YOUR WORTH. YOU MAY PASS.</p>";
        setTimeout(showWinScreen, 2000);
    } else {
        document.getElementById('firewall-dialogue').innerHTML = "<p style='color: var(--neon-red)'>ACCESS DENIED. REBOOTING SEQUENCE...</p>";
        setTimeout(() => {
            currentQuestionIndex = 0;
            loadFirewallQuestion();
        }, 2000);
    }
}

window.initLevel4 = initLevel4;
