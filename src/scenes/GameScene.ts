import { Scene } from 'phaser';

interface Enemy {
    sprite: Phaser.GameObjects.Sprite;
    health: number;
    maxHealth: number;
}

interface GameState {
    score: number;
    highScore: number;
    clickPower: number;
    enemies: Enemy[];
    spawnRate: number;
    health: number;
    maxHealth: number;
    difficultyTimer: number;
    centerZone: Phaser.GameObjects.Graphics | null;
    isGameOver: boolean;
    powerfulEnemyChance: number;
}

export class GameScene extends Scene {
    private state: GameState = {
        score: 0,
        highScore: 0,
        clickPower: 1,
        enemies: [],
        spawnRate: 2000,
        health: 5,
        maxHealth: 5,
        difficultyTimer: 0,
        centerZone: null,
        isGameOver: false,
        powerfulEnemyChance: 0.1 // 10% de chance d'avoir un ennemi puissant au début
    };

    private scoreText!: Phaser.GameObjects.Text;
    private highScoreText!: Phaser.GameObjects.Text;
    private healthText!: Phaser.GameObjects.Text;
    private clickPowerText!: Phaser.GameObjects.Text;
    private spawnTimer!: Phaser.Time.TimerEvent;
    private difficultyTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Charger le high score et les améliorations depuis le localStorage
        const savedHighScore = localStorage.getItem('highScore');
        const savedHealthUpgrade = localStorage.getItem('healthUpgrade');
        const savedClickPowerUpgrade = localStorage.getItem('clickPowerUpgrade');

        if (savedHighScore) {
            this.state.highScore = parseInt(savedHighScore);
        }

        // Appliquer les améliorations
        if (savedHealthUpgrade) {
            this.state.maxHealth = 5 + parseInt(savedHealthUpgrade);
        }
        if (savedClickPowerUpgrade) {
            this.state.clickPower = 1 + parseInt(savedClickPowerUpgrade);
            this.clickPowerText.setText('Puissance: ' + this.state.clickPower);
        }

        // Créer la zone centrale
        this.state.centerZone = this.add.graphics();
        this.state.centerZone.lineStyle(2, 0xff0000);
        this.state.centerZone.fillStyle(0xff0000, 0.3);
        this.state.centerZone.strokeCircle(this.cameras.main.centerX, this.cameras.main.centerY, 60);
        this.state.centerZone.fillCircle(this.cameras.main.centerX, this.cameras.main.centerY, 60);

        // Réinitialiser l'état du jeu
        this.state.isGameOver = false;
        this.state.score = 0;
        this.state.health = this.state.maxHealth;
        this.state.spawnRate = 1000; // Plus rapide au début
        this.state.enemies = [];
        this.state.powerfulEnemyChance = 0.2; // Plus d'ennemis puissants au début

        // Créer les textes d'interface
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', color: '#fff' });
        this.highScoreText = this.add.text(16, 50, 'High Score: ' + this.state.highScore, { fontSize: '32px', color: '#fff' });
        this.healthText = this.add.text(16, 84, 'PV: ' + this.state.health + '/' + this.state.maxHealth, { fontSize: '32px', color: '#fff' });
        this.clickPowerText = this.add.text(16, 118, 'Puissance: ' + this.state.clickPower, { fontSize: '32px', color: '#fff' });
        this.add.text(16, 152, 'Points: ' + localStorage.getItem('totalPoints') || '0', { fontSize: '32px', color: '#fff' });

