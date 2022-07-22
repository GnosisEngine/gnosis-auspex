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
  tilesPerCityRow: number;
  fovWidth: number;
  fovHeight: number;
  cameraSynced: boolean = false;
  halfTileWidth = TILE_WIDTH / 2;
  halfTileHeight = TILE_WIDTH / 2;

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
    this.tilesPerCityRow = Math.ceil(cityWidth / TILE_WIDTH);
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
                x + TILE_WIDTH >= bounds.left.value &&
                x - TILE_WIDTH < bounds.right.value &&
                y + TILE_HEIGHT >= bounds.top.value &&
                y - TILE_HEIGHT < bounds.bottom.value
              ) {
                // tile.visible = true; @TODO bring this back
              } else {
                // tile.visible = false; @TODO bring this back
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
        .rectangle(bounds.left.value, bounds.top.value, TILE_WIDTH, TILE_HEIGHT)
        .setStrokeStyle(1, 0xff0000),
      topRight: this.scene.add
        .rectangle(
          bounds.right.value,
          bounds.top.value,
          TILE_WIDTH,
          TILE_HEIGHT
        )
        .setStrokeStyle(1, 0xff0000),
      bottomLeft: this.scene.add
        .rectangle(
          bounds.left.value,
          bounds.bottom.value,
          TILE_WIDTH,
          TILE_HEIGHT
        )
        .setStrokeStyle(1, 0xff0000),
      bottomRight: this.scene.add
        .rectangle(
          bounds.right.value,
          bounds.bottom.value,
          TILE_WIDTH,
          TILE_HEIGHT
        )
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
    return ~~(x / TILE_WIDTH) + ~~(y / TILE_HEIGHT) * this.tilesPerCityRow;
  }

  /**
   *
   */
  getBounds(x: number, y: number) {
    const widthOffset = x - this.halfTileWidth;
    const heightOffset = y - this.halfTileHeight;

    const rightEdge = this.cityWidth - this.halfTileWidth;
    const bottomEdge = this.cityHeight - this.halfTileHeight;

    const left =
      widthOffset <= this.halfTileWidth
        ? this.halfTileWidth
        : widthOffset + this.halfTileWidth;

    const right =
      widthOffset + this.fovWidth >= rightEdge
        ? rightEdge
        : widthOffset + this.fovWidth + this.halfTileWidth;

    const top =
      heightOffset <= this.halfTileHeight
        ? this.halfTileHeight
        : heightOffset + this.halfTileHeight;

    const bottom =
      heightOffset + this.fovHeight >= bottomEdge
        ? bottomEdge
        : heightOffset + this.fovHeight + this.halfTileHeight;

    return {
      left: {
        value: left,
        onEdge: left <= this.halfTileWidth,
      },
      right: {
        value: right,
        onEdge: right >= rightEdge,
      },
      top: {
        value: top,
        onEdge: top <= this.halfTileHeight,
      },
      bottom: {
        value: bottom,
        onEdge: bottom >= bottomEdge,
      },
      indexes: {
        topLeft: this.getTileIndex(left, top),
        topRight: this.getTileIndex(right, top),
        bottomLeft: this.getTileIndex(left, bottom),
        bottomRight: this.getTileIndex(right, bottom),
      },
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

    const showTiles = [];
    const hideTiles = [];
    const lastCameraX = this.lastCameraX;
    const lastCameraY = this.lastCameraY;
    const bounds = this.getBounds(cameraX, cameraY);
    const lastBounds = this.getBounds(lastCameraX, lastCameraY);

    // Left Bound
    const rows = Math.ceil(
      (lastBounds.indexes.bottomLeft - lastBounds.indexes.topLeft) /
        this.tilesPerCityRow
    );
    const columns = lastBounds.indexes.topRight - lastBounds.indexes.topLeft;

    if (cameraX > lastCameraX) {
      // Moving right
      const rows = Math.ceil(
        (lastBounds.indexes.bottomLeft - lastBounds.indexes.topLeft) /
          this.tilesPerCityRow
      );

      for (let row = 0; row < rows; row++) {
        //const lastFeftIndex =
        //bounds.indexes.topLeft + row * this.tilesPerCityRow;
        const newRightIndex =
          bounds.indexes.topRight + row * this.tilesPerCityRow;

        //hideTiles.push(lastFeftIndex);
        showTiles.push(newRightIndex);
      }

      const date = new Date();
      document.getElementById('debug').innerHTML = `
        <div>Last Update: 
          ${date.getHours()}:
          ${date.getMinutes()}:
          ${date.getSeconds()}
        </div> 
        <div>row ${rows}</div>
        <div>rows ${rows}</div>
        <div>tilesPerCityRow ${this.tilesPerCityRow}</div>
        <div>topLeft ${lastBounds.indexes.topLeft}</div>
        <div>topRight ${lastBounds.indexes.topRight}</div>
        <div>bottomLeft ${lastBounds.indexes.bottomLeft}</div>
        <div>bottomRight ${lastBounds.indexes.bottomRight}</div>
      `;
    }

    /*
    // Horizontal
    for (let row = 0; row < rows; row++) {
      const offset = row * this.tilesPerCityRow;

      const adjustLeft =
        lastBounds.left > 0 && lastBounds.left < this.cityWidth;
      const adjustRight =
        lastBounds.right > 0 && lastBounds.right < this.cityWidth;

      const leftIndex = lastBounds.topLeftIndex + offset - 1;
      const rightIndex = lastBounds.topRightIndex + offset - 1;

      if (cameraX > lastCameraX) {
        // Moving right
        if (adjustRight) {
          addTiles.push(rightIndex);
        }

        if (adjustLeft) {
          deleteTiles.push(leftIndex);
        }
      } else if (cameraX < lastCameraX) {
        // Moving left
        if (adjustLeft) {
          addTiles.push(leftIndex);
        }

        if (adjustRight) {
          deleteTiles.push(rightIndex);
        }
      }
    }

    // Vertical
    for (let column = 0; column < columns; column++) {
      const adjustTop =
        lastBounds.top >= 0 && lastBounds.top <= this.cityHeight;

      const adjustBottom =
        lastBounds.bottom > -TILE_HEIGHT && lastBounds.bottom < this.cityHeight;

      const offset = column - this.tilesPerCityRow;

      let topIndex = lastBounds.topLeftIndex + offset;
      let bottomIndex = lastBounds.bottomLeftIndex + offset;

      if (cameraY > lastCameraY) {
        // Moving down
        if (adjustBottom) {
          addTiles.push(bottomIndex);
        }

        if (adjustTop) {
          deleteTiles.push(topIndex);
        }
      } else if (cameraY < lastCameraY) {
        // Moving up
        if (adjustTop) {
          addTiles.push(topIndex);
        }

        if (adjustBottom) {
          deleteTiles.push(bottomIndex);
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

      for (const tileIndex of hideTiles) {
        const tile = blitter.children.getAt(tileIndex);

        if (tile) {
          tile.visible = false;
        }
      }

      for (const tileIndex of showTiles) {
        const tile = blitter.children.getAt(tileIndex);

        if (tile) {
          tile.visible = true;
        }
      }
    }

    // @TOOD remove
    this.rects.topLeft.setPosition(lastBounds.left.value, lastBounds.top.value);
    this.rects.topRight.setPosition(
      lastBounds.right.value,
      lastBounds.top.value
    );
    this.rects.bottomLeft.setPosition(
      lastBounds.left.value,
      lastBounds.bottom.value
    );
    this.rects.bottomRight.setPosition(
      lastBounds.right.value,
      lastBounds.bottom.value
    );

    this.lastCameraX = cameraX;
    this.lastCameraY = cameraY;
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
