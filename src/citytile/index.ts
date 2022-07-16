import {
  FOV_HEIGHT,
  FOV_WIDTH,
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
  cityXIndexOffset: number;
  fovWidth: number;
  fovHeight: number;

  constructor(
    scene: GameScene,
    name: string,
    textureUrlsOrPaths: string[],
    jsonPathOrUrl: string,
    cityWidth: number = 800, // @TODO
    cityHeight: number = 400, // @TODO
    fovWidth: number = FOV_WIDTH,
    fovHeight: number = FOV_HEIGHT
  ) {
    this.scene = scene;
    this.name = name;
    this.textureUrlsOrPaths = textureUrlsOrPaths;
    this.jsonPathOrUrl = jsonPathOrUrl;
    this.blitterMap = {};
    this.cityWidth = cityWidth;
    this.cityHeight = cityHeight;
    this.cityXIndexOffset = Math.ceil(cityWidth / TILE_WIDTH);
    this.fovWidth = fovWidth;
    this.fovHeight = fovHeight;
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

    const fovWidthOffset = this.fovWidth / -2;
    const fovHeightOffset = this.fovHeight / -2;

    const bounds = this.getBounds(fovWidthOffset, fovHeightOffset);

    // @TODO load faster
    const tileCommands = [];
    // const tileLength = Math.ceil(VIEWPORT_WIDTH / TILE_WIDTH);
    for (let y = 0; y < this.cityHeight; y += TILE_HEIGHT) {
      for (let x = 0; x < this.cityWidth; x += TILE_WIDTH) {
        tileCommands.push(
          ((x: number, y: number) => {
            return new Promise(() => {
              const tile = this.addTile(CityLayers.building, x, y, 'city1');

              if (
                x >= bounds.left &&
                x <= bounds.right &&
                y >= bounds.top &&
                y <= bounds.bottom
              ) {
                tile.visible = true;
              } else {
                tile.visible = false;
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
    this.lastCameraX = this.scene.cameras.main.x;
    this.lastCameraY = this.scene.cameras.main.y;
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
      Math.ceil(x / TILE_WIDTH) +
      Math.ceil(y / TILE_HEIGHT) * this.cityXIndexOffset
    );
  }

  /**
   *
   */
  getBounds(x: number, y: number) {
    const realX = x < 1 ? 1 : x;

    const realY = y < 1 ? 1 : y;

    const left = realX - TILE_WIDTH;
    const right = realX + this.fovWidth + TILE_WIDTH;
    const top = realY - TILE_HEIGHT;
    const bottom = realY + this.fovHeight + TILE_HEIGHT;

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
    const cameraX = this.scene.cameras.main.worldView.x + this.fovWidth / 2;
    const cameraY = this.scene.cameras.main.worldView.y + this.fovHeight / 2;

    if (this.lastCameraX === cameraX && this.lastCameraY === cameraY) {
      return;
    }

    const deleteTiles = [];
    const addTiles = [];
    const lastCameraX = this.lastCameraX;
    const lastCameraY = this.lastCameraY;
    const bounds = this.getBounds(cameraX, cameraY);
    const lastBounds = this.getBounds(lastCameraX, lastCameraY);

    // Left Bound
    const start = lastBounds.topLeftIndex - 1;
    const end = lastBounds.bottomLeftIndex + 1;
    const diff = lastBounds.topRightIndex - lastBounds.topLeftIndex;

    for (let i = start; i < end; i += this.cityXIndexOffset) {
      if (cameraX > lastCameraX) {
        // Moving left
        deleteTiles.push(i);

        const addIndex = i + diff;
        console.log([i, addIndex, addIndex, this.cityWidth]);
        if (addIndex * TILE_WIDTH <= this.cityWidth) {
          addTiles.push(addIndex);
        }
      } else {
        // Moving right\
      }
      // addTiles.push(Math.ceil(i + this.fovWidth / TILE_WIDTH) - 1);
    }

    // Adjust Tile Visibility
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
    }

    this.lastCameraX = cameraX;
    this.lastCameraY = cameraY;
    const date = new Date();

    document.getElementById('debug').innerHTML = `
      <div>Last Update: ${date.getHours()}:
        ${date.getMinutes()}:
        ${date.getSeconds()}</div>

      <div>Camera X: ${cameraX}</div>
      <div>Camera Y: ${cameraY}</div>
      <div>Last Camera X: ${lastCameraX}</div>
      <div>Last Camera Y: ${lastCameraY}</div>
      <br />
      <div>Top Left Index: ${bounds.topLeftIndex}</div>
      <div>Top Right Index: ${bounds.topRightIndex}</div>
      <div>Bottom Left Index: ${bounds.bottomLeftIndex}</div>
      <div>Bottom Right Index: ${bounds.bottomRightIndex}</div>
      <br />
      <div>Last Top Left Index: ${lastBounds.topLeftIndex}</div>
      <div>Last Top Right Index: ${lastBounds.topRightIndex}</div>
      <div>Last Bottom Left Index: ${lastBounds.bottomLeftIndex}</div>
      <div>Last Bottom Right Index: ${lastBounds.bottomRightIndex}</div>
      <br />

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
