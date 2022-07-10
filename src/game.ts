import type { GameConfig } from './index.d';
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from './config';
import { GameScene } from './scenes';
import { ExampleScene } from './scenes/example';

export class GnosisGame extends Phaser.Game {
  onReady: () => Promise<void>;

  /**
   *
   */
  constructor(
    config: GameConfig = {
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
    },
    onReady: () => Promise<void>
  ) {
    super(config);
    this.onReady = onReady;
    this.events.once('ready', this.onReady, this);
  }

  /**
   *
   */
  getScene(sceneKey: string) {
    return this.scene.getScene(sceneKey) as GameScene;
  }
}
