import { Scene } from 'phaser';

export class PreloadScene extends Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Créer un sprite simple pour l'ennemi
        const graphics = this.add.graphics();
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('enemy', 32, 32);
        graphics.destroy();
    }

    create() {
        this.scene.start('GameScene');
    }
} 