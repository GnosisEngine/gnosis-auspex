import {
  BLITTER_SORT_DELAY,
  TILE_HEIGHT,
  TILE_WIDTH,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
} from '../config';
import { GameScene } from '../scenes';

/**
 *
 */
function insertionSort(inputArr: Phaser.GameObjects.Bob[], coord: 'x' | 'y') {
  let n = inputArr.length;

  for (let i = 1; i < n; i++) {
    // Choosing the first element in our unsorted subarray
    let current = inputArr[i];
    // The last element of our sorted subarray
    let j = i - 1;

    while (j > -1 && current[coord] < inputArr[j][coord]) {
      inputArr[j + 1] = inputArr[j];
      j--;
    }
    inputArr[j + 1] = current;
  }

  return inputArr;
}

export class AutoTile {
  name: string;
  textureUrlsOrPaths: string[];
  jsonPathOrUrl: string;
  onCreate: (scene: GameScene, autoTile: AutoTile) => AutoTile;
  bobsX: Phaser.GameObjects.Bob[];
  bobsY: Phaser.GameObjects.Bob[];
  blitter: Phaser.GameObjects.Blitter;
  private needsSorting: boolean = true;

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
    this.bobsX = [];
    this.bobsY = [];

    setInterval(() => {
      if (this.needsSorting === true) {
        insertionSort(this.bobsX, 'x');
        insertionSort(this.bobsY, 'y');
        this.needsSorting = false;
      }
    }, BLITTER_SORT_DELAY);
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
    this.blitter = scene.add.blitter(0, 0, this.name);
    // this.onCreate(scene, this);
  }

  /**
   *
   */
  addTile(scene: GameScene, x: number, y: number, name: string) {
    const bob = this.blitter.create(x, y, name);

    if (this.bobsX[0] && x < this.bobsX[0].x) {
      this.bobsX.unshift(bob);
    } else {
      this.bobsX.push(bob);
    }

    if (this.bobsY[0] && y < this.bobsY[0].y) {
      this.bobsY.unshift(bob);
    } else {
      this.bobsY.push(bob);
    }

    this.needsSorting = true;

    return bob;
  }

  /**
   *
   */
  static update(scene: GameScene) {
    const currentX = scene.cameras.main.worldView.x;
    const currentY = scene.cameras.main.worldView.y;

    const leftBound = currentX - TILE_WIDTH * 3;
    const rightBound = currentX + VIEWPORT_WIDTH * 1.5 + TILE_WIDTH * 3;
    const upperBound = currentY - TILE_HEIGHT * 3;
    const lowerBound = currentY + VIEWPORT_HEIGHT * 1.5 + TILE_HEIGHT * 3;

    const bobXLength = scene.autotile.bobsX.length;
    const bpbYLength = scene.autotile.bobsY.length;

    for (let i = bobXLength; i > 0; i--) {
      const tile = scene.autotile.bobsX[i];
      if (tile && tile.x > rightBound) {
        tile.visible = false;
      } else {
        break;
      }
    }

    for (let i = 0; i < bobXLength; i++) {
      const tile = scene.autotile.bobsX[i];
      if (tile && tile.x < leftBound) {
        tile.visible = false;
      } else {
        break;
      }
    }

    document.getElementById('debug').innerHTML = `
    <div>Current X: ${currentX} / ${
      scene.cameras.main.worldView.width
    }x${VIEWPORT_HEIGHT}</div>
    <div>Current Y: ${currentY}</div>
    <div>Left Bound: ${leftBound}</div>
    <div>Right Bound: ${rightBound}</div>
    <div>Upper Bound: ${upperBound}</div>
    <div>Lower Bound: ${lowerBound}</div>
    <div>Purge X: ${scene.autotile.blitter.getRenderList().length}</div>
  `;
  }
}
