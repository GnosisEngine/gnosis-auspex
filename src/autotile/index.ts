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
function insertionSort(
  inputArr: Phaser.GameObjects.Blitter[],
  coord: 'x' | 'y'
) {
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
  blittersX: Phaser.GameObjects.Blitter[];
  blittersY: Phaser.GameObjects.Blitter[];
  blitterList: Phaser.GameObjects.DisplayList;
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
    this.blittersX = [];
    this.blittersY = [];

    setInterval(() => {
      if (this.needsSorting === true) {
        insertionSort(this.blittersX, 'x');
        insertionSort(this.blittersY, 'y');
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
    const blitter = scene.add.blitter(-1000, -1000, '');
    this.blitterList = blitter.displayList;
    // this.onCreate(scene, this);
  }

  /**
   *
   */
  addTile(scene: GameScene, x: number, y: number) {
    const blitter = scene.add.blitter(x, y, this.name);

    if (this.blittersX[0] && x < this.blittersX[0].x) {
      this.blittersX.unshift(blitter);
    } else {
      this.blittersX.push(blitter);
    }

    if (this.blittersY[0] && y < this.blittersY[0].y) {
      this.blittersY.unshift(blitter);
    } else {
      this.blittersY.push(blitter);
    }

    this.needsSorting = true;

    return blitter;
  }

  /**
   *
   */
  static update(scene: GameScene, autotile: AutoTile) {
    const currentX = scene.cameras.main.worldView.x;
    const currentY = scene.cameras.main.worldView.y;

    const leftBound = currentX - TILE_WIDTH * 3;
    const rightBound = currentX + VIEWPORT_WIDTH * 1.5 + TILE_WIDTH * 3;
    const upperBound = currentY - TILE_HEIGHT * 3;
    const lowerBound = currentY + VIEWPORT_HEIGHT * 1.5 + TILE_HEIGHT * 3;

    document.getElementById('debug').innerHTML = `
      <div>Current X: ${currentX} / ${
      scene.cameras.main.worldView.width
    }x${VIEWPORT_HEIGHT}</div>
      <div>Current Y: ${currentY}</div>
      <div>Left Bound: ${leftBound}</div>
      <div>Right Bound: ${rightBound}</div>
      <div>Upper Bound: ${upperBound}</div>
      <div>Lower Bound: ${lowerBound}</div>
      <div>Display List: ${(autotile.blitterList || []).length}</div>
    `;

    const blitterXLength = autotile.blittersX.length;
    const blitterYLength = autotile.blittersY.length;
    const purgeX: number[] = [];
    const purgeY: number[] = [];

    for (let i = 0; i < blitterXLength; i++) {
      if (autotile.blittersX[i].x < leftBound) {
        autotile.blittersX[i].destroy();
        purgeX.push(i);
      } else {
        break;
      }
    }
  }
}
