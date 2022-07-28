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
    cityWidth: number = 800, // @TODO
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
      widthOffset <= 0 ? this.halfTileWidth : widthOffset + this.halfTileWidth;

    const right =
      widthOffset + this.fovWidth >= rightEdge
        ? rightEdge
        : widthOffset + this.fovWidth + this.halfTileWidth;

    const top =
      heightOffset <= 0
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

  update() {
    const cameraX = this.scene.cameras.main.worldView.x + this.fovWidth / 2;
    const cameraY = this.scene.cameras.main.worldView.y + this.fovHeight / 2;

    if (this.lastCameraX === cameraX && this.lastCameraY === cameraY) {
      this.cameraSynced = true;
      return;
    }

    const showTiles = [];
    const hideTiles = [];

    const cityLeftLimit = -TILE_WIDTH;
    const cityTopLimit = -TILE_HEIGHT;
    const cityRightLimit = this.cityWidth + TILE_WIDTH;
    const cityBottomLimit = this.cityHeight + TILE_HEIGHT;

    const deadZoneLeftX = cameraX - TILE_WIDTH;
    const deadZoneTopY = cameraY - TILE_WIDTH;
    const deadZoneRightX = cameraX + this.fovWidth + TILE_WIDTH;
    const deadZoneBottomY = cameraY + this.fovHeight + TILE_WIDTH;

    const left =
      deadZoneLeftX < cityLeftLimit
        ? cityLeftLimit
        : deadZoneLeftX > cityRightLimit
        ? cityRightLimit
        : deadZoneLeftX;

    const right =
      deadZoneRightX < cityLeftLimit
        ? cityLeftLimit
        : deadZoneRightX > cityRightLimit
        ? cityRightLimit
        : deadZoneRightX;

    const top =
      deadZoneTopY < cityTopLimit
        ? cityTopLimit
        : deadZoneTopY > cityBottomLimit
        ? cityBottomLimit
        : deadZoneTopY;

    const bottom =
      deadZoneBottomY < cityTopLimit
        ? cityTopLimit
        : deadZoneBottomY > cityBottomLimit
        ? cityBottomLimit
        : deadZoneBottomY;

    const deadZone: {
      [key: string]: any;
    } = {
      topLeftX: left,
      topLeftY: top,
      topRightX: right,
      topRightY: top,
      bottomLeftX: left,
      bottomLeftY: bottom,
      bottomRightX: right,
      bottomRightY: bottom,
      leftRange: {
        start: top,
        end: bottom,
        fixed: left,
      },
      rightRange: {
        start: top,
        end: bottom,
        fixed: right,
      },
      topRange: {
        start: left,
        end: right,
        fixed: top,
      },
      bottomRange: {
        start: left,
        end: right,
        fixed: bottom,
      },
    };

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

    // @TOOD remove
    const date = new Date();
    document.getElementById('debug').innerHTML = `
    `;

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
