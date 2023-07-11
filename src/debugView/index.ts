import {
  FOV_HEIGHT,
  FOV_WIDTH,
  DEBUG_MODE
} from '../config';
import Player from '../player'
import { showPerformance } from './performance';

export default class DebugView {
  game: Phaser.Game
  container: Phaser.GameObjects.Container
  text: Phaser.GameObjects.Text
  active: boolean

  /**
   * 
   */
  constructor (scene: Phaser.Scene, active = DEBUG_MODE) {
    this.active = active

    const rect = scene.add.rectangle(0, 0, FOV_WIDTH, FOV_HEIGHT);
    rect.setStrokeStyle(2, 0x1a65ac);

    this.text = scene.add.text(
      FOV_WIDTH / -2,
      FOV_HEIGHT / -2,
      `${FOV_WIDTH / -2}/${FOV_HEIGHT / -2}`,
      {
        fontFamily: 'serif',
      }
    );

    this.container = scene.add.container(0, 0);
    this.container.add([rect, this.text]);

    if (this.active === true) {
      showPerformance();

      globalThis.__debug = {
        totalGameObjects: 0,
        totalTextures: 0,
      };

      scene.game.events.addListener('step', () => {
        let totalGameObjects = 0;
        let totalTextures = 0;
        let renderList = 0;
        let x = 0;
        let y = 0;

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
  update (player: Player) {
    if (this.active && this.container) {
      this.text.text = `${
        FOV_WIDTH / -2 + player.sprite.x
      }/${FOV_HEIGHT / -2 + player.sprite.y}`;

      this.container.x = player.sprite.x;
      this.container.y = player.sprite.y;
    }
  }
}
