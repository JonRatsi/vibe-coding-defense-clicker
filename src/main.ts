import 'phaser';
import { GameScene } from './scenes/GameScene';
import { ShopScene } from './scenes/ShopScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1000,
    height: 800,
    backgroundColor: '#000000',
    parent: 'game',
    scene: [ShopScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    }
};

new Phaser.Game(config); 