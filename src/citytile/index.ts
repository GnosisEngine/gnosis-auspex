import { FOV_HEIGHT, FOV_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../config';
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
  cameraSynced: boolean = false;

  rects: {
    topLeft: Phaser.GameObjects.Rectangle;
    topRight: Phaser.GameObjects.Rectangle;
    bottomLeft: Phaser.GameObjects.Rectangle;
    bottomRight: Phaser.GameObjects.Rectangle;
  };

  constructor(
    scene: GameScene,
    name: string,
    textureUrlsOrPaths: string[],
    jsonPathOrUrl: string,
    cityWidth: number = 600, // @TODO
    cityHeight: number = 500, // @TODO
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

    // Force the first cull
    this.scene.cameras.main.dirty = true;
    this.lastCameraX = -(this.scene.cameras.main.x + this.fovWidth / 2);
    this.lastCameraY = -(this.scene.cameras.main.y + this.fovWidth / 2);

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
                x < bounds.right &&
                y >= bounds.top &&
                y < bounds.bottom
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

    // @TODO remove
    this.rects = {
      topLeft: this.scene.add
        .rectangle(bounds.left, bounds.top, TILE_WIDTH, TILE_HEIGHT)
        .setStrokeStyle(1, 0xff0000),
      topRight: this.scene.add
        .rectangle(bounds.right, bounds.top, TILE_WIDTH, TILE_HEIGHT)
        .setStrokeStyle(1, 0xff0000),
      bottomLeft: this.scene.add
        .rectangle(bounds.left, bounds.bottom, TILE_WIDTH, TILE_HEIGHT)
        .setStrokeStyle(1, 0xff0000),
      bottomRight: this.scene.add
        .rectangle(bounds.right, bounds.bottom, TILE_WIDTH, TILE_HEIGHT)
        .setStrokeStyle(1, 0xff0000),
    };
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

    // @TODO remove
    const rect = this.scene.add.rectangle(
      x + 12.5,
      y + 12.5,
      TILE_WIDTH,
      TILE_HEIGHT
    );
    rect.setStrokeStyle(1, 0x008f00);
    const index = this.getTileIndex(x, y);
    const text = this.scene.add.text(x, y, index.toString(), {
      fontFamily: 'serif',
      color: '#aaa',
    });
    text.setFontSize(10);

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
    const widthOffset = x - TILE_WIDTH;
    const left = widthOffset <= -TILE_WIDTH ? 0 : widthOffset;
    const right = x + this.fovWidth + TILE_WIDTH;

    const heightOffset = y - TILE_HEIGHT;
    const top = heightOffset <= -TILE_HEIGHT ? 0 : heightOffset;
    const bottom = y + this.fovHeight + TILE_HEIGHT;

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
      this.cameraSynced = true;
      return;
    }

    const deleteTiles = [];
    const addTiles = [];
    const lastCameraX = this.lastCameraX;
    const lastCameraY = this.lastCameraY;
    const lastBounds = this.getBounds(lastCameraX, lastCameraY);

    // @TOOD remove
    this.rects.topLeft.setPosition(lastBounds.left, lastBounds.top);
    this.rects.topRight.setPosition(lastBounds.right, lastBounds.top);
    this.rects.bottomLeft.setPosition(lastBounds.left, lastBounds.bottom);
    this.rects.bottomRight.setPosition(lastBounds.right, lastBounds.bottom);

    // Left Bound
    const rows = Math.ceil(
      (lastBounds.bottomLeftIndex - lastBounds.topLeftIndex) /
        this.cityXIndexOffset
    );
    const columns = lastBounds.topRightIndex - lastBounds.topLeftIndex;

    // Horizontal
    for (let row = 0; row < rows; row++) {
      const offset = row * this.cityXIndexOffset;

      if (cameraX > lastCameraX) {
        // Moving right
        if (lastBounds.right >= 0 && lastBounds.right <= this.cityWidth) {
          const index = lastBounds.topRightIndex + offset - 1;
          addTiles.push(index);
        }

        if (lastBounds.left > 0 && lastBounds.left < this.cityWidth) {
          deleteTiles.push(lastBounds.topLeftIndex + offset - 1);
        }
      } else if (cameraX < lastCameraX) {
        // Moving left
        if (
          lastBounds.left - TILE_WIDTH >= 0 &&
          lastBounds.left <= this.cityWidth &&
          lastBounds.right >= TILE_WIDTH
        ) {
          const index = lastBounds.topLeftIndex + offset - 1;
          addTiles.push(index);
        }

        if (
          lastBounds.right > -TILE_WIDTH &&
          lastBounds.right < this.cityWidth
        ) {
          deleteTiles.push(lastBounds.topRightIndex + offset);
        }
      }
    }
    /*
    // Vertical
    for (let column = 0; column <= columns; column++) {
      if (
        (column + lastBounds.topLeftIndex) % this.cityXIndexOffset === 0 &&
        lastBounds.left - TILE_WIDTH > 0
      ) {
        break;
      }

      const offset = column - this.cityXIndexOffset - 1;

      if (cameraY > lastCameraY) {
        // Moving down
        if (
          lastBounds.bottom > -TILE_HEIGHT &&
          lastBounds.bottom < this.cityHeight
        ) {
          const index = lastBounds.bottomLeftIndex + offset;
          addTiles.push(index);
        }

        if (
          lastBounds.top >= 0 &&
          lastBounds.top <= this.cityHeight &&
          lastBounds.bottom - lastBounds.top > this.fovHeight + TILE_HEIGHT
        ) {
          deleteTiles.push(lastBounds.topLeftIndex + offset);
        }
      } else if (cameraY < lastCameraY) {
        // Moving up
        if (
          lastBounds.top >= 0 &&
          lastBounds.top <= this.cityHeight &&
          lastBounds.bottom > 0
        ) {
          const index = lastBounds.topLeftIndex + offset;
          addTiles.push(index);
        }

        if (
          lastBounds.bottom > -TILE_HEIGHT &&
          lastBounds.bottom < this.cityHeight
        ) {
          deleteTiles.push(lastBounds.bottomLeftIndex + offset);
        }
      }
    }
*/
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
