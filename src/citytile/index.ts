import { FOV_HEIGHT, FOV_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../config';
import { GameScene } from '../scenes';
import { Chunks } from './chunks';

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
  ringWidth: number;
  ringHeight: number;
  tilesPerCityRow: number;
  fovWidth: number;
  fovHeight: number;
  cameraSynced: boolean = false;
  halfTileWidth = TILE_WIDTH / 2;
  halfTileHeight = TILE_WIDTH / 2;
  chunks: Chunks

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
    ringWidth: number = 1920, // @TODO make this adjustable
    ringHeight: number = 1600, // @TODO make this adjustable
    fovWidth: number = FOV_WIDTH,
    fovHeight: number = FOV_HEIGHT
  ) {
    this.scene = scene;
    this.name = name;
    this.textureUrlsOrPaths = textureUrlsOrPaths;
    this.jsonPathOrUrl = jsonPathOrUrl;
    this.blitterMap = {};
    this.ringWidth = ringWidth;
    this.ringHeight = ringHeight;
    this.tilesPerCityRow = Math.ceil(ringWidth / TILE_WIDTH);
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
        key: this.name,
        add: false,
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

    // @TODO this is now the chunk manager
    this.chunks = new Chunks(this.name, this.scene, this.fovWidth, this.fovHeight, this.lastCameraX, this.lastCameraY)

    // @TODO load faster
    const tileCommands = [];
    // @REVIEW THIS
    // We can make lots of blitters very fast, so the key is to create based on fov offsets
    // Simple tricks aren't working on these two for loops, so more thinking is needed

    for (let y = 0; y < this.ringHeight; y += TILE_HEIGHT) {
      for (let x = 0; x < this.ringWidth; x += TILE_WIDTH) {
        tileCommands.push(
          ((x: number, y: number) => {
            return new Promise(() => {
              const tile = this.addTile(CityLayers.building, x, y, 'city1');

              if (
                x >= bounds.left + TILE_WIDTH &&
                x < bounds.right - TILE_WIDTH &&
                y >= bounds.top + TILE_HEIGHT &&
                y < bounds.bottom - TILE_HEIGHT
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

    this.showOnlyLayers([CityLayers.building]); // @TODO think about this

    // @TODO move to debugger.ts
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
    /*
    const rect = this.scene.add.rectangle(
      x + TILE_WIDTH / 2,
      y + TILE_HEIGHT / 2,
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
*/
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
    const cityLeftLimit = -TILE_WIDTH;
    const cityTopLimit = -TILE_HEIGHT;
    const cityRightLimit = this.ringWidth + TILE_WIDTH;
    const cityBottomLimit = this.ringHeight + TILE_HEIGHT;

    const deadZoneLeftX = x - TILE_WIDTH;
    const deadZoneTopY = y - TILE_WIDTH;
    const deadZoneRightX = x + this.fovWidth + TILE_WIDTH;
    const deadZoneBottomY = y + this.fovHeight + TILE_WIDTH;

    return {
      chunkX: ~~(x / this.fovWidth),
      chunkY: ~~(y / this.fovHeight),
      left:
        deadZoneLeftX < cityLeftLimit
          ? cityLeftLimit
          : deadZoneLeftX > cityRightLimit
          ? cityRightLimit
          : deadZoneLeftX,

      right:
        deadZoneRightX < cityLeftLimit
          ? cityLeftLimit
          : deadZoneRightX > cityRightLimit
          ? cityRightLimit
          : deadZoneRightX,

      top:
        deadZoneTopY < cityTopLimit
          ? cityTopLimit
          : deadZoneTopY > cityBottomLimit
          ? cityBottomLimit
          : deadZoneTopY,

      bottom:
        deadZoneBottomY < cityTopLimit
          ? cityTopLimit
          : deadZoneBottomY > cityBottomLimit
          ? cityBottomLimit
          : deadZoneBottomY,
    };
  }

  update() {
    // @TODO should consider tile X and tile Y to be a modulus of tileWidthOffset so chunks can wrap around
    const cameraX = this.scene.cameras.main.worldView.x + this.fovWidth / 2;
    const cameraY = this.scene.cameras.main.worldView.y + this.fovHeight / 2;

    if (this.lastCameraX === cameraX && this.lastCameraY === cameraY) {
      this.cameraSynced = true;
      return;
    }

    this.chunks.update(cameraX, cameraY)

    const showTiles = [];
    const hideTiles = [];

    const cityLeftLimit = -TILE_WIDTH;
    const cityTopLimit = -TILE_HEIGHT;
    const cityRightLimit = this.ringWidth + TILE_WIDTH;
    const cityBottomLimit = this.ringHeight + TILE_HEIGHT;

    const deadZoneLeftX = cameraX - TILE_WIDTH;
    const deadZoneTopY = cameraY - TILE_WIDTH;
    const deadZoneRightX = cameraX + this.fovWidth + TILE_WIDTH;
    const deadZoneBottomY = cameraY + this.fovHeight + TILE_WIDTH;

    const bounds = this.getBounds(cameraX, cameraY);

    const deadZone: {
      [key: string]: any;
    } = {
      // @TODO move to debugger.ts v
      topLeftX: bounds.left,
      topLeftY: bounds.top,
      topRightX: bounds.right,
      topRightY: bounds.top,
      bottomLeftX: bounds.left,
      bottomLeftY: bounds.bottom,
      bottomRightX: bounds.right,
      bottomRightY: bounds.bottom,
      // @TODO move to debugger.ts ^
      leftRange: {
        start: bounds.top,
        end: bounds.bottom,
        fixed: bounds.left,
      },
      rightRange: {
        start: bounds.top,
        end: bounds.bottom,
        fixed: bounds.right,
      },
      topRange: {
        start: bounds.left,
        end: bounds.right,
        fixed: bounds.top,
      },
      bottomRange: {
        start: bounds.left,
        end: bounds.right,
        fixed: bounds.bottom,
      },
    };

    // @TODO simplify?
    if (cameraX > this.lastCameraX) {
      // Moving right

      // Show loop
      for (
        let y = deadZone.rightRange.start + TILE_HEIGHT;
        y <= deadZone.rightRange.end - TILE_HEIGHT;
        y += TILE_HEIGHT
      ) {
        const x = deadZone.rightRange.fixed - TILE_WIDTH;

        if (x > cityLeftLimit + TILE_WIDTH && x < cityRightLimit - TILE_WIDTH) {
          const showIndex = this.getTileIndex(x, y);
          showTiles.push(showIndex);
        }
      }

      // hide loop
      for (
        let y = deadZone.leftRange.start;
        y < deadZone.leftRange.end;
        y += TILE_HEIGHT
      ) {
        const x = deadZone.leftRange.fixed;

        if (x > cityLeftLimit + TILE_WIDTH && x < cityRightLimit - TILE_WIDTH) {
          const hideIndex = this.getTileIndex(x, y);
          hideTiles.push(hideIndex);
        }
      }
    } else if (cameraX < this.lastCameraX) {
      // moving left

      // Show loop
      for (
        let y = deadZone.leftRange.start + TILE_HEIGHT;
        y <= deadZone.leftRange.end - TILE_HEIGHT;
        y += TILE_HEIGHT
      ) {
        const x = deadZone.leftRange.fixed + TILE_WIDTH;

        if (x > cityLeftLimit + TILE_WIDTH && x < cityRightLimit - TILE_WIDTH) {
          const showIndex = this.getTileIndex(x, y);
          showTiles.push(showIndex);
        }
      }

      // hide loop
      for (
        let y = deadZone.rightRange.start;
        y < deadZone.rightRange.end;
        y += TILE_HEIGHT
      ) {
        const x = deadZone.rightRange.fixed;

        if (x > cityLeftLimit + TILE_WIDTH && x < cityRightLimit - TILE_WIDTH) {
          const hideIndex = this.getTileIndex(x, y);
          hideTiles.push(hideIndex);
        }
      }
    }

    if (cameraY > this.lastCameraY) {
      // Moving down

      // Show loop
      for (
        let x = deadZone.bottomRange.start + TILE_WIDTH;
        x < deadZone.bottomRange.end - TILE_WIDTH;
        x += TILE_WIDTH
      ) {
        const y = deadZone.bottomRange.fixed - TILE_WIDTH;

        if (
          y > cityTopLimit + TILE_HEIGHT &&
          y < cityBottomLimit - TILE_HEIGHT
        ) {
          const showIndex = this.getTileIndex(x, y);
          showTiles.push(showIndex);
        }
      }

      // hide loop
      for (
        let x = deadZone.topRange.start;
        x < deadZone.topRange.end;
        x += TILE_WIDTH
      ) {
        const y = deadZone.topRange.fixed;

        if (
          y > cityTopLimit + TILE_HEIGHT &&
          y < cityBottomLimit - TILE_HEIGHT
        ) {
          const hideIndex = this.getTileIndex(x, y);
          hideTiles.push(hideIndex);
        }
      }
    } else if (cameraY < this.lastCameraY) {
      // moving up

      // Show loop
      for (
        let x = deadZone.topRange.start + TILE_WIDTH;
        x < deadZone.topRange.end - TILE_WIDTH;
        x += TILE_WIDTH
      ) {
        const y = deadZone.topRange.fixed + TILE_WIDTH;

        if (
          y > cityTopLimit + TILE_HEIGHT &&
          y < cityBottomLimit - TILE_HEIGHT
        ) {
          const showIndex = this.getTileIndex(x, y);
          showTiles.push(showIndex);
        }
      }

      // hide loop
      for (
        let x = deadZone.bottomRange.start;
        x < deadZone.bottomRange.end;
        x += TILE_WIDTH
      ) {
        const y = deadZone.bottomRange.fixed;

        if (
          y > cityTopLimit + TILE_HEIGHT &&
          y < cityBottomLimit - TILE_HEIGHT
        ) {
          const hideIndex = this.getTileIndex(x, y);
          hideTiles.push(hideIndex);
        }
      }
    }

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

    // @TOOD move to debugger.ts
    this.rects.topLeft.setPosition(deadZone.topLeftX, deadZone.topLeftY);
    this.rects.topRight.setPosition(deadZone.topRightX, deadZone.topRightY);
    this.rects.bottomLeft.setPosition(
      deadZone.bottomLeftX,
      deadZone.bottomLeftY
    );
    this.rects.bottomRight.setPosition(
      deadZone.bottomRightX,
      deadZone.bottomRightY
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
