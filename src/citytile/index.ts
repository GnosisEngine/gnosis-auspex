import { Game } from 'phaser';
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
  onCreate: (scene: GameScene, cityTile: CityTile) => CityTile;
  lastCameraX: number;
  lastCameraY: number;
  blitterMap: {
    [key: number]: Phaser.GameObjects.Blitter;
  };

  constructor(
    scene: GameScene,
    name: string,
    textureUrlsOrPaths: string[],
    jsonPathOrUrl: string
    // onCreate: () => CityTile
  ) {
    this.scene = scene;
    this.name = name;
    this.textureUrlsOrPaths = textureUrlsOrPaths;
    this.jsonPathOrUrl = jsonPathOrUrl;
    // this.onCreate = onCreate;
    this.blitterMap = {};
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

    // @TODO load faster
    const tileCommands = [];
    const tileLength = Math.ceil(VIEWPORT_WIDTH / TILE_WIDTH);
    for (let y = 0, yLen = VIEWPORT_HEIGHT; y < yLen; y += TILE_HEIGHT) {
      for (let x = 0, xLen = VIEWPORT_WIDTH; x < xLen; x += TILE_WIDTH) {
        tileCommands.push(
          ((x: number, y: number) => {
            return new Promise(() => {
              this.addTile(CityLayers.building, x, y, 'city1');
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

  getTileIndex(x: number, y: number, length: number) {
    return Math.floor(x / TILE_WIDTH) + Math.floor(y / TILE_HEIGHT) * length;
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

    const now = Date.now();

    this.lastCameraX = cameraX;
    this.lastCameraY = cameraY;

    const leftBound = cameraX - TILE_WIDTH;
    const rightBound = cameraX + VIEWPORT_WIDTH;
    const topBound = cameraY - TILE_HEIGHT;
    const bottomBound = cameraY + VIEWPORT_HEIGHT;

    const lastLeftBound = this.lastCameraX - TILE_WIDTH;
    const lastRightBound = this.lastCameraX + VIEWPORT_WIDTH;
    const lastTopBound = this.lastCameraY - TILE_HEIGHT;
    const lastBottomBound = this.lastCameraY + VIEWPORT_HEIGHT;

    let invis = 0,
      vis = 0;

    for (const index of CityLayerIndexes) {
      if (this.scene.getLayer(CityLayers[index]).visible === false) {
        continue;
      }

      const blitter = this.blitterMap[index];

      for (let i = 0, len = blitter.children.length; i < len; i++) {
        const tile = blitter.children.getAt(i);

        if (tile.visible === true) {
        } else if (tile.visible === false) {
        }

        tile.visible = true;
        vis += 1;

        if (tile.x > rightBound) {
          tile.visible = false;
          invis += 1;
          vis -= 1;
        } else if (tile.x < leftBound) {
          tile.visible = false;
          invis += 1;
          vis -= 1;
        } else if (tile.y > bottomBound) {
          tile.visible = false;
          invis += 1;
          vis -= 1;
        } else if (tile.y < topBound) {
          tile.visible = false;
          invis += 1;
          vis -= 1;
        }
      }
    }

    document.getElementById('debug').innerHTML = `
    <div>Update: ${Date.now()}</div>
    <div>Time: ${Date.now() - now}</div>
    <div>Camera X: ${cameraX}</div>
    <div>Camera Y: ${cameraY}</div>
    <div>Left Bound: ${leftBound}</div>
    <div>Right Bound: ${rightBound}</div>
    <div>Top Bound: ${topBound}</div>
    <div>Bottom Bound: ${bottomBound}</div>
    <div>Bobs: ${this.getBobCount()}</div>
    <div>Invis: ${invis}</div>
    <div>Vis: ${vis}</div>
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