        // Démarrer le spawn d'ennemis
        this.spawnTimer = this.time.addEvent({
            delay: this.state.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Démarrer le timer de difficulté
        this.difficultyTimer = this.time.addEvent({
            delay: 6000, // Augmente la difficulté toutes les 6 secondes
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });

        // Ajouter l'événement de clic
        this.input.on('pointerdown', this.handleClick, this);
    }

    private spawnEnemy() {
        if (this.state.isGameOver) return;

        // Spawn les ennemis sur les bords de l'écran
        const side = Phaser.Math.Between(0, 3); // 0: haut, 1: droite, 2: bas, 3: gauche
        let x = 0, y = 0;

        switch (side) {
            case 0: // haut
                x = Phaser.Math.Between(50, 950);
                y = 50;
                break;
            case 1: // droite
                x = 950;
                y = Phaser.Math.Between(50, 750);
                break;
            case 2: // bas
                x = Phaser.Math.Between(50, 950);
                y = 750;
                break;
            case 3: // gauche
                x = 50;
                y = Phaser.Math.Between(50, 750);
                break;
        }
        
        const isPowerful = Math.random() < this.state.powerfulEnemyChance;
        const enemyHealth = isPowerful ? 3 : 1;
        const enemy = this.add.sprite(x, y, 'enemy');
        enemy.setInteractive();
        enemy.setScale(1.5);
        
        // Définir la couleur en fonction de la santé
        this.updateEnemyColor(enemy, enemyHealth);
        
        this.state.enemies.push({
            sprite: enemy,
            health: enemyHealth,
            maxHealth: enemyHealth
        });
    }

    private updateEnemyColor(sprite: Phaser.GameObjects.Sprite, currentHealth: number) {
        // Désactiver la teinte par défaut
        sprite.clearTint();
        
        // Appliquer une nouvelle teinte avec une opacité maximale
        switch (currentHealth) {
            case 3:
                sprite.setTintFill(0x00ff00); // Vert vif pour 3 PV
                break;
            case 2:
                sprite.setTintFill(0x0000ff); // Bleu vif pour 2 PV
                break;
            case 1:
                sprite.setTintFill(0xff0000); // Rouge vif pour 1 PV
                break;
            default:
                sprite.setTintFill(0xff0000);
        }
    }

    private handleClick(pointer: Phaser.Input.Pointer) {
        if (this.state.isGameOver) return;

        const clickedEnemy = this.state.enemies.find(enemy => 
            enemy.sprite.getBounds().contains(pointer.x, pointer.y)
        );

        if (clickedEnemy) {
            // Réduire les PV de l'ennemi
            clickedEnemy.health -= this.state.clickPower;
            
            // Mettre à jour la couleur de l'ennemi
            this.updateEnemyColor(clickedEnemy.sprite, clickedEnemy.health);

            // Si l'ennemi est mort
            if (clickedEnemy.health <= 0) {
                // Augmenter le score en fonction des PV max de l'ennemi
                this.state.score += clickedEnemy.maxHealth;
                this.scoreText.setText('Score: ' + this.state.score);

                // Vérifier le high score
                if (this.state.score > this.state.highScore) {
                    this.state.highScore = this.state.score;
                    this.highScoreText.setText('High Score: ' + this.state.highScore);
                    localStorage.setItem('highScore', this.state.highScore.toString());
                }

                // Supprimer l'ennemi
                clickedEnemy.sprite.destroy();
                this.state.enemies = this.state.enemies.filter(e => e !== clickedEnemy);
            }
        }
    }

    private increaseDifficulty() {
        if (this.state.isGameOver) return;

        // Augmenter la vitesse de spawn
        this.state.spawnRate = Math.max(300, this.state.spawnRate - 150); // Réduction plus rapide
        this.spawnTimer.reset({
            delay: this.state.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Augmenter la chance d'avoir des ennemis puissants
        this.state.powerfulEnemyChance = Math.min(0.8, this.state.powerfulEnemyChance + 0.08); // Augmentation plus rapide
    }

    update() {
        if (this.state.isGameOver) return;

        // Faire bouger les ennemis vers le centre
        this.state.enemies.forEach(enemy => {
            const angle = Math.atan2(
                this.cameras.main.centerY - enemy.sprite.y,
                this.cameras.main.centerX - enemy.sprite.x
            );
            enemy.sprite.x += Math.cos(angle) * 2;
            enemy.sprite.y += Math.sin(angle) * 2;

            // Vérifier si l'ennemi a atteint le centre
            const distanceToCenter = Phaser.Math.Distance.Between(
                enemy.sprite.x,
                enemy.sprite.y,
                this.cameras.main.centerX,
                this.cameras.main.centerY
            );

            if (distanceToCenter < 60) { // Augmenté pour correspondre à la taille de la zone
                // L'ennemi a atteint le centre
                enemy.sprite.destroy();
                this.state.enemies = this.state.enemies.filter(e => e !== enemy);
                this.state.health--;
                this.healthText.setText('PV: ' + this.state.health + '/' + this.state.maxHealth);

                // Vérifier le game over
                if (this.state.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }

    gameOver() {
        this.state.isGameOver = true;

        // Sauvegarder le score de la partie
        localStorage.setItem('currentScore', this.state.score.toString());

        // Sauvegarder le high score
        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            localStorage.setItem('highScore', this.state.highScore.toString());
        }

        // Arrêter les timers
        this.spawnTimer.destroy();
        this.difficultyTimer.destroy();

        // Supprimer tous les ennemis restants
        this.state.enemies.forEach(enemy => enemy.sprite.destroy());
        this.state.enemies = [];

        // Afficher le message de game over
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'GAME OVER\nScore: ' + this.state.score + '\nHigh Score: ' + this.state.highScore,
            {
                fontSize: '48px',
                color: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Aller à la boutique après 3 secondes
        this.time.delayedCall(3000, () => {
            this.scene.start('ShopScene');
        });
    }
} 