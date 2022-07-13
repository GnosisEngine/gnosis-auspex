import {
  TILE_HEIGHT,
  TILE_WIDTH,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
} from '../config';
import { GameScene } from '../scenes';

export enum CityLayers {
  sky,
  cityscape,
  rooms,
  building,
  tunnel,
  tunnelAtmosphere,
  street,
  people,
  glowBackground,
  glowForeground,
  weather,
  ground,
}

export const CityLayerIndexes = Object.keys(CityLayers)
  .filter((key) => isNaN(Number(key)) === false)
  .map((key) => Number(key));

export const CityLayerNames = Object.keys(CityLayers).filter(
  (key) => isNaN(Number(key)) === true
);

export class CityTile {
  name: string;
  scene: GameScene;
  textureUrlsOrPaths: string[];
  jsonPathOrUrl: string;
  lastCameraX: number;
  lastCameraY: number;
  blitterMap: {
    [key: number]: Phaser.GameObjects.Blitter;
  };
  cityWidth: number;
  cityHeight: number;
  cityWidthIndexOffset: number;

  constructor(
    scene: GameScene,
    name: string,
    textureUrlsOrPaths: string[],
    jsonPathOrUrl: string,
    cityWidth: number = VIEWPORT_WIDTH * 3,
    cityHeight: number = VIEWPORT_HEIGHT * 3
  ) {
    this.scene = scene;
    this.name = name;
    this.textureUrlsOrPaths = textureUrlsOrPaths;
    this.jsonPathOrUrl = jsonPathOrUrl;
    this.blitterMap = {};
    this.cityWidth = cityWidth;
    this.cityHeight = cityHeight;
    this.cityWidthIndexOffset = Math.ceil(cityWidth / TILE_WIDTH);
  }

  /**
   *
   */
  preload() {
    this.scene.loadAtlas(
      this.name,
      this.textureUrlsOrPaths,
      this.jsonPathOrUrl
    );
  }

  /**
   *
   */
  create() {
    // Make city layers and add a blitter to each
    for (const index of CityLayerIndexes) {
      const layerName = CityLayers[index];
      const layer = this.scene.addLayer(layerName);
      const blitter = this.scene.make.blitter({
        x: 0,
        y: 0,
        key: this.name,
        add: true,
      });
      layer.add(blitter);
      this.blitterMap[index] = blitter;
    }

    const bounds = this.getBounds(
      this.scene.cameras.main.worldView.x,
      this.scene.cameras.main.worldView.y
    );

    // @TODO load faster
    const tileCommands = [];
    const tileLength = Math.ceil(VIEWPORT_WIDTH / TILE_WIDTH);
    for (let y = 0, yLen = VIEWPORT_HEIGHT; y < yLen; y += TILE_HEIGHT) {
      for (let x = 0; x < this.cityWidth; x += TILE_WIDTH) {
        tileCommands.push(
          ((x: number, y: number) => {
            return new Promise(() => {
              const tile = this.addTile(CityLayers.building, x, y, 'city1');

              if (
                tile.x < bounds.right &&
                tile.x > bounds.left &&
                tile.y < bounds.bottom &&
                tile.y > bounds.top
              ) {
                tile.visible = true;
              }
            });
          })(x, y)
        );
      }
    }

    Promise.all(tileCommands);

    this.showOnlyLayers([CityLayers.building]);

    // Force the first cull
    this.scene.cameras.main.dirty = true;
  }

  /**
   *
   */
  showOnlyLayers(layerIndexes: number[]) {
    for (const index of CityLayerIndexes) {
      if (layerIndexes.indexOf(index) > -1) {
        this.scene.getLayer(CityLayers[index]).visible = true;
      } else {
        this.scene.getLayer(CityLayers[index]).visible = false;
      }
    }
  }

  /**
   *
   */
  addTile(layerIndex: number, x: number, y: number, name: string) {
    const blitter = this.blitterMap[layerIndex];
    const bob = blitter.create(x, y, name);
    bob.visible = false;
    return bob;
  }

  /**
   *
   */
  getBobCount() {
    let result = 0;

    for (const index of CityLayerIndexes) {
      const layer = this.scene.getLayer(CityLayers[index]);

      if (layer === undefined || layer.visible === false) {
        continue;
      }

      const blitter = this.blitterMap[index];
      result += blitter.children.length;
    }

    return result;
  }

  /**
   *
   */
  getTileIndex(x: number, y: number) {
    return (
      Math.floor(x / TILE_WIDTH) + Math.floor(y / TILE_HEIGHT) * this.cityWidth
    );
  }

  /**
   *
   */
  getBounds(x: number, y: number) {
    const left = x - TILE_WIDTH;
    const right = x + VIEWPORT_WIDTH;
    const top = y - TILE_HEIGHT;
    const bottom = y + VIEWPORT_HEIGHT;

    return {
      left,
      right,
      top,
      bottom,
      topLeftIndex: this.getTileIndex(left, top),
      topRightIndex: this.getTileIndex(right, top),
      bottomLeftIndex: this.getTileIndex(left, bottom),
      bottomRightIndex: this.getTileIndex(right, bottom),
    };
  }

