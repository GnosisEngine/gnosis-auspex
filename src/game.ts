import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from './config';
import { ExampleScene } from './scenes/example';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Gnosis',
  width: VIEWPORT_WIDTH,
  height: VIEWPORT_HEIGHT,
  parent: 'viewport',
  type: Phaser.WEBGL,
  scene: [ExampleScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 2000 },
      debug: false,
    },
  },
  backgroundColor: '#000033',
  pixelArt: true,
  roundPixels: false,
  antialias: false,
};

export class GnosisGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig = GameConfig) {
    super(config);
  }
}
