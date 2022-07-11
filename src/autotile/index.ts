import {
  TILE_HEIGHT,
  TILE_WIDTH,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
} from '../config';
import { GameScene } from '../scenes';

export class AutoTile {
  name: string;
  textureUrlsOrPaths: string[];
  jsonPathOrUrl: string;
  onCreate: (scene: GameScene, autoTile: AutoTile) => AutoTile;
  bobs: Phaser.GameObjects.Bob[];
  blitter: Phaser.GameObjects.Blitter;
  private pool: Phaser.GameObjects.Group;

  constructor(
    name: string,
    textureUrlsOrPaths: string[],
    jsonPathOrUrl: string
    // onCreate: () => AutoTile
  ) {
    this.name = name;
    this.textureUrlsOrPaths = textureUrlsOrPaths;
    this.jsonPathOrUrl = jsonPathOrUrl;
    // this.onCreate = onCreate;
    this.bobs = [];
  }

  /**
   *
   */
  preload(scene: GameScene) {
    scene.loadAtlas(this.name, this.textureUrlsOrPaths, this.jsonPathOrUrl);
  }

  /**
   *
   */
  create(scene: GameScene) {
    this.pool = scene.add.group({
      defaultKey: `${this.name}-pool`,
    });

    this.blitter = scene.add.blitter(0, 0, this.name);
    // this.onCreate(scene, this);
    // Update `worldView` before first render

    // Force the first cull
    scene.cameras.main.dirty = true;
  }

  /**
   *
   */
  addTile(x: number, y: number, name: string) {
    const bob = this.blitter.create(x, y, name);
    // this.pool.add(bob)
    /*
    if (this.bobs[0] && x < this.bobs[0].x) {
      this.bobs.unshift(bob);
    } else {
      this.bobs.push(bob);
    }
*/
    return bob;
  }

  /**
   *
   */
  static update(scene: GameScene) {
    if (!scene.cameras.main.dirty) {
      return;
    }

    const currentX = scene.cameras.main.worldView.x;
    const currentY = scene.cameras.main.worldView.y;

    const leftBound = currentX - TILE_WIDTH * 3;
    const rightBound = currentX + VIEWPORT_WIDTH * 1.5 + TILE_WIDTH * 3;
    const upperBound = currentY - TILE_HEIGHT * 3;
    const lowerBound = currentY + VIEWPORT_HEIGHT * 1.5 + TILE_HEIGHT * 3;

    for (let i = 0, len = scene.autotile.bobs.length; i < len; i++) {
      const tile = scene.autotile.bobs[i];

      if (tile && tile.x > rightBound) {
        tile.visible = false;
      } else {
        tile.visible = true;
      }
    }

    document.getElementById('debug').innerHTML = `
    <div>Current X: ${currentX}</div>
    <div>Current Y: ${currentY}</div>
    <div>Left Bound: ${leftBound}</div>
    <div>Right Bound: ${rightBound}</div>
    <div>Upper Bound: ${upperBound}</div>
    <div>Lower Bound: ${lowerBound}</div>
  `;
  }
}