  /**
   *
   */
  update() {
    const cameraX = this.scene.cameras.main.worldView.x;
    const cameraY = this.scene.cameras.main.worldView.y;

    if (this.lastCameraX === cameraX && this.lastCameraY === cameraY) {
      return;
    }

    const deleteTiles = [];
    const addTiles = [];
    const lastCameraX = this.lastCameraX;
    const lastCameraY = this.lastCameraY;
    const bounds = this.getBounds(cameraX, cameraY);
    const lastBounds = this.getBounds(lastCameraX, lastCameraY);

    if (
      lastBounds.topLeftIndex > -1 &&
      bounds.topLeftIndex !== lastBounds.topLeftIndex
    ) {
      for (
        let i = lastBounds.topLeftIndex;
        i < lastBounds.bottomLeftIndex;
        i++
      ) {
        deleteTiles.push(i);
        addTiles.push(i + this.cityWidthIndexOffset);
      }

      //addTiles.push()
    }
    /*
    if (
      lastBounds.topRightIndex > -1 &&
      bounds.topRightIndex !== lastBounds.topRightIndex
    ) {
      deleteTiles.push(lastBounds.topRightIndex);
      //addTiles.push()
    }

    if (
      lastBounds.bottomLeftIndex > -1 &&
      bounds.bottomLeftIndex !== lastBounds.bottomLeftIndex
    ) {
      deleteTiles.push(lastBounds.bottomLeftIndex);
      //addTiles.push()
    }

    if (
      lastBounds.bottomRightIndex > -1 &&
      bounds.bottomRightIndex !== lastBounds.bottomRightIndex
    ) {
      deleteTiles.push(lastBounds.bottomRightIndex);
      //addTiles.push()
    }
*/
    for (const index of CityLayerIndexes) {
      if (this.scene.getLayer(CityLayers[index]).visible === false) {
        continue;
      }

      const blitter = this.blitterMap[index];

      for (const tileIndex of deleteTiles) {
        const tile = blitter.children.getAt(tileIndex);
        if (tile) {
          tile.visible = false;
        }
      }

      for (const tileIndex of addTiles) {
        const tile = blitter.children.getAt(tileIndex);
        if (tile) {
          tile.visible = true;
        }
      }
      /*
      for (let i = 0, len = blitter.children.length; i < len; i++) {
        const tile = blitter.children.getAt(i);

        if (tile.visible === true) {
        } else if (tile.visible === false) {
        }

        tile.visible = true;
        vis += 1;

        if (tile.x > bounds.right) {
          tile.visible = false;
          invis += 1;
          vis -= 1;
        } else if (tile.x < bounds.left) {
          tile.visible = false;
          invis += 1;
          vis -= 1;
        } else if (tile.y > bounds.bottom) {
          tile.visible = false;
          invis += 1;
          vis -= 1;
        } else if (tile.y < bounds.top) {
          tile.visible = false;
          invis += 1;
          vis -= 1;
        }
      }
      */

      this.lastCameraX = cameraX;
      this.lastCameraY = cameraY;
    }

    document.getElementById('debug').innerHTML = `
      <div>Camera X: ${cameraX}</div>
      <div>Camera Y: ${cameraY}</div>
      <div>Left Bound: ${bounds.left}</div>
      <div>Right Bound: ${bounds.right}</div>
      <div>Top Bound: ${bounds.top}</div>
      <div>Bottom Bound: ${bounds.bottom}</div>
      <div>Bobs: ${this.getBobCount()}</div>

      <div>Top Left Index: ${bounds.topLeftIndex}</div>
      <div>Top Right Index: ${bounds.topRightIndex}</div>
      <div>Bottom Left Index: ${bounds.bottomLeftIndex}</div>
      <div>Bottom Right Index: ${bounds.bottomRightIndex}</div>

      <div>Last Top Left Index: ${lastBounds.topLeftIndex}</div>
      <div>Last Top Right Index: ${lastBounds.topRightIndex}</div>
      <div>Last Bottom Left Index: ${lastBounds.bottomLeftIndex}</div>
      <div>Last Bottom Right Index: ${lastBounds.bottomRightIndex}</div>

      <div>Delete: ${JSON.stringify(deleteTiles)}</div>
      <div>Add: ${JSON.stringify(addTiles)}</div>
    `;
  }

  /**
   *
   */
  makeBuilding(scene: GameScene, stories: number) {
    const group = scene.add.group();
    // const bob = this.addTile(0, 0, 'city0');

    for (let i = 0; i < stories; i++) {
      const story = this.makeStory;
    }
  }

  /**
   *
   */
  makeStory(scene: GameScene) {}

  /**
   *
   */
  makeRoom(scene: GameScene) {}

  /**
   *
   */
  makeStreetRoom(scene: GameScene) {}

  /**
   *
   */
  makeGround(scene: GameScene) {}

  /**
   *
   */
  makeTunnel(scene: GameScene) {}
}
