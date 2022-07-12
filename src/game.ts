import type { GameConfig } from './index.d';
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from './config';
import { GameScene } from './scenes';
import { ExampleScene } from './scenes/example';

export const gameConfig: GameConfig = {
  title: 'Gnosis',
  width: VIEWPORT_WIDTH,
  height: VIEWPORT_HEIGHT,
  parent: 'viewport',
  type: Phaser.WEBGL,
  scene: [ExampleScene],
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { y: 2000 },
      debug: false,
    },
  },
  backgroundColor: '#000033',
  pixelArt: true,
  roundPixels: false,
  antialias: false,
  debug: true,
};

export class GnosisGame extends Phaser.Game {
  onReady: () => Promise<void>;

  /**
   *
   */
  constructor(config: GameConfig = gameConfig, onReady: () => Promise<void>) {
    super(config);
    this.onReady = onReady;
    this.events.once('ready', this.onReady, this);

    if (gameConfig.debug) {
      // Debugging to see what's up
      globalThis.__debug = {
        totalGameObjects: 0,
        totalTextures: 0,
      };

      this.events.addListener('step', () => {
        let totalGameObjects = 0;
        let totalTextures = 0;
        let renderList = 0;
        let x = 0;
        let y = 0;

        for (const scene of this.scene.scenes as GameScene[]) {
          totalGameObjects += scene.children.length;

          if (scene.cityTile) {
            renderList += scene.cityTile.getBobCount();
          }

          scene.textures.each(() => {
            totalTextures += 1;
          }, scene);
          if (scene.player) {
            x = scene.player.x;
            y = scene.player.y;
          }
        }

        globalThis.__debug.totalGameObjects = totalGameObjects;
        globalThis.__debug.totalTextures = totalTextures;
        globalThis.__debug.x = x;
        globalThis.__debug.y = y;
        globalThis.__debug.renderList = renderList;
      });
    }
  }

  /**
   *
   */
  getScene(sceneKey: string) {
    return this.scene.getScene(sceneKey) as GameScene;
  }
}
