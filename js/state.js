const GameState = {
    currentScreen: 'main-menu',
    inventory: {
        medkit: 0,
        flashlight: 0,
        boots: 0
    },
    player: {
        hp: 100,
        maxHp: 100,
        x: 0,
        y: 0,
        speed: 5
    },
    stats: {
        startTime: null,
        endTime: null,
        ciphersSolved: 0,
        itemsCollected: 0,
        correctFirewallAnswers: 0
    },
    
    // Engine references
    canvas: null,
    ctx: null,
    animationFrameId: null,
    keys: {},
    
    switchScreen(newScreenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${newScreenId}`).classList.add('active');
        this.currentScreen = newScreenId;
    },

    updateUI() {
        document.getElementById('hp-text').innerText = `HP: ${this.player.hp}`;
        document.querySelector('.hp-fill').style.width = `${(this.player.hp / this.player.maxHp) * 200}px`;
        
        document.querySelector('#slot-medkit .count').innerText = this.inventory.medkit;
        document.querySelector('#slot-flashlight .count').innerText = this.inventory.flashlight;
        document.querySelector('#slot-boots .count').innerText = this.inventory.boots;
    },

    addItem(type) {
        if(this.inventory[type] !== undefined) {
            this.inventory[type]++;
            this.stats.itemsCollected++;
            this.updateUI();
        }
    },

    heal(amount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
        this.updateUI();
    },

    takeDamage(amount) {
        this.player.hp = Math.max(0, this.player.hp - amount);
        this.updateUI();
        if(this.player.hp <= 0) {
            // Respawn mechanic handled in level logic
            return true; // Return true if dead
        }
        return false;
    }
};

window.GameState = GameState;
