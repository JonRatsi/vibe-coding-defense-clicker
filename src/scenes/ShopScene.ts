import { Scene } from 'phaser';

interface ShopState {
    totalPoints: number;
    currentPoints: number;
    healthUpgrade: number;
    clickPowerUpgrade: number;
    healthCost: number;
    clickPowerCost: number;
}

export class ShopScene extends Scene {
    private state: ShopState = {
        totalPoints: 0,
        currentPoints: 0,
        healthUpgrade: 0,
        clickPowerUpgrade: 0,
        healthCost: 50,
        clickPowerCost: 50
    };

    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        // Récupérer les points totaux et les améliorations depuis le localStorage
        const savedTotalPoints = localStorage.getItem('totalPoints');
        const savedCurrentPoints = localStorage.getItem('currentScore');
        const savedHealthUpgrade = localStorage.getItem('healthUpgrade');
        const savedClickPowerUpgrade = localStorage.getItem('clickPowerUpgrade');

        if (savedTotalPoints) {
            this.state.totalPoints = parseInt(savedTotalPoints);
        }
        if (savedCurrentPoints) {
            this.state.currentPoints = parseInt(savedCurrentPoints);
            // Ajouter les points de la partie à l'historique
            this.state.totalPoints += this.state.currentPoints;
            localStorage.setItem('totalPoints', this.state.totalPoints.toString());
        }
        if (savedHealthUpgrade) {
            this.state.healthUpgrade = parseInt(savedHealthUpgrade);
        }
        if (savedClickPowerUpgrade) {
            this.state.clickPowerUpgrade = parseInt(savedClickPowerUpgrade);
        }

        // Titre
        this.add.text(
            this.cameras.main.centerX,
            100,
            'BOUTIQUE',
            {
                fontSize: '48px',
                color: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Points totaux
        this.add.text(
            this.cameras.main.centerX,
            150,
            'Points totaux: ' + this.state.totalPoints,
            {
                fontSize: '32px',
                color: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Points de la dernière partie
        this.add.text(
            this.cameras.main.centerX,
            200,
            'Points de la dernière partie: ' + this.state.currentPoints,
            {
                fontSize: '24px',
                color: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Bouton + PV
        const healthButton = this.add.text(
            this.cameras.main.centerX - 200,
            300,
            'Augmenter les PV\nCoût: ' + this.state.healthCost + ' points\nNiveau: ' + this.state.healthUpgrade,
            {
                fontSize: '24px',
                color: '#fff',
                align: 'center',
                backgroundColor: '#333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5)
        .setInteractive();

        // Bouton + Puissance de clic
        const clickPowerButton = this.add.text(
            this.cameras.main.centerX + 200,
            300,
            'Augmenter la puissance\nCoût: ' + this.state.clickPowerCost + ' points\nNiveau: ' + this.state.clickPowerUpgrade,
            {
                fontSize: '24px',
                color: '#fff',
                align: 'center',
                backgroundColor: '#333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5)
        .setInteractive();

        // Bouton Jouer
        const playButton = this.add.text(
            this.cameras.main.centerX,
            500,
            'JOUER',
            {
                fontSize: '32px',
                color: '#fff',
                align: 'center',
                backgroundColor: '#333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5)
        .setInteractive();

        // Gestion des clics
        healthButton.on('pointerdown', () => {
            if (this.state.totalPoints >= this.state.healthCost) {
                this.state.totalPoints -= this.state.healthCost;
                this.state.healthUpgrade++;
                this.state.healthCost = Math.floor(this.state.healthCost * 1.3);
                localStorage.setItem('totalPoints', this.state.totalPoints.toString());
                localStorage.setItem('healthUpgrade', this.state.healthUpgrade.toString());
                this.updateTexts();
            }
        });

        clickPowerButton.on('pointerdown', () => {
            if (this.state.totalPoints >= this.state.clickPowerCost) {
                this.state.totalPoints -= this.state.clickPowerCost;
                this.state.clickPowerUpgrade++;
                this.state.clickPowerCost = Math.floor(this.state.clickPowerCost * 1.3);
                localStorage.setItem('totalPoints', this.state.totalPoints.toString());
                localStorage.setItem('clickPowerUpgrade', this.state.clickPowerUpgrade.toString());
                this.updateTexts();
            }
        });

        playButton.on('pointerdown', () => {
            // Démarrer le jeu
            this.scene.start('GameScene');
        });
    }

    private updateTexts() {
        // Mettre à jour l'affichage des points totaux
        this.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text && child.text.includes('Points totaux:')) {
                child.setText('Points totaux: ' + this.state.totalPoints);
            }
        });

        // Mettre à jour les coûts et niveaux des boutons
        this.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text) {
                if (child.text.includes('Augmenter les PV')) {
                    child.setText('Augmenter les PV\nCoût: ' + this.state.healthCost + ' points\nNiveau: ' + this.state.healthUpgrade);
                } else if (child.text.includes('Augmenter la puissance')) {
                    child.setText('Augmenter la puissance\nCoût: ' + this.state.clickPowerCost + ' points\nNiveau: ' + this.state.clickPowerUpgrade);
                }
            }
        });
    }
} 